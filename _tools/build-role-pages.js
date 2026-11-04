// Builds a static HTML page per role under ai-career-paths/<slug>/ from the map's own data,
// so search engines and AI crawlers see every step, course, project and paper without JavaScript.
// The map (ai-career-paths/index.html) stays the source of truth: edit it, then rerun this.
//
//   node _tools/build-role-pages.js        (needs Playwright: npm i -D playwright && npx playwright install chromium)
//
// Jekyll skips folders that start with "_", so this script is not published.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://tomyang1993.github.io';
const MAP = `${SITE}/ai-career-paths/`;
const REPO = 'https://github.com/TomYang1993/AI-career-path-minimal-steps';
const SLUG = { ai: 'ai-engineer', platform: 'cloud-ml-platform-engineer', devops: 'devops-full-stack-engineer', research: 'ml-trainer-researcher' };
const BRANCH = { ai: { memory: 'agents', 'coding-agents': 'agents', agents: 'agents', 'agent-prod': 'agents', embeddings: 'retrieval', vectordb: 'retrieval', retrieval: 'retrieval', rag: 'retrieval' } };
// Capstone follow-alongs, kept in step with the minimal-steps README.
const FOLLOW = {
  ai: [['Second Brain AI Assistant course', 'https://github.com/decodingml/second-brain-ai-assistant-course', 'Decoding AI, free and open source. Six modules that build an agentic RAG assistant end to end: crawl and clean documents, chunk and embed them into a vector store, put a smolagents agent on top, evaluate it with Opik, and deploy it. Running the code costs about $1–5 in API fees.']],
  platform: [['vLLM Production Stack tutorials', 'https://github.com/vllm-project/production-stack/tree/main/tutorials', 'Free and open source. Follow them in order: 00 (set up Kubernetes), 01 (Helm install), 02 (basic config), 07 (benchmark on one GPU), then 20 (autoscale with KEDA on queue length, down to zero). The autoscaling step needs a cluster with at least 2 GPUs.']],
  devops: [
    ['AI Dev Tools Zoomcamp', 'https://github.com/DataTalksClub/ai-dev-tools-zoomcamp', 'DataTalks.Club, free. Modules 2–4 build one full-stack app and take it through tests, Docker, a public deploy, GitHub Actions CI/CD and observability; the final project asks for CI/CD with a rollback path.'],
    ['AI SDK RAG template', 'https://github.com/vercel-labs/ai-sdk-preview-rag', 'Vercel, free. A Next.js chat app that streams model responses and retrieves from Postgres through tool calls; deployed on Vercel, every pull request gets a preview deploy.'],
    ['promptfoo GitHub Action', 'https://github.com/promptfoo/promptfoo-action', 'Free and open source. Runs your eval suite on every pull request and fails the check below a pass rate; make that check required and evals become the merge gate.'],
  ],
  research: [
    ['nanochat', 'https://github.com/karpathy/nanochat', 'Karpathy, free and open source. runs/speedrun.sh trains a tokenizer, pretrains a small model, fine-tunes it into a chat model and evaluates each stage; scripts/chat_rl.py adds RL on GSM8K. About 2 hours on one 8×H100 node (around $50); runs/runcpu.sh runs a tiny version on a laptop for free.'],
    ['Reasoning from Scratch', 'https://github.com/rasbt/reasoning-from-scratch', 'Sebastian Raschka, code free (the book is paid). Chapters 6–7 train a small model with GRPO reinforcement learning on consumer hardware.'],
  ],
};

// After the capstone: interview prep and what to publish. Kept in step with the minimal-steps README.
const SRE = ['Site Reliability Engineering', 'https://sre.google/sre-book/introduction/', 'Google, free book. SLOs, on-call and incident response: the operations side that platform and DevOps interviews probe.'];
const MLIB = ['Machine Learning Interviews', 'https://huyenchip.com/ml-interviews-book/', 'Chip Huyen, free book. How ML hiring works, what each interview round tests, and practice questions.'];
const GET_HIRED = {
  ai: { links: [
    ['AI Engineer interview prep', 'https://github.com/aishwaryanr/awesome-generative-ai-guide/tree/main/interview_prep/roles/ai-engineer', 'LevelUp Labs, free. What each interview round tests, a 60+ question bank with model answers, and a 3-week prep plan.'],
    ['AI system design case studies', 'https://github.com/aishwaryanr/awesome-generative-ai-guide/tree/main/interview_prep/system-design', 'LevelUp Labs, free. Ten worked system design interviews, each with the follow-up questions interviewers ask.']],
    portfolio: 'Publish the capstone with a README that states the problem, the architecture and the eval results, plus a two-minute demo video. AI-first startups weigh a working portfolio heavily.' },
  platform: { links: [
    ['ML and LLM system design case studies', 'https://www.evidentlyai.com/ml-system-design', 'Evidently, free. How real companies built and run ML and LLM systems.'], SRE, MLIB],
    portfolio: 'Publish the capstone benchmark as a short write-up: latency, throughput and cost per million tokens, before and after autoscaling.' },
  devops: { links: [
    ['System Design Primer', 'https://github.com/donnemartin/system-design-primer', 'Free. The standard prep for system design rounds: scaling, caching, queues and trade-offs, with practice questions.'], SRE],
    portfolio: 'Keep the capstone live at a public URL with its pipeline visible: the eval gate on pull requests, preview deploys and a tested rollback.' },
  research: { links: [MLIB,
    ['Harvard CS197: AI Research Experiences', 'https://www.cs197.seas.harvard.edu/', 'Free course notes. Reading papers, running experiments and writing them up: the habits a research portfolio shows.']],
    portfolio: 'Write the capstone up like a short paper (setup, scaling curves, ablations) and release the code and weights on Hugging Face.' },
};
// Free ways to run the projects.
const FREE = [
  ['Google AI Studio', 'https://aistudio.google.com/', 'a free Gemini API key'],
  ['GroqCloud', 'https://console.groq.com/', 'fast open models on a free tier'],
  ['OpenRouter', 'https://openrouter.ai/', 'one API key, including some free models'],
  ['Ollama', 'https://ollama.com/', 'run open models on your own machine'],
  ['llama.cpp', 'https://github.com/ggml-org/llama.cpp', 'efficient local inference, even on a laptop CPU'],
  ['Google Colab', 'https://colab.research.google.com/', 'notebooks with free GPU time'],
  ['Kaggle Notebooks', 'https://www.kaggle.com/code', 'notebooks with a weekly free GPU quota'],
];

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lc = s => s.charAt(0).toLowerCase() + s.slice(1);

async function extract() {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.route(/^https?:\/\/(?!localhost)/, r => r.abort()); // fonts are not needed for the data
  await p.goto('file://' + path.join(ROOT, 'ai-career-paths/index.html'));
  const data = await p.evaluate(() => {
    const res = (r, nodeId) => {
      const c = r.covers.find(x => x.node === nodeId) || {};
      return { kind: r.kind, title: resTitle(r), s: r.s, n: r.n, t: r.t || '', u: r.u, f: r.f || '', by: r.by || '', effort: r.effort || '',
        stars: STARS[r.u] || 0, hot: hotKeys(nodeId, r.kind).has(r.key), part: c.part || '', note: c.note || '',
        also: r.covers.map(x => x.node).filter(x => x !== nodeId).length };
    };
    return {
      tiers: TIERS,
      roles: ROLES.map(r => ({ id: r.id, name: r.name, story: r.story, job: r.job, stack: r.stack, capTitle: r.capTitle, capstone: r.capstone, nodes: r.nodes, optional: r.optional })),
      nodes: Object.fromEntries(NODES.filter(n => !n.role).map(n => [n.id, {
        id: n.id, tier: n.tier, title: n.title, desc: n.desc, why: n.why, skills: n.skills,
        tools: n.tools.map(t => ({ name: t, lic: TOOL_LIC[t] || 'ent' })),
        papers: n.papers.map(x => ({ t: x.t, a: x.a, y: x.y, u: x.u, star: !!x.star, guide: !!x.guide })),
        courses: resFor(n.id, 'course').map(r => res(r, n.id)).sort((a, b) => b.hot - a.hot),
        projects: resFor(n.id, 'project').map(r => res(r, n.id)).sort((a, b) => b.hot - a.hot),
        roles: ROLES.filter(r => r.nodes.includes(n.id)).map(r => r.id),
      }])),
    };
  });
  await b.close();
  return data;
}

const CSS = `
:root{--bg:#f4f5f7;--surface:#fff;--surface-2:#eef0f3;--ink:#15171b;--ink-2:#4a505a;--ink-3:#6b727d;--line:#d3d8df;--focus:#2a78d6;
--r-ai:#2a78d6;--r-platform:#1baf7a;--r-devops:#eda100;--r-research:#e87ba4;--hot:#f97316;
--font-body:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--font-serif:"Source Serif 4",Georgia,"Times New Roman",serif;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#15171c;--surface:#1b1f26;--surface-2:#252a33;--ink:#e9ebef;--ink-2:#b6bcc6;--ink-3:#8a919c;--line:#333a45;--focus:#3987e5;
--r-ai:#3987e5;--r-platform:#199e70;--r-devops:#c98500;--r-research:#d55181;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 var(--font-body)}
a{color:inherit;text-decoration-color:color-mix(in srgb,var(--role) 70%,transparent);text-underline-offset:3px}
a:hover{text-decoration-thickness:2px}
a:focus-visible{outline:2px solid var(--focus);outline-offset:2px;border-radius:3px}
.wrap{max-width:860px;margin:0 auto;padding:28px 16px 64px}
.crumbs{font:500 12px var(--font-mono);letter-spacing:.04em;color:var(--ink-3);display:flex;flex-wrap:wrap;gap:6px}
.crumbs a{text-decoration:none}.crumbs a:hover{text-decoration:underline}
h1{font:700 clamp(34px,6vw,48px)/1.1 var(--font-serif);letter-spacing:-.015em;margin:14px 0 10px;padding-bottom:6px;border-bottom:4px solid var(--role);display:inline-block}
.story{font-size:18px;color:var(--ink-2);margin:6px 0 16px}
.stack{font:400 13px var(--font-mono);color:var(--ink-2)}
.cta{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 8px}
.cta a{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface);text-decoration:none;font-weight:600;font-size:14px}
.cta a.primary{border-color:var(--role);box-shadow:inset 0 0 0 1px var(--role)}
.others{font-size:14px;color:var(--ink-3);margin:10px 0 0}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin:18px 0}
.toc ol{margin:6px 0 0;padding-left:20px}.toc li{margin:4px 0}
.toc .sk{color:var(--ink-2);font-size:14px}
h2{font:700 26px/1.25 var(--font-serif);margin:44px 0 6px}
h2 .n{font:500 13px var(--font-mono);letter-spacing:.06em;color:var(--ink-3);display:block;text-transform:uppercase;margin-bottom:4px}
.skill{scroll-margin-top:16px}
.skill h3{font:600 19px/1.3 var(--font-body);margin:0}
.tags{display:inline-flex;gap:6px;margin-left:6px;vertical-align:2px}
.tag{font:500 11px var(--font-mono);letter-spacing:.04em;padding:1px 7px;border-radius:999px;border:1px solid var(--line);color:var(--ink-2);text-transform:uppercase}
.tag.hot{border-color:color-mix(in srgb,var(--hot) 55%,var(--line));background:color-mix(in srgb,var(--hot) 16%,var(--surface));color:var(--ink)}
.desc{color:var(--ink-2);margin:6px 0 0}
.why{margin:8px 0 0}
h4{font:500 12px var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);margin:16px 0 6px}
ul.res{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.card p + ul.res{margin-top:14px}
ul.res li{padding-left:12px;border-left:3px solid var(--surface-2)}
ul.res li.hotpick{border-left-color:color-mix(in srgb,var(--hot) 60%,var(--line))}
.rt{font-weight:600}.rm{font:400 12.5px var(--font-mono);color:var(--ink-3)}
.rn{display:block;font-size:14.5px;color:var(--ink-2)}
ul.skills{margin:0;padding-left:20px;font-size:15px}
ol.papers{margin:0;padding-left:22px;font-size:15px}ol.papers li{margin:4px 0}
.tools{font-size:14.5px;color:var(--ink-2)}
.cap{border-color:var(--role);box-shadow:inset 0 0 0 1px var(--role)}
footer{margin-top:48px;font-size:13px;color:var(--ink-3)}
`;

function resItem(r) {
  const meta = r.kind === 'course'
    ? [r.t, r.f, r.part && `Here: ${r.part}`].filter(Boolean)
    : ['Free', r.effort, r.stars ? `★ ${r.stars.toLocaleString('en-US')}` : '', r.part && `Here: ${r.part}`].filter(Boolean);
  const code = r.kind === 'course' ? r.title.slice((r.s || '').length).trim() : ''; // "DeepLearning.AI MCP" -> "MCP"
  const name = r.kind === 'project' ? r.n
    : (r.s === 'DeepLearning.AI' || (code && r.n.toLowerCase().includes(code.toLowerCase())) ? `${r.s}: ${r.n}` : `${r.title}: ${r.n}`);
  const by = r.kind === 'project' && r.by ? ` <span class="rm">${esc(r.by)}</span>` : '';
  return `<li${r.hot ? ' class="hotpick"' : ''}><a class="rt" href="${esc(r.u)}" rel="noopener">${esc(name)}</a>${by}${r.hot ? ' <span class="tag hot">Popular</span>' : ''}
<span class="rm">${esc(meta.join(' · '))}</span>${r.note ? `<span class="rn">${esc(r.note)}</span>` : ''}</li>`;
}

function rolePage(role, data, all) {
  const N = data.nodes, slug = SLUG[role.id], url = `${MAP}${slug}/`;
  const tiers = [...new Set(role.nodes.map(id => N[id].tier))].sort((a, b) => a - b);
  const order = id => [BRANCH[role.id]?.[id] || '', role.optional.includes(id) ? 1 : 0, role.nodes.indexOf(id)];
  const cmp = (a, b) => { const x = order(a), y = order(b); return x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : x[1] - y[1] || x[2] - y[2]; };
  const steps = tiers.map((t, i) => ({ n: i + 1, tier: data.tiers[t], ids: role.nodes.filter(id => N[id].tier === t).sort(cmp) }));
  const nCourses = new Set(role.nodes.flatMap(id => N[id].courses.map(c => c.u))).size;
  const nProjects = new Set(role.nodes.flatMap(id => N[id].projects.map(c => c.u))).size;
  const nPapers = role.nodes.reduce((s, id) => s + N[id].papers.length, 0);
  const desc = `Step-by-step path to ${role.name}: ${role.nodes.length} skills from foundations to specialization, with ${nCourses} free courses, ${nProjects} free projects, ${nPapers} ${role.nodes.some(id => N[id].papers.some(x => x.guide)) ? 'papers and guides' : 'papers'}, a capstone and interview prep.`;
  const title = `${role.name} path: skills, free courses and projects`;
  const tagsFor = id => [role.optional.includes(id) ? 'optional' : '', BRANCH[role.id]?.[id] || ''].filter(Boolean);
  const anchor = id => `skill-${id}`;
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'LearningResource', name: title, description: desc, url, inLanguage: 'en', isAccessibleForFree: true,
      learningResourceType: 'Learning path', teaches: role.nodes.map(id => N[id].title),
      author: { '@type': 'Person', name: 'Tom Yang', url: `${SITE}/` }, isPartOf: { '@type': 'WebPage', name: 'AI Career Path Map', url: MAP } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tom Yang', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'AI Career Path Map', item: MAP },
      { '@type': 'ListItem', position: 3, name: role.name, item: url }] },
  ];
  const body = steps.map(st => `
<section aria-labelledby="step-${st.n}">
<h2 id="step-${st.n}"><span class="n">Step ${st.n}</span>${esc(st.tier)}</h2>
${st.ids.map((id, i) => { const n = N[id], tg = tagsFor(id); return `
<article class="card skill" id="${anchor(id)}">
<h3>${st.n}.${i + 1} ${esc(n.title)}${tg.length ? `<span class="tags">${tg.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</span>` : ''}</h3>
<p class="desc">${esc(n.desc)}.</p>
<p class="why">${esc(n.why)}</p>
${n.roles.length > 1 ? `<p class="rm">Also on the path for: ${n.roles.filter(r => r !== role.id).map(r => `<a href="../${SLUG[r]}/#${anchor(id)}">${esc(all.find(x => x.id === r).name)}</a>`).join(', ')}</p>` : ''}
<h4>Skills</h4><ul class="skills">${n.skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
${n.courses.length ? `<h4>Courses</h4><ul class="res">${n.courses.map(resItem).join('\n')}</ul>` : ''}
${n.projects.length ? `<h4>Free projects</h4><ul class="res">${n.projects.map(resItem).join('\n')}</ul>` : ''}
${n.papers.length ? `<h4>Reading</h4><ol class="papers">${n.papers.map(p => `<li><a href="${esc(p.u)}" rel="noopener">${esc(p.t)}</a> <span class="rm">${esc(p.a)}${p.y ? `, ${p.y}` : ''}${p.guide ? ' · guide' : ''}${p.star ? ' · must-read' : ''}</span></li>`).join('')}</ol>` : ''}
<h4>Tools</h4><p class="tools">${n.tools.map(t => esc(t.name) + (t.lic === 'oss' ? '' : ' (enterprise)')).join(' · ')}</p>
</article>`; }).join('')}
</section>`).join('');
  const follow = FOLLOW[role.id] || [];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | AI Career Path Map</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Tom Yang">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${MAP}og/${slug}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(role.name)} path on the AI Career Path Map">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${MAP}og/${slug}.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600&family=Source+Serif+4:opsz,wght@8..60,700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>${CSS}</style>
</head>
<body style="--role:var(--r-${role.id})">
<div class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Tom Yang</a><span aria-hidden="true">›</span><a href="../">AI Career Path Map</a><span aria-hidden="true">›</span><span aria-current="page">${esc(role.name)}</span></nav>
<header>
<h1>${esc(role.name)}</h1>
<p class="story">${esc(role.story)}</p>
<p class="stack">Defining stack: ${esc(role.stack.join(' · '))}</p>
<div class="cta"><a class="primary" href="../#${role.id}">Open this path on the interactive map</a><a href="${REPO}#${esc(role.name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-'))}" rel="noopener">Minimal steps on GitHub</a></div>
<p class="others">Other paths: ${all.filter(r => r.id !== role.id).map(r => `<a href="../${SLUG[r.id]}/">${esc(r.name)}</a>`).join(' · ')}</p>
</header>
<nav class="card toc" aria-labelledby="toc-h"><h4 id="toc-h" style="margin-top:0">The path at a glance</h4><ol>
${steps.map(st => `<li><a href="#step-${st.n}">Step ${st.n} · ${esc(st.tier)}</a><div class="sk">${st.ids.map(id => `<a href="#${anchor(id)}">${esc(N[id].title)}</a>`).join(' · ')}</div></li>`).join('\n')}
<li><a href="#capstone">Step ${steps.length + 1} · Capstone</a></li>
<li><a href="#hired">Step ${steps.length + 2} · Get hired</a></li>
</ol></nav>
${body}
<section aria-labelledby="capstone">
<h2 id="capstone"><span class="n">Step ${steps.length + 1}</span>Capstone</h2>
<div class="card cap"><h3>${esc(role.capTitle)}</h3><p class="why">${esc(role.capstone)}</p>
${follow.length ? `<h4>Follow along</h4><ul class="res">${follow.map(([n, u, d]) => `<li><a class="rt" href="${esc(u)}" rel="noopener">${esc(n)}</a><span class="rn">${esc(d)}</span></li>`).join('')}</ul>` : ''}
</div>
</section>
<section aria-labelledby="hired">
<h2 id="hired"><span class="n">Step ${steps.length + 2}</span>Get hired</h2>
<div class="card"><h4 style="margin-top:0">Interview prep</h4><ul class="res">${GET_HIRED[role.id].links.map(([n, u, d]) => `<li><a class="rt" href="${esc(u)}" rel="noopener">${esc(n)}</a><span class="rn">${esc(d)}</span></li>`).join('')}</ul>
<h4>Portfolio</h4><p class="why">${esc(GET_HIRED[role.id].portfolio)}</p></div>
</section>
<section aria-labelledby="free">
<h2 id="free">Do the projects for $0</h2>
<div class="card"><p class="why" style="margin-top:0">Most projects call an LLM API, and free tiers cover the coursework (their limits change, so check each). For training and fine-tuning, free notebook GPUs go a long way. The capstones that need bigger GPUs say so, with a rough cost.</p>
<ul class="res">${FREE.map(([n, u, d]) => `<li><a class="rt" href="${esc(u)}" rel="noopener">${esc(n)}</a><span class="rn">${esc(d.charAt(0).toUpperCase() + d.slice(1))}.</span></li>`).join('')}</ul></div>
</section>
<footer>
<p>Popular marks the most followed courses and projects in each skill: GitHub stars for projects, lecture views and enrollment for courses. Courses and projects were checked against their live pages in November 2026. Every project is free; a few need paid GPU time to run.</p>
<p>Role archetypes start from the job-posting clusters in the <a href="https://github.com/alexeygrigorev/ai-engineering-field-guide" rel="noopener">AI Engineering Field Guide</a>. Built by <a href="/">Tom Yang</a>.</p>
</footer>
</div>
</body>
</html>
`;
}

(async () => {
  const data = await extract();
  for (const role of data.roles) {
    const dir = path.join(ROOT, 'ai-career-paths', SLUG[role.id]);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), rolePage(role, data, data.roles));
    console.log('wrote', path.relative(ROOT, path.join(dir, 'index.html')));
  }
})();
