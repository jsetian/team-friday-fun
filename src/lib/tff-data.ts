export const EVENT_NAME = 'TFF Work Style Lab';
export const LANDING_TITLE = 'TFF Work Style Lab';
export const QUIZ_TITLE = 'TFF Work Style Quiz';
export const QUIZ_SUBTITLE = "Don't worry, you won't be graded.";

export const ADMIN_SESSION_KEY = 'tff-work-style-lab-admin-unlocked';
export const ADMIN_PASSWORD = import.meta.env.PUBLIC_TFF_ADMIN_PASSWORD?.trim() || 'team-friday';

export type StyleName =
  | 'Strategist'
  | 'Builder'
  | 'Translator'
  | 'Optimizer'
  | 'Spark'
  | 'Connector';

export type TraitName =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'steadiness';

export type TraitScores = Record<TraitName, number>;

export const workStyles: Array<{ name: StyleName; summary: string }> = [
  { name: 'Strategist', summary: 'Sees patterns, priorities, and future direction.' },
  { name: 'Builder', summary: 'Turns ideas into steps, systems, and execution.' },
  { name: 'Translator', summary: 'Makes complex ideas clear and usable for others.' },
  { name: 'Optimizer', summary: 'Improves what already exists and finds better ways.' },
  { name: 'Spark', summary: 'Brings creative energy, ideas, and momentum.' },
  { name: 'Connector', summary: 'Builds alignment, trust, and shared understanding.' },
];

export const predictedStyleOptions: Array<StyleName | 'Not sure'> = [
  'Strategist',
  'Builder',
  'Translator',
  'Optimizer',
  'Spark',
  'Connector',
  'Not sure',
];

export const likertLabels = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
] as const;

export const traitQuestions = [
  { id: 'q01', text: 'I enjoy exploring new ways to solve familiar problems.', trait: 'openness', reverse: false },
  { id: 'q02', text: 'I am energized by ideas that are not fully defined yet.', trait: 'openness', reverse: false },
  { id: 'q03', text: 'I like experimenting with different approaches before choosing a direction.', trait: 'openness', reverse: false },
  { id: 'q04', text: 'I prefer to stick with proven approaches even when there may be a better way.', trait: 'openness', reverse: true },
  { id: 'q05', text: 'I like turning broad goals into clear steps.', trait: 'conscientiousness', reverse: false },
  { id: 'q06', text: 'I feel better when ownership, deadlines, and next actions are clear.', trait: 'conscientiousness', reverse: false },
  { id: 'q07', text: 'I naturally notice details that could affect the final outcome.', trait: 'conscientiousness', reverse: false },
  { id: 'q08', text: 'I am comfortable starting work without much structure or a follow-through plan.', trait: 'conscientiousness', reverse: true },
  { id: 'q09', text: 'Talking through ideas with others helps me think better.', trait: 'extraversion', reverse: false },
  { id: 'q10', text: 'I often bring energy or momentum into group conversations.', trait: 'extraversion', reverse: false },
  { id: 'q11', text: 'I am comfortable sharing early thoughts before they are fully polished.', trait: 'extraversion', reverse: false },
  { id: 'q12', text: 'I usually prefer to process everything alone before discussing it.', trait: 'extraversion', reverse: true },
  { id: 'q13', text: 'I pay close attention to how decisions affect other people.', trait: 'agreeableness', reverse: false },
  { id: 'q14', text: 'I naturally try to create alignment when people see things differently.', trait: 'agreeableness', reverse: false },
  { id: 'q15', text: 'I value clarity, trust, and shared understanding in team projects.', trait: 'agreeableness', reverse: false },
  { id: 'q16', text: 'I am comfortable pushing ahead even if others are not fully aligned.', trait: 'agreeableness', reverse: true },
  { id: 'q17', text: 'I can stay steady when a project is ambiguous or changing.', trait: 'steadiness', reverse: false },
  { id: 'q18', text: 'I usually help steady the room when there are competing priorities.', trait: 'steadiness', reverse: false },
  { id: 'q19', text: 'I can separate a stressful moment from the bigger picture.', trait: 'steadiness', reverse: false },
  { id: 'q20', text: 'When plans change suddenly, it is hard for me to reset quickly.', trait: 'steadiness', reverse: true },
] as const;

export const playfulQuestions = [
  {
    id: 'vehicle',
    text: 'If your work style were a vehicle, what would it be?',
    options: ['Tesla Model Y', 'Toyota Tacoma', 'Porsche 911', 'Jeep Wrangler', 'Sprinter van', 'Vespa'],
  },
  {
    id: 'soundtrack',
    text: 'If your workday had a soundtrack, what would it be?',
    options: ['Deep focus playlist', 'Hype music', 'Calm piano', 'Early 2000s throwbacks', 'Lo-fi beats', 'Whatever blocks office noise'],
  },
  {
    id: 'usefulMoment',
    text: 'What kind of project moment makes you feel most useful?',
    options: ['Finding the direction', 'Getting the plan moving', 'Making the message clearer', 'Improving the process', 'Creating a fresh idea', 'Bringing people together'],
  },
  {
    id: 'superpower',
    text: 'If your work style had a superpower, what would it be?',
    options: ['Seeing the big picture', 'Turning chaos into a plan', 'Making things make sense', 'Finding the weak spot', 'Creating the unexpected', 'Getting everyone on the same page'],
  },
  {
    id: 'aiHelp',
    text: 'What should AI help you with most?',
    options: ['Comparing options', 'Organizing tasks', 'Rewriting or simplifying', 'Finding opportunities', 'Generating ideas', 'Summarizing conversations'],
  },
] as const;

export const profileCopy: Record<StyleName, string> = {
  Strategist: 'You see the system behind the request.',
  Builder: 'You turn ideas into usable steps.',
  Translator: 'You make the complicated usable.',
  Optimizer: 'You sharpen what already exists.',
  Spark: 'You bring energy and unexpected angles.',
  Connector: 'You build alignment across people and priorities.',
};

export const traitCopy: Record<TraitName, { title: string; summary: string }> = {
  openness: {
    title: 'Openness',
    summary: 'How much you like new ideas, fresh approaches, and experimentation.',
  },
  conscientiousness: {
    title: 'Conscientiousness',
    summary: 'How much you like structure, follow-through, and getting things done carefully.',
  },
  extraversion: {
    title: 'Extraversion',
    summary: 'How much you get energy from sharing ideas, momentum, and people.',
  },
  agreeableness: {
    title: 'Agreeableness',
    summary: 'How much you lean toward cooperation, empathy, and alignment.',
  },
  steadiness: {
    title: 'Steadiness',
    summary: 'How much you stay calm and reset well when things get messy or change fast.',
  },
};

export const workWithCopy: Record<StyleName, string> = {
  Strategist: 'Invite this person in early when the goal is still fuzzy.',
  Builder: 'Give the outcome, deadline, and enough room to build the path.',
  Translator: 'Ask this person to turn messy input into shared language.',
  Optimizer: 'Bring the current version and ask where it can get stronger.',
  Spark: 'Give the challenge and room to explore before narrowing.',
  Connector: 'Loop this person in when the work depends on buy-in and context.',
};

export type ScoredProfile = {
  traitRawScores: TraitScores;
  traitScores: TraitScores;
  styleScores: Record<StyleName, number>;
  primaryStyle: StyleName;
  secondaryStyle: StyleName | null;
};

export function scoreSubmission(rawAnswers: Record<string, string>): ScoredProfile {
  const baseTraits: TraitScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    steadiness: 0,
  };

  for (const question of traitQuestions) {
    const raw = Number(rawAnswers[question.id]);
    if (!Number.isFinite(raw) || raw < 1 || raw > 5) continue;
    const scored = question.reverse ? 6 - raw : raw;
    baseTraits[question.trait] += scored;
  }

  const traitScores: TraitScores = {
    openness: normalizeTrait(baseTraits.openness),
    conscientiousness: normalizeTrait(baseTraits.conscientiousness),
    extraversion: normalizeTrait(baseTraits.extraversion),
    agreeableness: normalizeTrait(baseTraits.agreeableness),
    steadiness: normalizeTrait(baseTraits.steadiness),
  };

  const styleScores: Record<StyleName, number> = {
    Strategist: traitScores.openness * 0.45 + traitScores.conscientiousness * 0.3 + traitScores.steadiness * 0.25,
    Builder: traitScores.conscientiousness * 0.55 + traitScores.steadiness * 0.3 + traitScores.agreeableness * 0.15,
    Translator: traitScores.agreeableness * 0.5 + traitScores.conscientiousness * 0.25 + traitScores.steadiness * 0.25,
    Optimizer: traitScores.conscientiousness * 0.55 + traitScores.openness * 0.25 + traitScores.steadiness * 0.2,
    Spark: traitScores.openness * 0.5 + traitScores.extraversion * 0.35 + traitScores.steadiness * 0.15,
    Connector: traitScores.agreeableness * 0.45 + traitScores.extraversion * 0.35 + traitScores.steadiness * 0.2,
  };

  const ranked = Object.entries(styleScores).sort((a, b) => b[1] - a[1]);
  const primaryStyle = ranked[0][0] as StyleName;
  const secondaryStyle = ranked[1][0] as StyleName;
  const scoreGap = ranked[0][1] - ranked[1][1];

  return {
    traitRawScores: baseTraits,
    traitScores,
    styleScores,
    primaryStyle,
    secondaryStyle: scoreGap <= 12 ? secondaryStyle : null,
  };
}

export function normalizeTrait(rawScore: number) {
  const min = 4;
  const max = 20;
  return Math.round(((rawScore - min) / (max - min)) * 100);
}

export function uuid() {
  return globalThis.crypto?.randomUUID?.() ?? `tff-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function buildSubmission(input: {
  name: string;
  role?: string;
  showNameInPresentation: boolean;
  predictedStyle: StyleName | 'Not sure';
  rawAnswers: Record<string, string>;
  createdAt?: string;
}) {
  const profile = scoreSubmission(input.rawAnswers);
  return {
    event: EVENT_NAME,
    id: uuid(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    name: input.name.trim(),
    role: input.role?.trim() || '',
    showNameInPresentation: input.showNameInPresentation,
    predictedStyle: input.predictedStyle,
    traitRawScores: profile.traitRawScores,
    traitScores: profile.traitScores,
    styleScores: profile.styleScores,
    primaryStyle: profile.primaryStyle,
    secondaryStyle: profile.secondaryStyle,
    rawAnswers: input.rawAnswers,
    playfulAnswers: {
      vehicle: input.rawAnswers.vehicle || '',
      soundtrack: input.rawAnswers.soundtrack || '',
      usefulMoment: input.rawAnswers.usefulMoment || '',
      superpower: input.rawAnswers.superpower || '',
      aiHelp: input.rawAnswers.aiHelp || '',
    },
  };
}

export type Submission = ReturnType<typeof buildSubmission>;

export function toExportPayload(submissions: Submission[]) {
  return {
    event: EVENT_NAME,
    generatedAt: new Date().toISOString(),
    submissions: submissions.map((submission) => ({
      name: submission.name,
      role: submission.role,
      showNameInPresentation: submission.showNameInPresentation,
      predictedStyle: submission.predictedStyle,
      primaryStyle: submission.primaryStyle,
      secondaryStyle: submission.secondaryStyle,
      traitScores: submission.traitScores,
      playfulAnswers: submission.playfulAnswers,
      rawAnswers: submission.rawAnswers,
      createdAt: submission.createdAt,
    })),
  };
}

export function toCsv(submissions: Submission[]) {
  const headers = [
    'createdAt',
    'name',
    'role',
    'showNameInPresentation',
    'predictedStyle',
    'primaryStyle',
    'secondaryStyle',
    'openness',
    'conscientiousness',
    'extraversion',
    'agreeableness',
    'steadiness',
    'vehicle',
    'soundtrack',
    'usefulMoment',
    'superpower',
    'aiHelp',
  ];

  const rows = submissions.map((submission) => [
    submission.createdAt,
    submission.name,
    submission.role,
    String(submission.showNameInPresentation),
    submission.predictedStyle,
    submission.primaryStyle,
    String(submission.secondaryStyle ?? ''),
    String(submission.traitScores.openness),
    String(submission.traitScores.conscientiousness),
    String(submission.traitScores.extraversion),
    String(submission.traitScores.agreeableness),
    String(submission.traitScores.steadiness),
    submission.playfulAnswers.vehicle,
    submission.playfulAnswers.soundtrack,
    submission.playfulAnswers.usefulMoment,
    submission.playfulAnswers.superpower,
    submission.playfulAnswers.aiHelp,
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

function csvCell(value: string) {
  const text = value ?? '';
  const escaped = text.replaceAll('"', '""');
  return `"${escaped}"`;
}
