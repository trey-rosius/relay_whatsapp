import * as cdk from 'aws-cdk-lib';
import { RemovalPolicies, Mixins, aws_iam as iam } from 'aws-cdk-lib';

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
  backendCDKPath: join(__dirname, 'index.ts')
});

// Attach least-privilege IAM policies to Lambda Execution Role
blocksStack.handler.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
    resources: ['*'],
  })
);

blocksStack.handler.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['events:PutEvents'],
    resources: ['*'],
  })
);

blocksStack.handler.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['secretsmanager:GetSecretValue'],
    resources: ['*'],
  })
);

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
    api: blocksStack
  });
}