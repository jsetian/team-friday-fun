import{A as h,a as g,b as D}from"./tff-api.CThBq9JB.js";const y="tff-work-style-lab-admin-username",f="tff-work-style-lab-admin-password";function N(t,e){sessionStorage.setItem(h,"1"),sessionStorage.setItem(y,t),sessionStorage.setItem(f,e)}function v(){sessionStorage.removeItem(h),sessionStorage.removeItem(y),sessionStorage.removeItem(f)}function P(){return sessionStorage.getItem(h)==="1"&&!!w()&&!!k()}function w(){return sessionStorage.getItem(y)||""}function k(){return sessionStorage.getItem(f)||""}function p(){return{"x-tff-admin-username":w(),"x-tff-admin-password":k()}}function a(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function $(t){const e=new Date(t);return Number.isNaN(e.getTime())?t:e.toLocaleString()}function S(t,e,o){const r=new Blob([e],{type:o}),s=URL.createObjectURL(r),i=document.createElement("a");i.href=s,i.download=t,document.body.append(i),i.click(),i.remove(),URL.revokeObjectURL(s)}async function T(){const e=await(await D("/submissions",{headers:p()})).json();return Array.isArray(e.submissions)?e.submissions:[]}async function M(t){const e=await fetch(g(`/submissions/${encodeURIComponent(t)}`),{method:"DELETE",headers:p()});if(!e.ok)throw new Error(await e.text())}async function j(){const t=await fetch(g("/export.json"),{headers:p()});if(!t.ok)throw new Error(await t.text());return t.text()}async function O(){const t=await fetch(g("/export.csv"),{headers:p()});if(!t.ok)throw new Error(await t.text());return t.text()}function R(t,e,o){if(!e.length){t.innerHTML='<p class="mini-note">No submissions yet.</p>',o(void 0);return}t.innerHTML=e.map((r,s)=>`
        <button type="button" class="list-row ${s===0?"active":""}" data-index="${s}">
          <strong>${a(r.name||"Unnamed")}</strong>
          <span>${a(r.role||"No role label")}</span>
          <div class="meta">
            <span class="pill">${a($(r.createdAt))}</span>
            <span class="pill">Predicted: ${a(r.predictedStyle)}</span>
            <span class="pill">Primary: ${a(r.primaryStyle)}</span>
            <span class="pill">Secondary: ${a(r.secondaryStyle||"—")}</span>
          </div>
        </button>
      `).join(""),t.querySelectorAll(".list-row").forEach(r=>{r.addEventListener("click",()=>{t.querySelectorAll(".list-row").forEach(i=>i.classList.remove("active")),r.classList.add("active");const s=Number(r.dataset.index||0);o(e[s])})}),o(e[0])}function C(t,e,o){if(!e){t.innerHTML='<p class="mini-note">Select a submission to see details.</p>';return}t.innerHTML=`
    <div class="detail-header">
      <div>
        <p class="kicker">Submission detail</p>
        <h2>${a(e.name||"Unnamed")}</h2>
        <p class="mini-note">${a($(e.createdAt))}</p>
      </div>
      <button class="btn danger" type="button" data-delete-submission>Delete</button>
    </div>
    <div class="detail-grid">
      <div class="detail-card">
        <strong>Calculated profile</strong>
        <dl>
          <dt>Primary</dt><dd>${a(e.primaryStyle)}</dd>
          <dt>Secondary</dt><dd>${a(e.secondaryStyle||"—")}</dd>
          <dt>Predicted</dt><dd>${a(e.predictedStyle)}</dd>
          <dt>Sketch</dt><dd>${e.portrait?.dataUrl?"Generated":"Not generated yet"}</dd>
        </dl>
      </div>
      <div class="detail-card">
        <strong>Trait scores</strong>
        <dl>
          <dt>Openness</dt><dd>${e.traitScores.openness}</dd>
          <dt>Conscientiousness</dt><dd>${e.traitScores.conscientiousness}</dd>
          <dt>Extraversion</dt><dd>${e.traitScores.extraversion}</dd>
          <dt>Agreeableness</dt><dd>${e.traitScores.agreeableness}</dd>
          <dt>Steadiness</dt><dd>${e.traitScores.steadiness}</dd>
        </dl>
      </div>
    </div>
    <div class="detail-card">
      <strong>Raw scored answers</strong>
      <div class="raw-grid codebox">${Object.entries(e.rawAnswers).filter(([r])=>r.startsWith("q")).map(([r,s])=>`<div><b>${a(r)}</b><div>${a(String(s))}</div></div>`).join("")}</div>
    </div>
    <div class="detail-card">
      <strong>Playful answers</strong>
      <div class="playful-grid">${Object.entries(e.playfulAnswers).map(([r,s])=>`<div><b>${a(r)}</b><div>${a(String(s))}</div></div>`).join("")}</div>
    </div>
    <div class="detail-card">
      <strong>Normalized style scores</strong>
      <div class="codebox">${a(JSON.stringify(e.styleScores,null,2))}</div>
    </div>
    ${e.portrait?.dataUrl?`
      <div class="detail-card">
        <strong>Generated work-style character sketch</strong>
        <img class="admin-portrait" src="${e.portrait.dataUrl}" alt="Generated work-style character sketch for ${a(e.name||"submission")}" />
      </div>
    `:""}
    <div class="detail-card">
      <strong>Work-style image prompt</strong>
      <p class="mini-note">This is generated automatically after a quiz is saved, from the saved answers/profile.</p>
      <div class="codebox">${a(e.portraitPrompt||H(e))}</div>
    </div>
  `,t.querySelector("[data-delete-submission]")?.addEventListener("click",()=>o(e))}function H(t){const e=t.playfulAnswers;return`Create a playful, warm, polished editorial character sketch that imagines what this person's work-style alter ego might look like for a team presentation guessing game.

IMPORTANT RULES:
- No text, no letters, no numbers, no labels, no logos, no captions, no signs, no badges.
- Do not include the person's name.
- Do not make it look like a real employee photo or formal portrait; make it a symbolic character generated from scratch.
- Make it friendly and workplace-appropriate, clever rather than mocking.
- Use a clean modern presentation style with subtle humor and strong visual clues.

Work-style profile:
- Primary style: ${t.primaryStyle}
- Secondary style: ${t.secondaryStyle||"none"}
- Person predicted they might be: ${t.predictedStyle}

Trait scores, 0 to 100:
- Openness: ${t.traitScores.openness}
- Conscientiousness: ${t.traitScores.conscientiousness}
- Extraversion: ${t.traitScores.extraversion}
- Agreeableness: ${t.traitScores.agreeableness}
- Steadiness: ${t.traitScores.steadiness}

Playful clues from their answers:
- Vehicle metaphor: ${e.vehicle}
- Workday soundtrack: ${e.soundtrack}
- Moment where they feel useful: ${e.usefulMoment}
- Work-style superpower: ${e.superpower}
- Character presentation direction: ${e.characterPresentation||"Surprise me"}
- What they want AI to help with: ${e.aiHelp}

Image concept:
A single expressive character in a lightly surreal office/creative-work environment, with clothing, props, posture, energy, and composition hinting at the profile and playful clues. It should feel like a clever sketch of what this person's work personality might look like, not a literal portrait. The team should be able to guess both who it is and what style they scored as from the visual clues alone. No words anywhere in the image.`}async function W(){const t=document.querySelector("[data-lock-screen]"),e=document.querySelector("[data-admin-shell]"),o=document.querySelector("[data-submission-list]"),r=document.querySelector("[data-submission-detail]"),s=document.querySelector("[data-admin-stats]");if(!t||!e||!o||!r||!s)return;const i=document.querySelector("[data-lock-form]"),d=document.querySelector("[data-lock-error]"),x=document.querySelector("[data-lock-admin]"),b=document.querySelector("[data-export-json]"),A=document.querySelector("[data-export-csv]"),m=()=>{t.hidden=!1,e.hidden=!0},E=()=>{t.hidden=!0,e.hidden=!1};let c=[];const L=()=>{const n=c.filter(l=>l.portrait?.dataUrl).length;s.innerHTML=`
      <article class="metric-card"><strong>${c.length}</strong><span>submissions saved</span></article>
      <article class="metric-card"><strong>${n}</strong><span>images generated</span></article>
      <article class="metric-card"><strong>${c.length?"Ready":"Waiting"}</strong><span>export status</span></article>
      <article class="metric-card"><strong>SQLite</strong><span>simple durable storage</span></article>
    `},I=async n=>{confirm(`Delete ${n.name||"this submission"}? This cannot be undone.`)&&(await M(n.id),await u())},u=async()=>{try{c=await T(),L(),R(o,c,n=>C(r,n,I)),E()}catch(n){v(),m(),d&&(d.hidden=!1,d.textContent=n instanceof Error?n.message:"Admin unlock failed.")}};i?.addEventListener("submit",async n=>{n.preventDefault();const l=new FormData(i),U=String(l.get("username")||"").trim(),q=String(l.get("password")||"");N(U,q),d&&(d.hidden=!0),await u()}),x?.addEventListener("click",()=>{v(),m()}),b?.addEventListener("click",async()=>{const n=await j();S(`tff-work-style-lab-${new Date().toISOString().slice(0,10)}.json`,n,"application/json")}),A?.addEventListener("click",async()=>{const n=await O();S(`tff-work-style-lab-${new Date().toISOString().slice(0,10)}.csv`,n,"text/csv")}),P()?await u():m()}W();
