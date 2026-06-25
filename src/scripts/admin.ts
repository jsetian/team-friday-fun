import { ADMIN_SESSION_KEY, type Submission } from '../lib/tff-data';
import { apiRequest, apiUrl } from '../lib/tff-api';

const ADMIN_USERNAME_KEY = 'tff-work-style-lab-admin-username';
const ADMIN_PASSWORD_KEY = 'tff-work-style-lab-admin-password';

function saveCredentials(username: string, password: string) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
  sessionStorage.setItem(ADMIN_USERNAME_KEY, username);
  sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

function clearCredentials() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(ADMIN_USERNAME_KEY);
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
}

function isUnlocked() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1' && Boolean(getUsername()) && Boolean(getPassword());
}

function getUsername() {
  return sessionStorage.getItem(ADMIN_USERNAME_KEY) || '';
}

function getPassword() {
  return sessionStorage.getItem(ADMIN_PASSWORD_KEY) || '';
}

function adminHeaders() {
  return {
    'x-tff-admin-username': getUsername(),
    'x-tff-admin-password': getPassword(),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function fetchSubmissions(): Promise<Submission[]> {
  const response = await apiRequest('/submissions', { headers: adminHeaders() });
  const data = await response.json();
  return Array.isArray(data.submissions) ? data.submissions : [];
}

async function deleteSubmission(id: string) {
  const response = await fetch(apiUrl(`/submissions/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  if (!response.ok) throw new Error(await response.text());
}

async function fetchExportJson() {
  const response = await fetch(apiUrl('/export.json'), { headers: adminHeaders() });
  if (!response.ok) throw new Error(await response.text());
  return response.text();
}

async function fetchExportCsv() {
  const response = await fetch(apiUrl('/export.csv'), { headers: adminHeaders() });
  if (!response.ok) throw new Error(await response.text());
  return response.text();
}

function renderSubmissionList(listEl: HTMLElement, submissions: Submission[], select: (submission?: Submission) => void) {
  if (!submissions.length) {
    listEl.innerHTML = '<p class="mini-note">No submissions yet.</p>';
    select(undefined);
    return;
  }

  listEl.innerHTML = submissions
    .map(
      (submission, index) => `
        <button type="button" class="list-row ${index === 0 ? 'active' : ''}" data-index="${index}">
          <strong>${escapeHtml(submission.name || 'Unnamed')}</strong>
          <span>${escapeHtml(submission.role || 'No role label')}</span>
          <div class="meta">
            <span class="pill">${escapeHtml(formatDate(submission.createdAt))}</span>
            <span class="pill">Predicted: ${escapeHtml(submission.predictedStyle)}</span>
            <span class="pill">Primary: ${escapeHtml(submission.primaryStyle)}</span>
            <span class="pill">Secondary: ${escapeHtml(submission.secondaryStyle || '—')}</span>
          </div>
        </button>
      `,
    )
    .join('');

  listEl.querySelectorAll<HTMLButtonElement>('.list-row').forEach((button) => {
    button.addEventListener('click', () => {
      listEl.querySelectorAll('.list-row').forEach((row) => row.classList.remove('active'));
      button.classList.add('active');
      const index = Number(button.dataset.index || 0);
      select(submissions[index]);
    });
  });

  select(submissions[0]);
}

function renderDetail(detailEl: HTMLElement, submission: Submission | undefined, onDelete: (submission: Submission) => void) {
  if (!submission) {
    detailEl.innerHTML = '<p class="mini-note">Select a submission to see details.</p>';
    return;
  }

  detailEl.innerHTML = `
    <div class="detail-header">
      <div>
        <p class="kicker">Submission detail</p>
        <h2>${escapeHtml(submission.name || 'Unnamed')}</h2>
        <p class="mini-note">${escapeHtml(formatDate(submission.createdAt))}</p>
      </div>
      <button class="btn danger" type="button" data-delete-submission>Delete</button>
    </div>
    <div class="detail-grid">
      <div class="detail-card">
        <strong>Calculated profile</strong>
        <dl>
          <dt>Primary</dt><dd>${escapeHtml(submission.primaryStyle)}</dd>
          <dt>Secondary</dt><dd>${escapeHtml(submission.secondaryStyle || '—')}</dd>
          <dt>Predicted</dt><dd>${escapeHtml(submission.predictedStyle)}</dd>
        </dl>
      </div>
      <div class="detail-card">
        <strong>Trait scores</strong>
        <dl>
          <dt>Openness</dt><dd>${submission.traitScores.openness}</dd>
          <dt>Conscientiousness</dt><dd>${submission.traitScores.conscientiousness}</dd>
          <dt>Extraversion</dt><dd>${submission.traitScores.extraversion}</dd>
          <dt>Agreeableness</dt><dd>${submission.traitScores.agreeableness}</dd>
          <dt>Steadiness</dt><dd>${submission.traitScores.steadiness}</dd>
        </dl>
      </div>
    </div>
    <div class="detail-card">
      <strong>Raw scored answers</strong>
      <div class="raw-grid codebox">${Object.entries(submission.rawAnswers)
        .filter(([key]) => key.startsWith('q'))
        .map(([key, value]) => `<div><b>${escapeHtml(key)}</b><div>${escapeHtml(String(value))}</div></div>`)
        .join('')}</div>
    </div>
    <div class="detail-card">
      <strong>Playful answers</strong>
      <div class="playful-grid">${Object.entries(submission.playfulAnswers)
        .map(([key, value]) => `<div><b>${escapeHtml(key)}</b><div>${escapeHtml(String(value))}</div></div>`)
        .join('')}</div>
    </div>
    <div class="detail-card">
      <strong>Normalized style scores</strong>
      <div class="codebox">${escapeHtml(JSON.stringify(submission.styleScores, null, 2))}</div>
    </div>
  `;

  detailEl.querySelector<HTMLButtonElement>('[data-delete-submission]')?.addEventListener('click', () => onDelete(submission));
}

async function renderAdmin() {
  const lockScreen = document.querySelector<HTMLElement>('[data-lock-screen]');
  const adminShell = document.querySelector<HTMLElement>('[data-admin-shell]');
  const listEl = document.querySelector<HTMLElement>('[data-submission-list]');
  const detailEl = document.querySelector<HTMLElement>('[data-submission-detail]');
  const statsEl = document.querySelector<HTMLElement>('[data-admin-stats]');
  if (!lockScreen || !adminShell || !listEl || !detailEl || !statsEl) return;

  const unlockForm = document.querySelector<HTMLFormElement>('[data-lock-form]');
  const unlockError = document.querySelector<HTMLElement>('[data-lock-error]');
  const lockButton = document.querySelector<HTMLElement>('[data-lock-admin]');
  const exportJsonButton = document.querySelector<HTMLElement>('[data-export-json]');
  const exportCsvButton = document.querySelector<HTMLElement>('[data-export-csv]');

  const showLocked = () => {
    lockScreen.hidden = false;
    adminShell.hidden = true;
  };
  const showUnlocked = () => {
    lockScreen.hidden = true;
    adminShell.hidden = false;
  };

  let submissions: Submission[] = [];

  const renderStats = () => {
    statsEl.innerHTML = `
      <article class="metric-card"><strong>${submissions.length}</strong><span>submissions saved</span></article>
      <article class="metric-card"><strong>${submissions.length ? 'Ready' : 'Waiting'}</strong><span>export status</span></article>
      <article class="metric-card"><strong>SQLite</strong><span>simple durable storage</span></article>
    `;
  };

  const handleDelete = async (submission: Submission) => {
    if (!confirm(`Delete ${submission.name || 'this submission'}? This cannot be undone.`)) return;
    await deleteSubmission(submission.id);
    await refresh();
  };

  const refresh = async () => {
    try {
      submissions = await fetchSubmissions();
      renderStats();
      renderSubmissionList(listEl, submissions, (submission) => renderDetail(detailEl, submission, handleDelete));
      showUnlocked();
    } catch (error) {
      clearCredentials();
      showLocked();
      if (unlockError) {
        unlockError.hidden = false;
        unlockError.textContent = error instanceof Error ? error.message : 'Admin unlock failed.';
      }
    }
  };

  unlockForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(unlockForm);
    const username = String(form.get('username') || '').trim();
    const password = String(form.get('password') || '');
    saveCredentials(username, password);
    if (unlockError) unlockError.hidden = true;
    await refresh();
  });

  lockButton?.addEventListener('click', () => {
    clearCredentials();
    showLocked();
  });

  exportJsonButton?.addEventListener('click', async () => {
    const payload = await fetchExportJson();
    download(`tff-work-style-lab-${new Date().toISOString().slice(0, 10)}.json`, payload, 'application/json');
  });

  exportCsvButton?.addEventListener('click', async () => {
    const payload = await fetchExportCsv();
    download(`tff-work-style-lab-${new Date().toISOString().slice(0, 10)}.csv`, payload, 'text/csv');
  });

  if (isUnlocked()) {
    await refresh();
  } else {
    showLocked();
  }
}

renderAdmin();
