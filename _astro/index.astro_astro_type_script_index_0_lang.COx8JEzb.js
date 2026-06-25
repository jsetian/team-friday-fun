import{a as d,t as u}from"./tff-api.n3oEdvwz.js";async function m(){const s=document.querySelector("[data-primary-style]"),t=document.querySelector("[data-trait-shell]"),i=document.querySelector("[data-trait-summary]");if(!s||!t||!i)return;const a=new URLSearchParams(window.location.search).get("id");if(!a){t.hidden=!0;return}try{const e=(await(await fetch(d(`/submissions/${encodeURIComponent(a)}`))).json().catch(()=>({}))).submission;if(e){s.textContent=e.primaryStyle||"—",t.hidden=!1;const n=Object.entries(e.traitScores||{}).map(([o,c])=>{const r=u[o];return r?`
            <div class="trait-row">
              <strong>${r.title}: ${c}</strong>
              <p>${r.summary}</p>
            </div>
          `:""}).join("");i.innerHTML=`
        <p class="mini-note">This is the custom result profile based on your answers.</p>
        <div class="trait-grid">${n}</div>
      `}}catch{t.hidden=!0}}m();
