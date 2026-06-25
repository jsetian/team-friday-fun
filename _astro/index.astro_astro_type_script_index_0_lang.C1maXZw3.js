import{A as m,a as f,b as N}from"./tff-api.n3oEdvwz.js";const S="tff-work-style-lab-admin-username",v="tff-work-style-lab-admin-password";function j(t,e){sessionStorage.setItem(m,"1"),sessionStorage.setItem(S,t),sessionStorage.setItem(v,e)}function g(){sessionStorage.removeItem(m),sessionStorage.removeItem(S),sessionStorage.removeItem(v)}function U(){return sessionStorage.getItem(m)==="1"&&!!h()&&!!$()}function h(){return sessionStorage.getItem(S)||""}function $(){return sessionStorage.getItem(v)||""}function l(){return{"x-tff-admin-username":h(),"x-tff-admin-password":$()}}function a(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function k(t){const e=new Date(t);return Number.isNaN(e.getTime())?t:e.toLocaleString()}function w(t,e,o){const n=new Blob([e],{type:o}),s=URL.createObjectURL(n),d=document.createElement("a");d.href=s,d.download=t,document.body.append(d),d.click(),d.remove(),URL.revokeObjectURL(s)}async function O(){const e=await(await N("/submissions",{headers:l()})).json();return Array.isArray(e.submissions)?e.submissions:[]}async function R(t){const e=await fetch(f(`/submissions/${encodeURIComponent(t)}`),{method:"DELETE",headers:l()});if(!e.ok)throw new Error(await e.text())}async function M(){const t=await fetch(f("/export.json"),{headers:l()});if(!t.ok)throw new Error(await t.text());return t.text()}async function T(){const t=await fetch(f("/export.csv"),{headers:l()});if(!t.ok)throw new Error(await t.text());return t.text()}function C(t,e,o){if(!e.length){t.innerHTML='<p class="mini-note">No submissions yet.</p>',o(void 0);return}t.innerHTML=e.map((n,s)=>`
        <button type="button" class="list-row ${s===0?"active":""}" data-index="${s}">
          <strong>${a(n.name||"Unnamed")}</strong>
          <span>${a(n.role||"No role label")}</span>
          <div class="meta">
            <span class="pill">${a(k(n.createdAt))}</span>
            <span class="pill">Predicted: ${a(n.predictedStyle)}</span>
            <span class="pill">Primary: ${a(n.primaryStyle)}</span>
            <span class="pill">Secondary: ${a(n.secondaryStyle||"—")}</span>
          </div>
        </button>
      `).join(""),t.querySelectorAll(".list-row").forEach(n=>{n.addEventListener("click",()=>{t.querySelectorAll(".list-row").forEach(d=>d.classList.remove("active")),n.classList.add("active");const s=Number(n.dataset.index||0);o(e[s])})}),o(e[0])}function H(t,e,o){if(!e){t.innerHTML='<p class="mini-note">Select a submission to see details.</p>';return}t.innerHTML=`
    <div class="detail-header">
      <div>
        <p class="kicker">Submission detail</p>
        <h2>${a(e.name||"Unnamed")}</h2>
        <p class="mini-note">${a(k(e.createdAt))}</p>
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
      <div class="raw-grid codebox">${Object.entries(e.rawAnswers).filter(([n])=>n.startsWith("q")).map(([n,s])=>`<div><b>${a(n)}</b><div>${a(String(s))}</div></div>`).join("")}</div>
    </div>
    <div class="detail-card">
      <strong>Playful answers</strong>
      <div class="playful-grid">${Object.entries(e.playfulAnswers).map(([n,s])=>`<div><b>${a(n)}</b><div>${a(String(s))}</div></div>`).join("")}</div>
    </div>
    <div class="detail-card">
      <strong>Normalized style scores</strong>
      <div class="codebox">${a(JSON.stringify(e.styleScores,null,2))}</div>
    </div>
  `,t.querySelector("[data-delete-submission]")?.addEventListener("click",()=>o(e))}async function P(){const t=document.querySelector("[data-lock-screen]"),e=document.querySelector("[data-admin-shell]"),o=document.querySelector("[data-submission-list]"),n=document.querySelector("[data-submission-detail]"),s=document.querySelector("[data-admin-stats]");if(!t||!e||!o||!n||!s)return;const d=document.querySelector("[data-lock-form]"),c=document.querySelector("[data-lock-error]"),b=document.querySelector("[data-lock-admin]"),x=document.querySelector("[data-export-json]"),E=document.querySelector("[data-export-csv]"),u=()=>{t.hidden=!1,e.hidden=!0},L=()=>{t.hidden=!0,e.hidden=!1};let i=[];const A=()=>{s.innerHTML=`
      <article class="metric-card"><strong>${i.length}</strong><span>submissions saved</span></article>
      <article class="metric-card"><strong>${i.length?"Ready":"Waiting"}</strong><span>export status</span></article>
      <article class="metric-card"><strong>SQLite</strong><span>simple durable storage</span></article>
    `},q=async r=>{confirm(`Delete ${r.name||"this submission"}? This cannot be undone.`)&&(await R(r.id),await p())},p=async()=>{try{i=await O(),A(),C(o,i,r=>H(n,r,q)),L()}catch(r){g(),u(),c&&(c.hidden=!1,c.textContent=r instanceof Error?r.message:"Admin unlock failed.")}};d?.addEventListener("submit",async r=>{r.preventDefault();const y=new FormData(d),I=String(y.get("username")||"").trim(),D=String(y.get("password")||"");j(I,D),c&&(c.hidden=!0),await p()}),b?.addEventListener("click",()=>{g(),u()}),x?.addEventListener("click",async()=>{const r=await M();w(`tff-work-style-lab-${new Date().toISOString().slice(0,10)}.json`,r,"application/json")}),E?.addEventListener("click",async()=>{const r=await T();w(`tff-work-style-lab-${new Date().toISOString().slice(0,10)}.csv`,r,"text/csv")}),U()?await p():u()}P();
