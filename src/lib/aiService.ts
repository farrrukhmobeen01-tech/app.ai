import {
  MCQQuestion,
  Flashcard,
  AIPerformanceAnalysis,
  CampusHelpGuidance,
  WritingResult,
  CodeAnalysisResult,
  Course,
  Assignment,
  Assessment
} from '../types';

export async function fetchStudyAssistantResponse(params: {
  mode: 'explain' | 'mcq' | 'flashcard' | 'summarize';
  question: string;
  contextText?: string;
  course?: string;
}) {
  const res = await fetch('/api/ai/study-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Study assistant failed to process request');
  }
  return data.result;
}

export async function fetchStudyPlan(params: {
  courses: Course[];
  assignments: Assignment[];
  availableHoursPerDay: number;
  customNotes?: string;
}) {
  const res = await fetch('/api/ai/study-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate study plan');
  }
  return data.plan;
}

export async function fetchPerformanceAnalysis(params: {
  assessments: Assessment[];
  courses: Course[];
  overallAverage: number;
}): Promise<AIPerformanceAnalysis> {
  const res = await fetch('/api/ai/analyze-performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to analyze academic performance');
  }
  return data.analysis;
}

export async function fetchProjectPlan(params: {
  projectName: string;
  description: string;
  courseName: string;
  durationWeeks?: number;
  teamMemberCount?: number;
  teamMembers?: string[];
}) {
  const res = await fetch('/api/ai/project-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate project breakdown');
  }
  return data.plan;
}

export async function fetchCampusGuidance(params: {
  userProblem: string;
  university?: string;
  degree?: string;
}): Promise<CampusHelpGuidance> {
  const res = await fetch('/api/ai/campus-guidance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate campus guidance');
  }
  return data.guidance;
}

export async function fetchWritingAssistant(params: {
  docType: string;
  prompt: string;
  recipient?: string;
  studentName?: string;
  university?: string;
}): Promise<WritingResult> {
  const res = await fetch('/api/ai/writing-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate writing document');
  }
  return data.result;
}

export async function fetchCodeAssistant(params: {
  code: string;
  errorMessage?: string;
  language?: string;
}): Promise<CodeAnalysisResult> {
  const res = await fetch('/api/ai/code-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to analyze code error');
  }
  return data.analysis;
}

export async function fetchDashboardRecommendation(params: {
  tasks: Assignment[];
  courses: Course[];
}): Promise<string> {
  try {
    const res = await fetch('/api/ai/recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (res.ok && data.recommendation) {
      return data.recommendation;
    }
  } catch (err) {
    console.error('Recommendation fetch error:', err);
  }
  return 'Review your upcoming assignment deadlines and plan your study time for maximum retention.';
}

export async function fetchAutoScheduler(params: {
  availability: any;
  courses: Course[];
  assignments: Assignment[];
  assessments: Assessment[];
  projects: any[];
  currentDate?: string;
}) {
  const res = await fetch('/api/ai/auto-scheduler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate automatic schedule');
  }
  return data.sessions;
}

export async function fetchRiskAnalysis(params: {
  courses: Course[];
  assignments: Assignment[];
  assessments: Assessment[];
  studySessions: any[];
  projectTasks: any[];
}) {
  const res = await fetch('/api/ai/risk-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to run academic risk analysis');
  }
  return data.analysis;
}

export async function fetchCareerRoadmap(params: {
  targetCareer: string;
  degree?: string;
  currentSkills?: string[];
  weeklyHours?: number;
  experienceLevel?: string;
  userContext?: any;
}) {
  const res = await fetch('/api/ai/career-roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate career roadmap');
  }
  return data.roadmap;
}

export async function fetchResumeParse(params: {
  resumeText: string;
  fileBase64?: string | null;
  mimeType?: string | null;
  existingProfile?: any;
}) {
  const res = await fetch('/api/ai/resume-parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to parse resume');
  }
  return data.extracted;
}

export async function fetchDailyBriefing(params: {
  profile: any;
  assignments: Assignment[];
  risks: any[];
  sessions: any[];
}) {
  const res = await fetch('/api/ai/daily-briefing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch daily briefing');
  }
  return data.briefing;
}

