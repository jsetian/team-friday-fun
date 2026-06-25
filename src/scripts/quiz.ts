import { buildSubmission } from '../lib/tff-data';
import { apiRequest } from '../lib/tff-api';

function initQuizForm() {
  const form = document.querySelector<HTMLFormElement>('[data-quiz-form]');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll<HTMLElement>('[data-quiz-step]'));
  const progressText = document.querySelector<HTMLElement>('[data-step-progress-text]');
  const progressFill = document.querySelector<HTMLElement>('[data-step-progress-fill]');
  const prevButton = form.querySelector<HTMLButtonElement>('[data-prev-step]');
  const nextButton = form.querySelector<HTMLButtonElement>('[data-next-step]');
  const submitButton = form.querySelector<HTMLButtonElement>('[data-submit-step]');
  let activeIndex = 0;
  let autoAdvanceTimer: number | undefined;

  const updateProgress = () => {
    if (progressText) progressText.textContent = `Step ${activeIndex + 1} of ${steps.length}`;
    if (progressFill) progressFill.style.width = `${((activeIndex + 1) / Math.max(steps.length, 1)) * 100}%`;
  };

  const updateOtherInputs = () => {
    form.querySelectorAll<HTMLElement>('[data-other-wrap]').forEach((wrap) => {
      const id = wrap.dataset.otherWrap;
      if (!id) return;
      const radio = form.querySelector<HTMLInputElement>(`input[data-other-radio="${CSS.escape(id)}"]`);
      const input = form.querySelector<HTMLInputElement>(`input[data-other-input="${CSS.escape(id)}"]`);
      const active = Boolean(radio?.checked);
      wrap.hidden = !active;
      if (input) {
        input.required = active;
        if (!active) input.value = '';
        if (active) window.setTimeout(() => input.focus(), 60);
      }
    });
  };

  const isStepComplete = (index: number) => {
    const step = steps[index];
    if (!step) return true;
    const required = Array.from(step.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input[required], textarea[required], select[required]'));
    return required.every((field) => {
      if (field instanceof HTMLInputElement && (field.type === 'radio' || field.type === 'checkbox')) {
        const group = field.name ? Array.from(step.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]`)) : [field];
        return group.some((input) => input.checked);
      }
      return field.checkValidity();
    });
  };

  const setButtonVisible = (button: HTMLButtonElement | null, visible: boolean) => {
    if (!button) return;
    button.hidden = !visible;
    button.style.display = visible ? '' : 'none';
  };

  const updateSubmitState = () => {
    if (!submitButton) return;
    const readyToSubmit = activeIndex === steps.length - 1 && isStepComplete(activeIndex);
    setButtonVisible(submitButton, readyToSubmit);
    submitButton.disabled = !readyToSubmit;
  };

  const showStep = (index: number) => {
    activeIndex = Math.min(Math.max(index, 0), steps.length - 1);
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === activeIndex;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });
    if (prevButton) prevButton.disabled = activeIndex === 0;
    setButtonVisible(nextButton, activeIndex === 0);
    updateProgress();
    updateSubmitState();
  };

  const validateStep = (index: number) => {
    const step = steps[index];
    if (!step) return true;
    const required = Array.from(step.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input[required], textarea[required], select[required]'));
    for (const field of required) {
      if (field instanceof HTMLInputElement && (field.type === 'radio' || field.type === 'checkbox')) {
        const group = field.name ? Array.from(step.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(field.name)}"]`)) : [field];
        if (!group.some((input) => input.checked)) {
          const first = group[0];
          first?.focus();
          first?.reportValidity();
          return false;
        }
        continue;
      }
      if (!field.checkValidity()) {
        field.focus();
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const submitQuiz = async () => {
    if (!validateStep(activeIndex)) return;

    for (let index = 0; index < steps.length; index += 1) {
      if (!validateStep(index)) {
        showStep(index);
        return;
      }
    }

    const data = new FormData(form);
    const playfulKeys = ['vehicle', 'soundtrack', 'usefulMoment', 'superpower', 'aiHelp'];
    const rawAnswers: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      if (!key.startsWith('q') && !['predictedStyle', ...playfulKeys].includes(key)) continue;
      rawAnswers[key] = String(value);
    }

    for (const key of playfulKeys) {
      if (rawAnswers[key] === '__other__') {
        rawAnswers[key] = String(data.get(`${key}Other`) || '').trim();
      }
    }

    const submission = buildSubmission({
      name: String(data.get('name') || '').trim(),
      role: '',
      showNameInPresentation: true,
      predictedStyle: String(data.get('predictedStyle') || 'Not sure') as any,
      rawAnswers,
    });

    if (submitButton) submitButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    if (prevButton) prevButton.disabled = true;
    try {
      await apiRequest('/submissions', {
        method: 'POST',
        body: JSON.stringify(submission),
      });
      const basePath = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      window.location.href = `${basePath}result/?id=${encodeURIComponent(submission.id)}`;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Submission failed. Please try again.');
      if (submitButton) submitButton.disabled = false;
      if (nextButton) nextButton.disabled = false;
      if (prevButton) prevButton.disabled = activeIndex === 0;
    }
  };

  const advanceAfterAnswer = (input: HTMLInputElement) => {
    window.clearTimeout(autoAdvanceTimer);
    if (input.value === '__other__') {
      updateOtherInputs();
      return;
    }
    autoAdvanceTimer = window.setTimeout(() => {
      if (!validateStep(activeIndex)) return;
      if (activeIndex === steps.length - 1) {
        updateSubmitState();
      } else {
        showStep(activeIndex + 1);
      }
    }, 220);
  };

  const wireChoiceTaps = () => {
    form.querySelectorAll<HTMLElement>('[data-choice]').forEach((choice) => {
      choice.addEventListener('click', () => {
        const input = choice.querySelector<HTMLInputElement>('input');
        if (!input) return;
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        updateOtherInputs();
        advanceAfterAnswer(input);
      });
    });

    form.querySelectorAll<HTMLInputElement>('[data-other-input]').forEach((input) => {
      input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (!validateStep(activeIndex)) return;
        if (activeIndex === steps.length - 1) {
          updateSubmitState();
        } else {
          showStep(activeIndex + 1);
        }
      });
    });

    form.addEventListener('input', updateSubmitState);
    form.addEventListener('change', () => {
      updateOtherInputs();
      updateSubmitState();
    });
  };

  wireChoiceTaps();
  updateOtherInputs();
  showStep(0);

  prevButton?.addEventListener('click', () => {
    showStep(activeIndex - 1);
  });

  nextButton?.addEventListener('click', () => {
    if (!validateStep(activeIndex)) return;
    showStep(activeIndex + 1);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitQuiz();
  });
}

initQuizForm();
