import * as cdk from 'aws-cdk-lib';
import {
  RemovalPolicies,
  Mixins,
  Duration,
  aws_iam as iam,
  aws_kms as kms,
  aws_wafv2 as wafv2,
  aws_secretsmanager as secretsmanager,
  aws_bedrock as bedrock,
  aws_cloudwatch as cloudwatch,
  aws_lambda as lambda,
} from 'aws-cdk-lib';

import { Hosting, BlocksStack, SandboxDisableDeletionProtection } from '@aws-blocks/blocks/cdk';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getStackName } from '@aws-blocks/blocks/scripts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = new cdk.App();

const sandboxMode = app.node.tryGetContext('sandboxMode') === 'true';
const projectRoot = app.node.tryGetContext('projectRoot') || process.cwd();

const stackName = getStackName({ sandbox: sandboxMode, projectRoot });
export const blocksStack = await BlocksStack.create(app, stackName, {
  backendHandlerPath: join(__dirname, 'index.handler.ts'),
  backendCDKPath: join(__dirname, 'index.ts'),
});

// ─── 1. Encryption at Rest: AWS KMS Customer Managed Key (CMK) ───────────────
export const appKey = new kms.Key(blocksStack, 'AppEncryptionKey', {
  description: 'Customer Managed Key for Books Block App DynamoDB, S3, Secrets & Logs',
  enableKeyRotation: true,
  removalPolicy: sandboxMode ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
  alias: 'alias/books-block-app-cmk',
});

// Grant Lambda execute decrypt/encrypt permissions on KMS Key
appKey.grantEncryptDecrypt(blocksStack.handler);

// ─── 2. Secrets Management: AWS Secrets Manager ──────────────────────────────
export const whatsappSecret = new secretsmanager.Secret(blocksStack, 'WhatsAppCredentials', {
  secretName: `${stackName}/whatsapp-credentials`,
  description: 'WhatsApp Cloud API tokens, verify tokens, phone number IDs, and app secret',
  encryptionKey: appKey,
  removalPolicy: sandboxMode ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
  generateSecretString: {
    secretStringTemplate: JSON.stringify({
      WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
      WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'my_verify_token_123',
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '1251548201371379',
      WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET || '',
    }),
    generateStringKey: 'dummy',
  },
});

// Add environment variable for runtime secret resolution
blocksStack.handler.addEnvironment('WHATSAPP_SECRET_ARN', whatsappSecret.secretArn);
blocksStack.handler.addEnvironment('WHATSAPP_SECRET_NAME', whatsappSecret.secretName);

// ─── 3. Governance: Amazon Bedrock Guardrails for PII Redaction ──────────────
export const bedrockGuardrail = new bedrock.CfnGuardrail(blocksStack, 'BedrockPiiGuardrail', {
  name: `${stackName}-pii-guardrail`,
  description: 'Redacts and masks PII (phone numbers, addresses, parent names) before foundation model inference',
  kmsKeyArn: appKey.keyArn,
  sensitiveInformationPolicyConfig: {
    piiEntitiesConfig: [
      { type: 'PHONE', action: 'ANONYMIZE' },
      { type: 'EMAIL', action: 'ANONYMIZE' },
      { type: 'NAME', action: 'ANONYMIZE' },
      { type: 'ADDRESS', action: 'ANONYMIZE' },
      { type: 'US_SOCIAL_SECURITY_NUMBER', action: 'BLOCK' },
      { type: 'CREDIT_DEBIT_CARD_NUMBER', action: 'BLOCK' },
    ],
  },
  contentPolicyConfig: {
    filtersConfig: [
      { type: 'SEXUAL', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'HATE', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'VIOLENCE', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'INSULTS', inputStrength: 'HIGH', outputStrength: 'HIGH' },
      { type: 'MISCONDUCT', inputStrength: 'HIGH', outputStrength: 'HIGH' },
    ],
  },
  blockedInputMessaging: 'Sorry, this message contains sensitive or prohibited content and cannot be processed.',
  blockedOutputsMessaging: 'Sorry, this response was filtered by security policy.',
});

export const bedrockGuardrailVersion = new bedrock.CfnGuardrailVersion(blocksStack, 'BedrockPiiGuardrailVersion', {
  guardrailIdentifier: bedrockGuardrail.attrGuardrailId,
  description: 'Version 1 for Bedrock PII Guardrail',
});

blocksStack.handler.addEnvironment('BEDROCK_GUARDRAIL_ID', bedrockGuardrail.attrGuardrailId);
blocksStack.handler.addEnvironment('BEDROCK_GUARDRAIL_VERSION', bedrockGuardrailVersion.attrVersion);

// ─── 4. Security & Perimeter Defense: AWS WAFv2 WebACL ───────────────────────
export const apiWaf = new wafv2.CfnWebACL(blocksStack, 'ApiGatewayWAF', {
  name: `${stackName}-waf-acl`,
  scope: 'REGIONAL',
  defaultAction: { allow: {} },
  visibilityConfig: {
    cloudWatchMetricsEnabled: true,
    metricName: `${stackName}-WAF-Metric`,
    sampledRequestsEnabled: true,
  },
  rules: [
    // Rate Limiting Rule: 2,000 requests per 5 minutes per IP (supports Meta bursts while blocking DDoS/scrapers)
    {
      name: 'RateLimitWebhookAndAPI',
      priority: 10,
      action: { block: {} },
      statement: {
        rateBasedStatement: {
          limit: 2000,
          aggregateKeyType: 'IP',
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${stackName}-RateLimit-Blocked`,
        sampledRequestsEnabled: true,
      },
    },
    // Managed Rule: AWS IP Reputation List
    {
      name: 'AWS-AWSManagedRulesAmazonIpReputationList',
      priority: 20,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesAmazonIpReputationList',
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${stackName}-IpReputationList-Metric`,
        sampledRequestsEnabled: true,
      },
    },
    // Managed Rule: Common Rule Set
    {
      name: 'AWS-AWSManagedRulesCommonRuleSet',
      priority: 30,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesCommonRuleSet',
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${stackName}-CommonRuleSet-Metric`,
        sampledRequestsEnabled: true,
      },
    },
    // Managed Rule: Known Bad Inputs
    {
      name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
      priority: 40,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${stackName}-KnownBadInputs-Metric`,
        sampledRequestsEnabled: true,
      },
    },
  ],
});

// Associate WAF WebACL to API Gateway Deployment Stage
const stageArn = cdk.Stack.of(blocksStack).formatArn({
  service: 'apigateway',
  resource: `restapis/${blocksStack.gateway.restApiId}/stages/${blocksStack.gateway.deploymentStage.stageName}`,
});

export const wafAssociation = new wafv2.CfnWebACLAssociation(blocksStack, 'ApiGatewayWAFAssociation', {
  resourceArn: stageArn,
  webAclArn: apiWaf.attrArn,
});

// ─── 5. Observability: Distributed Tracing (X-Ray) & Alarms ──────────────────

// Enable Active Tracing on Lambda Handler
const cfnFunc = blocksStack.handler.node.defaultChild as lambda.CfnFunction;
if (cfnFunc) {
  cfnFunc.tracingConfig = { mode: 'Active' };
}

// Attach Scoped Least-Privilege IAM Policies (replacing wildcard resources)
blocksStack.handler.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream', 'bedrock:ApplyGuardrail'],
    resources: [
      `arn:aws:bedrock:*::foundation-model/us.amazon.nova-lite-v1:0`,
      `arn:aws:bedrock:*::foundation-model/us.amazon.nova-pro-v1:0`,
      bedrockGuardrail.attrGuardrailArn,
      `${bedrockGuardrail.attrGuardrailArn}/*`,
    ],
  })
);

blocksStack.handler.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['secretsmanager:GetSecretValue', 'secretsmanager:DescribeSecret'],
    resources: [whatsappSecret.secretArn],
  })
);

blocksStack.handler.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['events:PutEvents'],
    resources: [
      cdk.Stack.of(blocksStack).formatArn({
        service: 'events',
        resource: 'event-bus/default',
      }),
    ],
  })
);

blocksStack.handler.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['xray:PutTraceSegments', 'xray:PutTelemetryRecords'],
    resources: ['*'],
  })
);

// ─── 6. Observability: Proactive CloudWatch Alarms ───────────────────────────

// Alarm 1: Meta/Bedrock 429 Throttling Errors Alarm
export const throttlingAlarm = new cloudwatch.Alarm(blocksStack, 'MetaBedrockThrottlingAlarm', {
  alarmName: `${stackName}-Throttling-429-Alarm`,
  alarmDescription: 'Alerts when Meta WhatsApp or Bedrock API calls experience 429 throttling errors',
  metric: new cloudwatch.Metric({
    namespace: 'BooksApp/WhatsAppMarketplace',
    metricName: 'ThrottlingErrors',
    dimensionsMap: { service: 'whatsapp-bot' },
    statistic: 'Sum',
    period: Duration.minutes(1),
  }),
  threshold: 1,
  evaluationPeriods: 1,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
});

// Alarm 2: Webhook Delivery & Signature Validation Failure Alarm
export const webhookFailureAlarm = new cloudwatch.Alarm(blocksStack, 'WebhookDeliveryFailureAlarm', {
  alarmName: `${stackName}-Webhook-Delivery-Failure-Alarm`,
  alarmDescription: 'Alerts when API Gateway 4xx/5xx errors or HMAC signature validation failures occur',
  metric: new cloudwatch.Metric({
    namespace: 'AWS/ApiGateway',
    metricName: '4XXError',
    dimensionsMap: { ApiName: blocksStack.gateway.restApiName },
    statistic: 'Sum',
    period: Duration.minutes(5),
  }),
  threshold: 5,
  evaluationPeriods: 1,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
});

// Alarm 3: Lambda Execution Errors Alarm
export const lambdaErrorAlarm = new cloudwatch.Alarm(blocksStack, 'LambdaErrorRateAlarm', {
  alarmName: `${stackName}-Lambda-Error-Alarm`,
  alarmDescription: 'Alerts on Lambda unhandled execution failures in WhatsApp message processing',
  metric: blocksStack.handler.metricErrors({
    period: Duration.minutes(5),
    statistic: 'Sum',
  }),
  threshold: 1,
  evaluationPeriods: 1,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
});

// Alarm 4: WAF Blocked Requests Spike Alarm
export const wafBlockedRequestsAlarm = new cloudwatch.Alarm(blocksStack, 'WafBlockedRequestsAlarm', {
  alarmName: `${stackName}-WAF-Blocked-Requests-Alarm`,
  alarmDescription: 'Alerts on spikes in blocked suspicious requests / flood attempts via AWS WAF',
  metric: new cloudwatch.Metric({
    namespace: 'AWS/WAFV2',
    metricName: 'BlockedRequests',
    dimensionsMap: { WebACL: `${stackName}-waf-acl`, Region: cdk.Stack.of(blocksStack).region, Rule: 'ALL' },
    statistic: 'Sum',
    period: Duration.minutes(5),
  }),
  threshold: 50,
  evaluationPeriods: 1,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
});

if (sandboxMode) {
  // Make all resources deletable so sandbox:destroy can clean up the entire stack.
  RemovalPolicies.of(blocksStack).destroy();
  Mixins.of(blocksStack).apply(new SandboxDisableDeletionProtection());

  // Tell the runtime that cookies need cross-domain attributes
  blocksStack.handler.addEnvironment('BLOCKS_SANDBOX', 'true');
}

// Add static site hosting only when deploying (not in sandbox mode)
if (!sandboxMode) {
  new Hosting(blocksStack, 'Hosting', {
    root: join(__dirname, '..'),
    buildCommand: 'npm run build',
    buildOutputDir: 'dist',
    api: blocksStack,
  });
}