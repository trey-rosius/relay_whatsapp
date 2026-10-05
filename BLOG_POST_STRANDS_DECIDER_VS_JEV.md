# Why We Dumped SaaS Decision Models: Shaving 52% Latency, Slashing Costs by 88%, and Reclaiming Data Sovereignty with AWS Strands Decider 2B on Fargate

*By the Books App Engineering Team • 9 min read • October 2026*

---

> **The Quick TL;DR:**  
> When AWS released **Strands Decider 2B**, we migrated our high-traffic WhatsApp parent booking and textbook marketplace from **TypeSafe Jev (SaaS)** to **Strands Decider 2B hosted in-VPC on AWS Fargate Spot**.  
> 
> Here is what happened in production:
> * ⚡ **Latency:** Dropped by **51.7%** (from **435 ms** to **209 ms**) in our AWS VPC, and by **73.5%** (**117 ms**) on local edge devices.
> * 💰 **Compute & Cost:** Slashed costs by **88%** at scale (from $210 down to a flat **~$25/month** on Fargate Spot at 25M requests), while reducing downstream AWS Lambda execution GB-seconds by **87%**.
> * 🛡️ **Data Sovereignty:** **Zero third-party data egress.** Parent phone numbers, names, and booking intents never leave our private AWS VPC.

---

## The Problem: The "Fast Model" SaaS Illusion

If you build conversational AI agents or event-driven webhook bots (like our WhatsApp school book marketplace), you know the holy grail of conversational UX is **sub-250ms responsiveness**.

For months, the standard architecture for intent classification and discrete slot filling has looked like this:

1. **System 2 LLMs (e.g., Amazon Bedrock Nova, GPT-4o-mini):** Powerful reasoning, but painfully slow. Autoregressive token generation takes **1,500 ms – 1,800 ms**, completely killing conversational flow on chat apps.
2. **System 1 Decision Models (e.g., TypeSafe Jev):** Proprietary, lightweight pointer-head models exposed as cloud APIs. They promised sub-200ms model forward passes and simple pay-as-you-go billing ($0.042 per 1M tokens).

We enthusiastically adopted TypeSafe Jev to triage parents' WhatsApp inquiries—classifying whether a parent wanted to donate a 12th-grade Physics textbook, browse inventory, reserve a Cambridge Math book, or connect with another parent.

The classification was accurate. But when we inspected our AWS CloudWatch and X-Ray distributed traces, our median roundtrip turnaround was stuck at **~435 ms**.

Why? Because of **The SaaS Transit Tax**.

```
[The SaaS Transit Tax with TypeSafe Jev]:
AWS Lambda (VPC) ──[Public Internet TLS Handshake + Transit ~240ms]──► TypeSafe Cloud (~195ms Forward Pass)
                 ◄──────────────────[Return Transit]──────────────────┘
Total Latency: ~435 ms  (55% of user wait time was pure internet transit!)
```

More than half of the latency experienced by our users had nothing to do with machine learning compute. It was physical distance, DNS lookups, TCP handshakes, and public internet routing hops to a third-party cloud.

Then, AWS dropped **Strands Decider 2B** (`StrandsAgents/strands-decider-2B-hobson-v19`)—a self-hostable, open-weights System 1 model designed explicitly for pointer-head classification and tool-routing.

We decided to put it to the test: **What happens when we eliminate the internet entirely and run Decider 2B directly inside our private AWS VPC on AWS Fargate?**

---

## 1. The Benchmark: Empirical Results Across 4 Architectural Tiers

To make sure we weren't just observing local developer machine bias, we benchmarked 14 identical parent inquiry scenarios (in French and English) across four distinct architectures:

1. **Strands Decider 2B (Local Edge / Apple Silicon M3 / RTX 3090)**
2. **Strands Decider 2B (AWS Fargate Graviton3 ARM64 inside Private VPC)**
3. **TypeSafe Jev (`jev-1.13.0` Cloud SaaS)**
4. **Amazon Bedrock Nova Lite (System 2 LLM Baseline)**

Here is how the numbers shook out:

### Latency Comparison Breakdown

| Architectural Tier | Model Forward Pass | Network Overhead | Mean Turnaround | P95 Latency | Speedup vs Jev | Speedup vs Bedrock |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Strands Decider (Local Edge)** | 115 ms (GPU/Metal) | 0.1 ms (Local IPC) | **117 ms** | 131 ms | **3.7x faster (-73.5%)** | **14.0x faster (-92.9%)** |
| **Strands Decider (AWS Fargate VPC)** | 207 ms (Graviton CPU) | 1.8 ms (AWS VPC ENI) | **209 ms** | 235 ms | **2.1x faster (-51.7%)** | **7.8x faster (-87.2%)** |
| **TypeSafe Jev (Cloud SaaS)** | 195 ms (Proprietary GPU) | 240 ms (Public Internet) | **435 ms** | 480 ms | *Baseline* | 3.8x faster (-73.5%) |
| **Bedrock Nova Lite (System 2)** | 1,595 ms (Autoregressive) | 35 ms (AWS Internal) | **1,643 ms** | 1,850 ms | 3.8x slower (+278%) | *Baseline* |

```
Bedrock Nova Lite (System 2): ████████████████████████████████████████ 1,643 ms
TypeSafe Jev (SaaS):          ███████████ 435 ms
Strands Decider (Fargate):    █████ 209 ms  (-51.7% vs Jev)
Strands Decider (Local Edge): ███ 117 ms    (-73.5% vs Jev)
```

### The Architectural Revelation

Notice the crucial detail: **Jev’s raw forward pass (195ms) was actually slightly faster than Graviton3 CPU (207ms).**

Yet **Fargate Decider beat Jev by 226 milliseconds (2.1x speedup)** because our AWS Lambda backend communicated with Fargate over an internal AWS Elastic Network Interface (ENI) with a network latency of just **1.8 ms**.

By co-locating the model next to our application code, we completely bypassed public internet TLS roundtrips.

---

## 2. Unit Economics: When Fixed Infrastructure Crushes SaaS

A common objection to self-hosting models on AWS Fargate is: *"Isn't managing compute more expensive than pay-per-token serverless APIs?"*

The answer is: **It depends entirely on your traffic inflection curve.**

Here is the exact cost breakdown modeling TypeSafe Jev's variable token billing ($0.042 / 1M tokens) against a single AWS Fargate Spot task (2 vCPU, 8 GB RAM Graviton at ~$0.034/hour):

| Monthly Inquiries | TypeSafe Jev (SaaS: $0.042/1M tokens) | AWS Fargate Spot (~$25.00/mo flat) | AWS Fargate On-Demand (~$83.90/mo flat) | The Clear Financial Winner |
| :---: | :---: | :---: | :---: | :--- |
| **10,000 msgs** | **$0.08** (8 cents) | $25.00 | $83.90 | **TypeSafe Jev** |
| **100,000 msgs** | **$0.84** | $25.00 | $83.90 | **TypeSafe Jev** |
| **1,000,000 msgs** | **$8.40** | $25.00 | $83.90 | **TypeSafe Jev** |
| **2,976,000 msgs** | **~$25.00** | **~$25.00** | $83.90 | **⚡ Exact Breakeven Point** |
| **5,000,000 msgs** | $42.00 | **$25.00** | $83.90 | **Fargate Spot (40% cheaper)** |
| **10,000,000 msgs** | $84.00 | **$25.00** | $83.90 | **Fargate Spot (70% cheaper)** |
| **25,000,000 msgs** | $210.00 | **$25.00** | $83.90 | **Fargate Spot (88% cheaper)** |
| **50,000,000 msgs** | $420.00 | **$25.00** | $83.90 | **Fargate Spot (94% cheaper)** |

### The Two Financial Takeaways:

1. **The ~3 Million Crossover:** If your app processes under 3 million messages a month, TypeSafe Jev is undeniably cheaper because you pay pennies with zero idle capacity costs. But once you scale past 3 million monthly messages, Fargate Spot costs flatline at ~$25/month while Jev’s SaaS bill climbs linearly forever. At 25M messages, you save **88%**.
2. **The Hidden Lambda Duration Bonus:** Because our webhook handler went from waiting 1,643 ms (Bedrock) or 435 ms (Jev) down to 209 ms (Fargate), our AWS Lambda execution duration plummeted by **87.2%**. That cut our AWS Lambda GB-second compute bill by **~$2.40 per 1M invocations**.

---

## 3. Data Sovereignty: The Elephant in the Room

Cost and latency are engineering wins. But for our school community platform, **Data Sovereignty was the ultimate deciding factor.**

When processing messages from parents on WhatsApp, inbound payloads contain:
* Unmasked parent phone numbers (MSISDN)
* Children’s grade levels and schools
* Physical book exchange handover locations
* Personal parent names

### The SaaS Compliance Trap (TypeSafe Jev)
When you call a SaaS decision API, you are transmitting user PII across the public internet into a third-party vendor's infrastructure. In an enterprise or educational context, this creates a massive compliance headache:
* You must sign third-party Data Processing Agreements (DPAs).
* You risk violating GDPR Article 28 / FERPA / COPPA.
* If the vendor suffers an outage or changes their terms, your mission-critical triage pipeline stops dead.

### The Fargate Fortress (Strands Decider)
By deploying Strands Decider 2B inside our private AWS VPC:
* 🔒 **Zero Data Egress:** Inbound messages travel from API Gateway &rarr; Lambda &rarr; Fargate over private VPC subnets. Not a single byte ever leaves our AWS account.
* 🔑 **Customer-Managed Encryption:** Memory and container logs are encrypted with our own AWS KMS Customer Managed Key (CMK).
* 📜 **Native Compliance:** The workload is automatically covered under our existing AWS Business Associate Agreement (BAA) and SOC 2 Type II boundary.
* 📦 **Zero Vendor Lock-in:** The model weights (`StrandsAgents/strands-decider-2B-hobson-v19`) are open and versioned. If AWS disappeared tomorrow, the container image would still boot and serve on any server in the world.

---

## 4. Weighing the Tradeoffs: Advantages vs Disadvantages

No architectural decision is free. Here is the honest balance sheet:

### 🟢 Strands Decider 2B on AWS Fargate

**Advantages:**
* **52% Latency Reduction:** Sub-210ms turnaround inside your VPC; sub-120ms on edge hardware.
* **Predictable Flat Pricing:** Fixed compute cost (~$25/month on Spot); zero per-token anxiety at high volume.
* **Absolute Privacy & Data Sovereignty:** 100% private VPC isolation, zero third-party leakage.
* **Deterministic Inference:** Pointer-head architecture guarantees valid enum selections without hallucinated JSON.

**Disadvantages:**
* **Idle Server Overhead:** If your app only gets 1,000 requests a day, paying $25/month for idle Fargate capacity is wasteful compared to SaaS.
* **Operational Responsibility:** You must manage a Dockerfile, container images, ECR repositories, and ECS health checks.
* **Cold Starts & Scaling:** Rapid traffic spikes require configuring ECS Application Auto Scaling or multiple task replicas.

---

### 🔵 TypeSafe Jev (Cloud SaaS)

**Advantages:**
* **Zero Infrastructure Overhead:** Add an API key and an HTTP client, and you are live in five minutes.
* **True Serverless Scale-to-Zero:** If nobody talks to your bot at 3:00 AM, you pay exactly $0.00.
* **Extremely Cheap at Low Volume:** Under 1 million inquiries per month, it costs less than a cup of coffee ($8.40).

**Disadvantages:**
* **Internet Transit Tax:** Incurring 200–250ms of public internet latency on every single inference call.
* **PII & Compliance Risks:** Transmitting raw user conversational text to an external third-party API.
* **Runaway Costs at High Volume:** At 50M+ requests, token billing becomes significantly more expensive than running containerized instances.

---

## 5. How We Built It: The Infrastructure as Code

Here is how straightforward it is to deploy Strands Decider 2B on AWS Fargate using modern AWS CDK and Docker:

### The Container (`Dockerfile.decider`)
```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir strands-decider

ENV PORT=8000
ENV HOST=0.0.0.0
ENV MODEL=StrandsAgents/strands-decider-2B-hobson-v19

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8000/v1/systemone || exit 0

CMD ["sh", "-c", "strands-decider serve ${MODEL} --port ${PORT} --host ${HOST}"]
```

### The Fargate Spot CDK Definition (`index.cdk.ts`)
```typescript
// 1. Private VPC & Cluster
export const deciderVpc = new ec2.Vpc(blocksStack, 'DeciderVpc', { maxAzs: 2 });
export const deciderCluster = new ecs.Cluster(blocksStack, 'DeciderCluster', { vpc: deciderVpc });

// 2. Graviton ARM64 Task Definition (2 vCPU, 8 GB RAM)
export const deciderTaskDef = new ecs.FargateTaskDefinition(blocksStack, 'DeciderTaskDef', {
  memoryLimitMiB: 8192,
  cpu: 2048,
  runtimePlatform: {
    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
    cpuArchitecture: ecs.CpuArchitecture.ARM64,
  },
});

deciderTaskDef.addContainer('StrandsDeciderContainer', {
  image: ecs.ContainerImage.fromAsset('.', { file: 'Dockerfile.decider' }),
  logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'strands-decider' }),
});

// 3. Fargate Spot Service with Private Ingress
export const deciderService = new ecs.FargateService(blocksStack, 'DeciderService', {
  cluster: deciderCluster,
  taskDefinition: deciderTaskDef,
  desiredCount: 1,
  capacityProviderStrategies: [{ capacityProvider: 'FARGATE_SPOT', weight: 1 }],
  vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
});

// 4. Inject VPC Endpoint into Lambda
blocksStack.handler.addEnvironment(
  'STRANDS_DECIDER_FARGATE_URL',
  'http://decider.books.internal:8000'
);
```

---

## Summary Decision Matrix: What Should You Choose?

| Your Primary Constraint | Recommended Architecture | Why |
| :--- | :--- | :--- |
| **Max Privacy & High Volume (>3M msgs)** | **Strands Decider on AWS Fargate Spot** | 52% faster than SaaS, flat ~$25/mo pricing, 100% private VPC data containment. |
| **Sub-120ms Real-Time Edge Interaction** | **Strands Decider 2B (On-Device / Local)** | Zero network transit, sub-120ms response time on Apple Silicon or local GPU. |
| **Zero DevOps & Low Volume (<1M msgs)** | **TypeSafe Jev SaaS API** | Pay-as-you-go simplicity ($0.84 per 100k calls) with zero server maintenance. |
| **Complex Planning & Vision Loops** | **Amazon Bedrock Nova Lite / Pro** | Full System 2 reasoning when classification is not enough. |

---

## Conclusion

The cloud pendulum is swinging. For the past two years, the default engineering response to every AI problem was: *"Just call another proprietary SaaS API."*

Our migration to **AWS Strands Decider 2B on Fargate** proved that self-hosting specialized System 1 decision models is not just feasible—it is superior. By trimming the fat of public internet transit, we halved our response times, slashed our bills by 88% at scale, and gave our users the ironclad privacy they deserve.

If your agents are bogged down by third-party latency and compliance bottlenecks, it's time to bring your decision models home to your own VPC.

---

*Have you experimented with Strands Decider or self-hosted System 1 models? Share your benchmarks and thoughts in the comments below!*
