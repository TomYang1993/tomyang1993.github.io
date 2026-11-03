# AI Career Paths: minimal steps

The shortest route into four AI engineering roles, as plain text and links. Each role is a few big steps, from foundations to specialization. Each step is a short list of skills, and each skill has the one course and one project (sometimes two) worth finishing before you move on.

For every option per skill, plus papers and tools, see the interactive map: https://tomyang1993.github.io/ai-career-paths/

## How to use this

- Pick a role and work down its steps. The order is a direction, not a strict dependency chain: skills inside a step can run in parallel.
- A skill is done when you have finished its project. Skim the course parts you need; you do not have to finish every lecture.
- Roles share their early steps, so the same skill (and the same links) shows up under several roles. That is on purpose: each role reads on its own, and work you do for one path counts toward the others.
- Each role ends with a capstone. Shipping it is the real test of the path.

## The four roles

- [AI engineer](#ai-engineer): ships LLM systems that take actions and answer from real data: tool-calling agents, retrieval pipelines with citations, and the evals that keep both honest.
- [Cloud / ML platform engineer](#cloud--ml-platform-engineer): runs the infrastructure that models train and serve on: GPU clusters, model gateways, autoscaling inference, pipelines and cost controls.
- [DevOps / full-stack engineer](#devops--full-stack-engineer): builds and ships the product around the model: frontends, APIs, pipelines and deploys, increasingly with coding agents in the loop.
- [ML trainer / researcher](#ml-trainer--researcher): trains, fine-tunes and evaluates models: pretraining runs, post-training with SFT and RL, and the systems work that makes them fast.

---

## AI engineer

Ships LLM systems that take actions and answer from real data: tool-calling agents, retrieval pipelines with citations, and the evals that keep both honest.

Defining stack: Agents, RAG, Prompt engineering, Vector databases, LangChain / LangGraph. Interactive path: https://tomyang1993.github.io/ai-career-paths/#ai

Most postings for this role ask for both agents and retrieval, so the path covers both. From step 3 on, skills marked *(agents)* or *(retrieval)* belong to one branch; do both.

### Step 1 · Foundations

**1.1 Python & engineering craft**. Async, type hints, tests and Git as daily habits.

- Course: [Harvard CS50P: Introduction to Programming with Python](https://cs50.harvard.edu/python/) (videos). Fast on-ramp if Python is not yet your daily language.
- Course: [MIT: The Missing Semester of Your CS Education](https://missing.csail.mit.edu/) (videos). Shell, Git, debugging and profiling: the tooling every later course assumes.
- Project: [Build Your Own X](https://github.com/codecrafters-io/build-your-own-x). Rebuild a tool you use every day (Git, Redis, an HTTP server, a shell) from scratch. Pick the Python tutorials. Time: a weekend per tool.

**1.2 Backend & data fundamentals**. HTTP APIs, SQL, auth, queues and caching.

- Course: [Harvard CS50W: Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/) (videos). Django, SQL, APIs and JavaScript in one project-based course.
- Project: [RealWorld](https://github.com/realworld-apps/realworld). Build a Medium-style app against a shared API spec, then compare with the many reference backends and frontends. Time: 1–2 weeks.

### Step 2 · Core

**2.1 LLM APIs & prompt engineering**. Calling models reliably: structured output, tools, cost.

- Course: [DeepLearning.AI: ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) (videos + notebooks). Prompting through the API: summarize, infer, transform, then build a small chatbot.
- Project: [OpenAI Cookbook](https://github.com/openai/openai-cookbook). Runnable examples for structured outputs, function calling, embeddings and evals.
- Project: [Claude Cookbooks](https://github.com/anthropics/claude-cookbooks). Notebooks for tool use, RAG, prompt caching, sub-agents and more.

**2.2 ML fundamentals** *(optional)*. Generalization, metrics and data splits: the vocabulary.

- Course: [CMU 10-202: Introduction to Modern AI (Zico Kolter)](https://modernaicourse.org/) (Spring 2026, free online version). ML basics through training your own small LLM. The best single starting point for application builders.
- Project: [micrograd](https://github.com/karpathy/micrograd). A tiny autograd engine and neural-net library that makes backprop concrete. Time: a weekend.

### Step 3 · Building blocks

**3.1 How LLMs work**. Tokens, attention, pre- and post-training, decoding.

- Course: [Stanford CS224N: NLP with Deep Learning](https://web.stanford.edu/class/cs224n/) (videos). Word vectors through transformers, pretraining and post-training.
- Project: [LLMs from Scratch](https://github.com/rasbt/LLMs-from-scratch). Focus: Early chapters. Tokenization, embeddings and attention coded from scratch.

**3.2 Orchestration frameworks**. Graphs, state, retries and human-in-the-loop.

- Course: [Berkeley CS294/194-196: Large Language Model Agents MOOC](https://llmagents-learning.org/f24) (Fall 2024, videos). Agent frameworks, infrastructure, and RAG as an agent building block.
- Project: [Introduction to LangGraph](https://academy.langchain.com/courses/intro-to-langgraph). State, memory, human-in-the-loop and deployment, building a personal assistant along the way. Time: about 6 hours + notebooks.

**3.3 Evals & observability**. Golden sets, LLM-as-judge, tracing, regression tests.

- Course: [CMU 17-645: Machine Learning in Production](https://mlip-cmu.github.io/s2026/) (Spring 2026, slides). Model quality, testing in production and risk, now covering LLMs and agents.
- Project: [LLM Zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp). Focus: Evaluation and monitoring. Offline retrieval and answer evaluation, then monitoring in production.

**3.4 Memory & context engineering** *(agents)*. Short and long-term memory, context budgets, compaction.

- Course: [DeepLearning.AI: LLMs as Operating Systems: Agent Memory](https://www.deeplearning.ai/short-courses/llms-as-operating-systems-agent-memory/) (videos + notebooks). Taught by the MemGPT authors: build self-editing memory, then share memory across agents with Letta.
- Project: [5-Day AI Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents). Focus: Memory day. Sessions, memory and context management for agents.

**3.5 AI-native development** *(agents)*. MCP, hooks and working inside coding agents.

- Course: [DeepLearning.AI: Claude Code: A Highly Agentic Coding Assistant](https://www.deeplearning.ai/short-courses/claude-code-a-highly-agentic-coding-assistant/) (videos). Explore, refactor, test and debug real codebases with a coding agent, taught by Anthropic.
- Project: [The Context Course](https://huggingface.co/learn/context-course). Focus: Skills, MCP and hooks units. Structure the context a coding agent works from.

**3.6 Embeddings & chunking** *(retrieval)*. How text becomes searchable: embedding and chunking.

- Course: [DeepLearning.AI: Embedding Models: from Architecture to Implementation](https://www.deeplearning.ai/short-courses/embedding-models-from-architecture-to-implementation/) (videos + notebooks). From word2vec to BERT to dual encoders trained with contrastive loss.
- Project: [LLM Zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp). Focus: Vector search module. Embed, index and query a real FAQ dataset.

### Step 4 · Applied

**4.1 Agent architectures** *(agents)*. Tool-use loops, planning, multi-agent patterns.

- Course: [CMU 11-768: AI Agents (Neubig & Fried)](https://www.cmu-agents.com/) (Fall 2026, videos). Harness design, evaluation, RL training, sandboxing and OpenHands. Lectures are being posted to YouTube.
- Project: [Hugging Face Agents Course](https://huggingface.co/learn/agents-course). smolagents, LlamaIndex and LangGraph units, ending in a benchmarked final agent. Free certificate. Time: 20–30 hours.

**4.2 Databases & vector stores** *(retrieval)*. ANN indexes, hybrid queries, keeping embeddings fresh.

- Course: [DeepLearning.AI: Vector Databases: from Embeddings to Applications](https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/) (videos + notebooks). ANN search, HNSW, and sparse, dense and hybrid search in a real vector database.
- Project: [ANN-Benchmarks](https://github.com/erikbern/ann-benchmarks). Plot recall against queries per second for HNSW, IVF and other index types. Time: a day.

**4.3 Information retrieval** *(retrieval)*. Hybrid BM25 + dense search, rerankers, ranking metrics.

- Course: [Stanford CS276: Information Retrieval and Web Search](https://web.stanford.edu/class/cs276/) (slides). Indexing, scoring, evaluation and learning to rank, with the free IIR textbook.
- Project: [RAG Techniques](https://github.com/NirDiamant/RAG_Techniques). Focus: Retrieval techniques. Hybrid search, reranking and query transformations.

### Step 5 · Specialization

**5.1 Production & self-improving agents** *(agents)*. Sandboxes, guardrails, approvals, RL for agents.

- Course: [Berkeley CS294/194-196: Agentic AI MOOC (Dawn Song)](https://agenticai-learning.org/f25) (Fall 2025, videos). Focus: Safety lecture. Agentic AI safety and security.
- Project: [5-Day AI Agents Intensive](https://www.kaggle.com/learn-guide/5-day-agents). Focus: Day 5. From prototype to production deployment.

**5.2 Advanced RAG systems** *(retrieval)*. Grounded, cited answers over messy enterprise data.

- Course: [DeepLearning.AI: Building and Evaluating Advanced RAG](https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/) (videos + notebooks). Sentence-window and auto-merging retrieval, scored with the RAG triad.
- Project: [LLM Zoomcamp](https://github.com/DataTalksClub/llm-zoomcamp). Focus: Capstone. Ship an original RAG app with a knowledge base, retrieval, evaluation, a UI and monitoring; peer-reviewed for a certificate.

### Step 6 · Capstone

**Grounded ops agent capstone.** Build an operations agent over three or more real tools (tickets, docs, chat) using MCP and a sandbox, plus a hybrid-search retrieval tool with a reranker over a messy real corpus. Back it with a 50-case eval suite covering task success, recall@k and citation accuracy, and report which change moved each number.

---

## Cloud / ML platform engineer

Runs the infrastructure that models train and serve on: GPU clusters, model gateways, autoscaling inference, pipelines and cost controls.

Defining stack: Multi-cloud, PyTorch / TensorFlow, Kubernetes, Inference / serving. Interactive path: https://tomyang1993.github.io/ai-career-paths/#platform

### Step 1 · Foundations

**1.1 Python & engineering craft**. Async, type hints, tests and Git as daily habits.

- Course: [Harvard CS50P: Introduction to Programming with Python](https://cs50.harvard.edu/python/) (videos). Fast on-ramp if Python is not yet your daily language.
- Course: [MIT: The Missing Semester of Your CS Education](https://missing.csail.mit.edu/) (videos). Shell, Git, debugging and profiling: the tooling every later course assumes.
- Project: [Build Your Own X](https://github.com/codecrafters-io/build-your-own-x). Rebuild a tool you use every day (Git, Redis, an HTTP server, a shell) from scratch. Pick the Python tutorials. Time: a weekend per tool.

**1.2 Computer systems & Linux**. Processes, networking and the Linux box under it all.

- Course: [CMU 15-213: Introduction to Computer Systems](https://www.cs.cmu.edu/~213/) (slides). Memory, processes, concurrency and networking from the machine up. The listed prerequisite for CMU's cloud and ML-systems courses.
- Project: [Linux Upskill Challenge](https://linuxupskillchallenge.org/). Run and harden a real Linux server in the cloud, one task a day. Time: 20 days.

**1.3 Math for ML** *(optional)*. Linear algebra, probability, calculus, optimization.

- Course: [MIT 18.06SC: Linear Algebra (Gilbert Strang)](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/) (videos). The linear algebra under embeddings, attention and every training run.
- Course: [MIT 18.05: Introduction to Probability and Statistics](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/) (Spring 2022, notes + problem sets). Probability, Bayesian inference and the statistics behind evals and experiments.
- Project: [micrograd](https://github.com/karpathy/micrograd). The chain rule as code: build autograd from scalars. Time: a weekend.

### Step 2 · Core

**2.1 ML fundamentals**. Generalization, metrics and data splits: the vocabulary.

- Course: [Stanford CS229: Machine Learning](https://cs229.stanford.edu/) (videos). The classic, math-forward treatment. The depth platform and research paths need.
- Project: [Machine Learning Zoomcamp](https://github.com/DataTalksClub/machine-learning-zoomcamp). From regression to deploying models with Docker, serverless and Kubernetes, plus peer-reviewed projects.

**2.2 Containers & CI/CD**. Docker, CI pipelines with test gates, IaC.

- Course: [U. Helsinki Full Stack Open: Deep Dive into Modern Web Development](https://fullstackopen.com/en/) (self-paced). Focus: Parts 11–12. GitHub Actions pipelines and Docker for real applications.
- Project: [DevOps with Docker](https://devopswithdocker.com/). Containerize a frontend, backend and database, then wire up Compose and a CI deploy. Free, with graded exercises. Time: 2–4 weeks.
- Project: [Full Stack FastAPI Template](https://github.com/fastapi/full-stack-fastapi-template). Focus: Docker + CI. Docker Compose and GitHub Actions are part of the template.

### Step 3 · Building blocks

**3.1 Deep learning & PyTorch**. Backprop, transformers and training loops in PyTorch.

- Course: [Stanford CS231n: Deep Learning for Computer Vision](https://cs231n.stanford.edu/) (videos). Backprop and training practice taught through vision.
- Project: [Practical Deep Learning for Coders](https://course.fast.ai/). Train real models and deploy them as web apps from the second lesson on. Time: about 2 months.

**3.2 How LLMs work**. Tokens, attention, pre- and post-training, decoding.

- Course: [Stanford CS224N: NLP with Deep Learning](https://web.stanford.edu/class/cs224n/) (videos). Word vectors through transformers, pretraining and post-training.
- Project: [LLMs from Scratch](https://github.com/rasbt/LLMs-from-scratch). Focus: Early chapters. Tokenization, embeddings and attention coded from scratch.

**3.3 Kubernetes & multi-cloud**. Scheduling, autoscaling and GPU nodes on any cloud.

- Course: [Linux Foundation LFS158: Introduction to Kubernetes](https://training.linuxfoundation.org/training/introduction-to-kubernetes/) (self-paced). Free. Architecture, deployments, ConfigMaps, Secrets and Ingress.
- Project: [DevOps with Kubernetes](https://devopswithkubernetes.com/). Build a microservice app on K3s and GKE with autoscaling, GitOps and monitoring. Time: 4–6 weeks.

### Step 4 · Applied

**4.1 GPUs & parallel computing**. Memory hierarchy, CUDA, Triton kernels, profiling.

- Course: [Stanford CS149: Parallel Computing](https://gfxcourses.stanford.edu/cs149/fall25) (Fall 2025, slides). CUDA and ISPC assignments. 2023 lecture videos are on YouTube.
- Project: [GPU Puzzles](https://github.com/srush/GPU-Puzzles). Learn CUDA by solving small kernel puzzles in Python (Numba). Time: a weekend.

**4.2 MLOps & AI in production**. Versioning, rollouts and monitoring for model-backed systems.

- Course: [Stanford CS329S: Machine Learning Systems Design (Chip Huyen)](https://stanford-cs329s.github.io/) (slides + notes). Data, features, deployment, monitoring and continual learning for production ML.
- Project: [Made With ML: MLOps course](https://madewithml.com/courses/mlops/). Design, develop, deploy and iterate on a production ML app with Ray, MLflow and CI/CD. Time: several weeks.

**4.3 Observability & cost (FinOps)**. Traces, GPU utilization, tail latency and FinOps.

- Course: [Linux Foundation: Introduction to FinOps](https://www.edx.org/course/introduction-to-finops) (self-paced). How engineering and finance manage cloud spend together. Free to audit on edX.
- Project: [MLOps Zoomcamp](https://github.com/DataTalksClub/mlops-zoomcamp). Focus: Monitoring module. Monitor a deployed model with dashboards and alerts.

### Step 5 · Specialization

**5.1 Inference & serving**. vLLM, batching, KV cache, quantization.

- Course: [CMU 11-868: Large Language Model Systems](https://llmsystem.github.io/llmsystem2026fall/) (Fall 2026, slides). Under the hood of vLLM, SGLang and FlashAttention: GPU programming, quantization and serving.
- Project: [vLLM Production Stack](https://github.com/vllm-project/production-stack). Deploy vLLM on Kubernetes with Helm, a KV-cache-aware router and Prometheus/Grafana dashboards, then benchmark it. Time: 1–2 weeks + GPU time.

**5.2 DL systems & distributed training**. Parallelism, FSDP / ZeRO and mixed precision at scale.

- Course: [CMU 10-414/714: Deep Learning Systems](https://dlsyscourse.org/) (videos). Build a deep learning library (Needle) with autodiff and a GPU backend. 2022 videos online.
- Project: [The Ultra-Scale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook). Data, tensor, pipeline and context parallelism explained with thousands of scaling experiments. Pair it with Picotron. Time: a few weeks.
- Project: [Picotron](https://github.com/huggingface/picotron). Minimal 4D-parallel pretraining (data, tensor, pipeline, context) in a few hundred lines, with a step-by-step video tutorial. Time: 1–2 weeks + multi-GPU.

### Step 6 · Capstone

**Serving platform capstone.** Serve an open-weights model with vLLM on Kubernetes with a GPU node pool, autoscale on queue depth, and publish a latency, throughput and cost-per-million-tokens benchmark.

---

## DevOps / full-stack engineer

Builds and ships the product around the model: frontends, APIs, pipelines and deploys, increasingly with coding agents in the loop.

Defining stack: CI/CD, Kubernetes, React / frontend. Interactive path: https://tomyang1993.github.io/ai-career-paths/#devops

### Step 1 · Foundations

**1.1 Python & engineering craft**. Async, type hints, tests and Git as daily habits.

- Course: [Harvard CS50P: Introduction to Programming with Python](https://cs50.harvard.edu/python/) (videos). Fast on-ramp if Python is not yet your daily language.
- Course: [MIT: The Missing Semester of Your CS Education](https://missing.csail.mit.edu/) (videos). Shell, Git, debugging and profiling: the tooling every later course assumes.
- Project: [Build Your Own X](https://github.com/codecrafters-io/build-your-own-x). Rebuild a tool you use every day (Git, Redis, an HTTP server, a shell) from scratch. Pick the Python tutorials. Time: a weekend per tool.

**1.2 Backend & data fundamentals**. HTTP APIs, SQL, auth, queues and caching.

- Course: [Harvard CS50W: Web Programming with Python and JavaScript](https://cs50.harvard.edu/web/) (videos). Django, SQL, APIs and JavaScript in one project-based course.
- Project: [RealWorld](https://github.com/realworld-apps/realworld). Build a Medium-style app against a shared API spec, then compare with the many reference backends and frontends. Time: 1–2 weeks.

**1.3 Computer systems & Linux**. Processes, networking and the Linux box under it all.

- Course: [CMU 15-213: Introduction to Computer Systems](https://www.cs.cmu.edu/~213/) (slides). Memory, processes, concurrency and networking from the machine up. The listed prerequisite for CMU's cloud and ML-systems courses.
- Project: [Linux Upskill Challenge](https://linuxupskillchallenge.org/). Run and harden a real Linux server in the cloud, one task a day. Time: 20 days.

### Step 2 · Core

**2.1 LLM APIs & prompt engineering**. Calling models reliably: structured output, tools, cost.

- Course: [DeepLearning.AI: ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) (videos + notebooks). Prompting through the API: summarize, infer, transform, then build a small chatbot.
- Project: [OpenAI Cookbook](https://github.com/openai/openai-cookbook). Runnable examples for structured outputs, function calling, embeddings and evals.
- Project: [Claude Cookbooks](https://github.com/anthropics/claude-cookbooks). Notebooks for tool use, RAG, prompt caching, sub-agents and more.

**2.2 AI product frontend**. Streaming chat UIs and the glue to model output.

- Course: [U. Helsinki Full Stack Open: Deep Dive into Modern Web Development](https://fullstackopen.com/en/) (self-paced). React, Node, TypeScript and GraphQL, with later parts on CI/CD and containers.
- Project: [Next.js Learn: Dashboard App](https://nextjs.org/learn). Build and deploy a full dashboard app with routing, a Postgres database, auth and streaming. Time: about a week.
- Project: [Vercel Chatbot](https://github.com/vercel/chatbot). A production Next.js chat app on the AI SDK with streaming, auth and persistence. Fork it and swap the model. Time: 1 week.

**2.3 Containers & CI/CD**. Docker, CI pipelines with test gates, IaC.

- Course: [U. Helsinki Full Stack Open: Deep Dive into Modern Web Development](https://fullstackopen.com/en/) (self-paced). Focus: Parts 11–12. GitHub Actions pipelines and Docker for real applications.
- Project: [DevOps with Docker](https://devopswithdocker.com/). Containerize a frontend, backend and database, then wire up Compose and a CI deploy. Free, with graded exercises. Time: 2–4 weeks.
- Project: [Full Stack FastAPI Template](https://github.com/fastapi/full-stack-fastapi-template). Focus: Docker + CI. Docker Compose and GitHub Actions are part of the template.

### Step 3 · Building blocks

**3.1 AI-native development**. MCP, hooks and working inside coding agents.

- Course: [DeepLearning.AI: Claude Code: A Highly Agentic Coding Assistant](https://www.deeplearning.ai/short-courses/claude-code-a-highly-agentic-coding-assistant/) (videos). Explore, refactor, test and debug real codebases with a coding agent, taught by Anthropic.
- Project: [The Context Course](https://huggingface.co/learn/context-course). Focus: Skills, MCP and hooks units. Structure the context a coding agent works from.

**3.2 Kubernetes & multi-cloud**. Scheduling, autoscaling and GPU nodes on any cloud.

- Course: [Linux Foundation LFS158: Introduction to Kubernetes](https://training.linuxfoundation.org/training/introduction-to-kubernetes/) (self-paced). Free. Architecture, deployments, ConfigMaps, Secrets and Ingress.
- Project: [DevOps with Kubernetes](https://devopswithkubernetes.com/). Build a microservice app on K3s and GKE with autoscaling, GitOps and monitoring. Time: 4–6 weeks.

**3.3 Evals & observability** *(optional)*. Golden sets, LLM-as-judge, tracing, regression tests.

- Course: [CMU 17-645: Machine Learning in Production](https://mlip-cmu.github.io/s2026/) (Spring 2026, slides). Model quality, testing in production and risk, now covering LLMs and agents.
- Project: [Introduction to LangSmith](https://academy.langchain.com/courses/intro-to-langsmith). Tracing, datasets, experiments and online evaluation. Time: about 3.5 hours.

### Step 4 · Applied

**4.1 Testing & observability**. Unit to end-to-end tests, logs, metrics and alerts.

- Course: [U. Helsinki Full Stack Open: Deep Dive into Modern Web Development](https://fullstackopen.com/en/) (self-paced). Focus: Testing parts. Backend tests, React tests and end-to-end tests.
- Project: [Full Stack FastAPI Template](https://github.com/fastapi/full-stack-fastapi-template). Focus: Tests + CI. Backend tests and end-to-end tests running in GitHub Actions.

**4.2 MLOps & AI in production**. Versioning, rollouts and monitoring for model-backed systems.

- Course: [Stanford CS329S: Machine Learning Systems Design (Chip Huyen)](https://stanford-cs329s.github.io/) (slides + notes). Data, features, deployment, monitoring and continual learning for production ML.
- Project: [Made With ML: MLOps course](https://madewithml.com/courses/mlops/). Design, develop, deploy and iterate on a production ML app with Ray, MLflow and CI/CD. Time: several weeks.

### Step 5 · Capstone

**Full product capstone.** Ship a streaming AI feature end to end (Next.js UI, API, model provider) with evals as a CI merge gate, preview deploys and a tested rollback path.

---

## ML trainer / researcher

Trains, fine-tunes and evaluates models: pretraining runs, post-training with SFT and RL, and the systems work that makes them fast.

Defining stack: PyTorch / TensorFlow, Inference / serving. Interactive path: https://tomyang1993.github.io/ai-career-paths/#research

### Step 1 · Foundations

**1.1 Python & engineering craft**. Async, type hints, tests and Git as daily habits.

- Course: [Harvard CS50P: Introduction to Programming with Python](https://cs50.harvard.edu/python/) (videos). Fast on-ramp if Python is not yet your daily language.
- Course: [MIT: The Missing Semester of Your CS Education](https://missing.csail.mit.edu/) (videos). Shell, Git, debugging and profiling: the tooling every later course assumes.
- Project: [Build Your Own X](https://github.com/codecrafters-io/build-your-own-x). Rebuild a tool you use every day (Git, Redis, an HTTP server, a shell) from scratch. Pick the Python tutorials. Time: a weekend per tool.

**1.2 Math for ML**. Linear algebra, probability, calculus, optimization.

- Course: [MIT 18.06SC: Linear Algebra (Gilbert Strang)](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/) (videos). The linear algebra under embeddings, attention and every training run.
- Course: [MIT 18.05: Introduction to Probability and Statistics](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/) (Spring 2022, notes + problem sets). Probability, Bayesian inference and the statistics behind evals and experiments.
- Project: [micrograd](https://github.com/karpathy/micrograd). The chain rule as code: build autograd from scalars. Time: a weekend.

### Step 2 · Core

**2.1 ML fundamentals**. Generalization, metrics and data splits: the vocabulary.

- Course: [Stanford CS229: Machine Learning](https://cs229.stanford.edu/) (videos). The classic, math-forward treatment. The depth platform and research paths need.
- Project: [Practical Deep Learning for Coders](https://course.fast.ai/). Focus: Early lessons. Practical training, validation and error analysis.

### Step 3 · Building blocks

**3.1 Deep learning & PyTorch**. Backprop, transformers and training loops in PyTorch.

- Course: [Stanford CS231n: Deep Learning for Computer Vision](https://cs231n.stanford.edu/) (videos). Backprop and training practice taught through vision.
- Project: [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html). Focus: makemore lectures. MLPs, BatchNorm and initialization, built up to a GPT.

**3.2 How LLMs work**. Tokens, attention, pre- and post-training, decoding.

- Course: [Stanford CS224N: NLP with Deep Learning](https://web.stanford.edu/class/cs224n/) (videos). Word vectors through transformers, pretraining and post-training.
- Project: [LLMs from Scratch](https://github.com/rasbt/LLMs-from-scratch). Focus: Early chapters. Tokenization, embeddings and attention coded from scratch.

### Step 4 · Applied

**4.1 GPUs & parallel computing**. Memory hierarchy, CUDA, Triton kernels, profiling.

- Course: [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/) (Spring 2026, videos). Focus: Lectures 5–6. GPUs, kernels and Triton, taught around LLM training.
- Project: [GPU Puzzles](https://github.com/srush/GPU-Puzzles). Learn CUDA by solving small kernel puzzles in Python (Numba). Time: a weekend.

**4.2 Language models from scratch**. From tokenizer to training run: build and scale an LM.

- Course: [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/) (Spring 2026, videos). Tokenizer, transformer, FlashAttention in Triton, scaling laws, data and alignment. Five heavy assignments.
- Project: [nanochat](https://github.com/karpathy/nanochat). Tokenizer, pretraining, SFT, evaluation and a chat web UI in one small repo: your own ChatGPT clone. Time: about 4 hours on 8×H100 (~$100).

### Step 5 · Specialization

**5.1 DL systems & distributed training**. Parallelism, FSDP / ZeRO and mixed precision at scale.

- Course: [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/) (Spring 2026, videos). Focus: Lectures 7–8. Data, tensor and pipeline parallelism for LLM training.
- Project: [The Ultra-Scale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook). Data, tensor, pipeline and context parallelism explained with thousands of scaling experiments. Pair it with Picotron. Time: a few weeks.
- Project: [Picotron](https://github.com/huggingface/picotron). Minimal 4D-parallel pretraining (data, tensor, pipeline, context) in a few hundred lines, with a step-by-step video tutorial. Time: 1–2 weeks + multi-GPU.

**5.2 Post-training & RL**. SFT, LoRA, DPO and RL with verifiable rewards.

- Course: [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/) (Spring 2026, videos). Focus: Lectures 15–16. SFT, RLHF and RL with verifiable rewards on top of your own pretrained model.
- Project: [smol-course](https://github.com/huggingface/smol-course). SFT, evaluation, DPO, RL and synthetic data on small models that run on your own hardware. Time: about 7 units.

**5.3 Inference & serving** *(optional)*. vLLM, batching, KV cache, quantization.

- Course: [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/) (Spring 2026, videos). Focus: Lecture 10. Inference: what makes generation fast or slow.
- Project: [vLLM Production Stack](https://github.com/vllm-project/production-stack). Deploy vLLM on Kubernetes with Helm, a KV-cache-aware router and Prometheus/Grafana dashboards, then benchmark it. Time: 1–2 weeks + GPU time.

### Step 6 · Capstone

**Train-and-tune capstone.** Pretrain a small language model from scratch in the CS336 style, then SFT and RL-tune it on one narrow task. Report scaling curves and eval deltas against the base model.

---

## Notes

- Role archetypes start from the job-posting clusters in the [AI Engineering Field Guide](https://github.com/alexeygrigorev/ai-engineering-field-guide). Its agent-builder and RAG-builder clusters are merged here into one AI engineer role, because most postings that ask for one also ask for the other.
- Courses and projects were checked against their live pages in November 2026. Whether lecture videos are public changes from term to term; each course says what was open then (videos, slides, notes).
- Every project is free. A few need paid GPU time to run, and say so.
