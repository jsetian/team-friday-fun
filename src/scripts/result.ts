import { apiUrl } from '../lib/tff-api';
import { traitCopy } from '../lib/tff-data';

async function initResultPage() {
  const primaryStyle = document.querySelector<HTMLElement>('[data-primary-style]');
  const traitShell = document.querySelector<HTMLElement>('[data-trait-shell]');
  const traitSummary = document.querySelector<HTMLElement>('[data-trait-summary]');
  if (!primaryStyle || !traitShell || !traitSummary) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    traitShell.hidden = true;
    return;
  }

  try {
    const response = await fetch(apiUrl(`/submissions/${encodeURIComponent(id)}`));
    const data = await response.json().catch(() => ({}));
    const submission = data.submission;
    if (submission) {
      primaryStyle.textContent = submission.primaryStyle || '—';
      traitShell.hidden = false;
      const traitRows = Object.entries(submission.traitScores || {})
        .map(([key, value]) => {
          const trait = traitCopy[key as keyof typeof traitCopy];
          if (!trait) return '';
          return `
            <div class="trait-row">
              <strong>${trait.title}: ${value}</strong>
              <p>${trait.summary}</p>
            </div>
          `;
        })
        .join('');
      traitSummary.innerHTML = `
        <p class="mini-note">This is the custom result profile based on your answers.</p>
        <div class="trait-grid">${traitRows}</div>
      `;
    }
  } catch {
    traitShell.hidden = true;
  }

}

void initResultPage();
