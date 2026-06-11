import { apiUrl } from '../lib/tff-api';
import { traitCopy } from '../lib/tff-data';

async function initResultPage() {
  const primaryStyle = document.querySelector<HTMLElement>('[data-primary-style]');
  const traitShell = document.querySelector<HTMLElement>('[data-trait-shell]');
  const traitSummary = document.querySelector<HTMLElement>('[data-trait-summary]');
  const portraitShell = document.querySelector<HTMLElement>('[data-portrait-shell]');
  const status = document.querySelector<HTMLElement>('[data-portrait-status]');
  const image = document.querySelector<HTMLImageElement>('[data-portrait-image]');
  if (!primaryStyle || !traitShell || !traitSummary || !portraitShell || !status || !image) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    traitShell.hidden = true;
    portraitShell.hidden = true;
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

  portraitShell.hidden = false;
  status.innerHTML = '<span class="loading-dot" aria-hidden="true"></span> Generating your work-style character sketch… this usually takes 10–45 seconds.';

  try {
    const response = await fetch(apiUrl(`/submissions/${encodeURIComponent(id)}/portrait`), {
      method: 'POST',
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      status.textContent = 'Your quiz is saved. Character sketch generation is not available yet, so we’ll generate it later for the presentation.';
      return;
    }

    if (data.portrait?.dataUrl) {
      image.src = data.portrait.dataUrl;
      image.hidden = false;
      status.textContent = 'Your work-style character sketch is ready. No spoilers — this may show up in the team guessing game.';
      return;
    }

    status.textContent = 'Your quiz is saved. Character sketch generation will finish later.';
  } catch {
    status.textContent = 'Your quiz is saved. Character sketch generation hit a temporary issue, so we’ll generate it later.';
  }
}

void initResultPage();
