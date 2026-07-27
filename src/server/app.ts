import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

try {
  dotenv.config();
} catch (_e) {
  // Ignore dotenv config errors in serverless environments
}

export const app = express();

app.use(express.json({ limit: '10mb' }));

// Normalize URL path for Vercel Serverless proxy rewrites
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith('/api') && req.url !== '/') {
    req.url = '/api' + req.url;
  }
  next();
});

// Helper to safely parse JSON response from Gemini
const parseGeminiJson = (rawText: string) => {
  const clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(clean);
};

// Lazy initialization of Gemini client to avoid crashes at module load time
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the server.');
  }
  return new GoogleGenAI({ apiKey });
};


// Helper for text generation
const callGemini = async (prompt: string, systemInstruction?: string, isJson: boolean = false) => {
  const ai = getGeminiAI();
  const config: any = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  if (isJson) {
    config.responseMimeType = 'application/json';
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config,
  });
  return response.text || '';
};

// Helper for multimodal media + text generation
const callGeminiWithMedia = async (
  prompt: string,
  media?: { base64: string; mimeType: string },
  systemInstruction?: string,
  isJson: boolean = false
) => {
  const ai = getGeminiAI();
  const config: any = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  if (isJson) {
    config.responseMimeType = 'application/json';
  }

  const contents: any[] = [];
  if (media && media.base64) {
    const cleanBase64 = media.base64.replace(/^data:.*?;base64,/, '');
    contents.push({
      inlineData: {
        data: cleanBase64,
        mimeType: media.mimeType || 'application/pdf',
      },
    });
  }
  contents.push(prompt);

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents,
    config,
  });
  return response.text || '';
};

// API Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. AI Study Assistant
app.all('/api/ai/study-assistant', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { mode, question, contextText, course } = params;

    if (req.method === 'GET' && !question && !contextText) {
      return res.json({ success: true, message: 'AI Study Assistant endpoint is active. Send POST request with study query.', endpoint: '/api/ai/study-assistant' });
    }

    const systemInstruction = `You are CampusFlow AI, an academic assistant for university students.
Your goal is to help students understand their study material, not simply give answers.
When explaining a topic:
1. Start with a simple definition.
2. Explain the concept step by step.
3. Use a practical example when possible.
4. Mention common mistakes.
5. End with a short summary.
Adapt explanations to the student's level.
If the student asks for MCQs, generate clear questions with four options and identify the correct answer with a brief explanation.
If the student provides study material, use that material as the primary source of context.
Do not invent facts when the provided material does not contain enough information. Clearly state when additional information is needed.
Always be educational, clear, concise, and beginner-friendly.`;

    let prompt = `Course Context: ${course || 'General Academic'}\n`;
    if (contextText) {
      prompt += `Study Material/Notes:\n"""\n${contextText}\n"""\n\n`;
    }

    if (mode === 'mcq') {
      prompt += `Task: Generate 4 Multiple Choice Questions (MCQs) based on the input material or topic: "${question || 'General Study'}".
Return JSON array format matching this schema:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this option is correct."
  }
]`;
      const rawJson = await callGemini(prompt, systemInstruction, true);
      res.json({ success: true, result: parseGeminiJson(rawJson) });
    } else if (mode === 'flashcard') {
      prompt += `Task: Generate 5 flashcards based on the input material or topic: "${question || 'General Study'}".
Return JSON array format matching this schema:
[
  {
    "question": "Front of card question/concept",
    "answer": "Back of card concise explanation"
  }
]`;
      const rawJson = await callGemini(prompt, systemInstruction, true);
      res.json({ success: true, result: parseGeminiJson(rawJson) });
    } else if (mode === 'summarize') {
      prompt += `Task: Create a concise, structured markdown summary of the material covering key terms, core takeaways, and formulas/methods if applicable. Topic/Question: "${question || 'General Study'}"`;
      const text = await callGemini(prompt, systemInstruction, false);
      res.json({ success: true, result: text });
    } else {
      // Explain or general Q&A
      prompt += `User Question / Topic: "${question || 'Explain core principles'}"`;
      const text = await callGemini(prompt, systemInstruction, false);
      res.json({ success: true, result: text });
    }
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to generate study content.';
    console.error('Study Assistant Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 2. AI Study Planner
app.all('/api/ai/study-plan', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { courses, assignments, availableHoursPerDay, customNotes } = params;

    if (req.method === 'GET' && !courses && !assignments) {
      return res.json({ success: true, message: 'AI Study Planner endpoint is active. Send POST request with course and assignment data.', endpoint: '/api/ai/study-plan' });
    }

    const prompt = `Student Context:
Courses: ${JSON.stringify(courses || [])}
Assignments & Deadlines: ${JSON.stringify(assignments || [])}
Available Study Time: ${availableHoursPerDay || 3} hours per day
Custom Notes/Exams: ${customNotes || 'None'}

Task: Generate a realistic 7-day personalized study schedule (Monday to Sunday) based on priorities and deadlines.
Return a structured JSON object matching this schema:
{
  "summary": "High-level strategy statement for the week",
  "schedule": [
    {
      "day": "Monday",
      "totalHours": 3,
      "sessions": [
        {
          "title": "Study task title",
          "courseName": "Course name",
          "durationHours": 1,
          "focus": "Specific goal or assignment focus"
        }
      ]
    }
  ]
}`;
    const rawJson = await callGemini(prompt, 'You are an expert university academic study coach.', true);
    res.json({ success: true, plan: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to generate study plan.';
    console.error('Study Planner Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 3. AI Performance Analysis
app.all('/api/ai/analyze-performance', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { assessments, courses, overallAverage } = params;

    if (req.method === 'GET' && !assessments && !courses) {
      return res.json({ success: true, message: 'AI Performance Analysis endpoint is active.', endpoint: '/api/ai/analyze-performance' });
    }

    const prompt = `Student Grades & Assessment History:
Overall Average: ${overallAverage || 80}%
Courses: ${JSON.stringify(courses || [])}
Assessments: ${JSON.stringify(assessments || [])}

Task: Provide a deep academic performance diagnosis and actionable roadmap.
Return JSON format matching:
{
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "subjectsNeedingAttention": ["Subject 1"],
  "recommendedActions": ["Action 1", "Action 2"],
  "summary": "Comprehensive overview paragraph"
}`;
    const rawJson = await callGemini(prompt, 'You are a supportive university academic performance advisor.', true);
    res.json({ success: true, analysis: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to analyze academic performance.';
    console.error('Analyze Performance Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 4. AI Group Project Planner
app.all('/api/ai/project-plan', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { projectName, description, courseName, durationWeeks, teamMemberCount, teamMembers } = params;

    if (req.method === 'GET' && !projectName) {
      return res.json({ success: true, message: 'AI Project Planner endpoint is active.', endpoint: '/api/ai/project-plan' });
    }

    const prompt = `Group Project Request:
Project Name: ${projectName || 'Group Project'}
Course: ${courseName || 'General'}
Description: ${description || 'Academic project'}
Timeline: ${durationWeeks || 3} weeks
Team Size: ${teamMemberCount || 4} members
Member Names: ${JSON.stringify(teamMembers || [])}

Task: Break down this group project into structured phases, milestones, and individual actionable tasks.
Return JSON matching:
{
  "overview": "Project execution strategy",
  "phases": [
    {
      "phaseName": "Phase 1: Research & Design",
      "duration": "Week 1",
      "milestone": "Completed requirements document"
    }
  ],
  "tasks": [
    {
      "name": "Task name",
      "description": "Task description and deliverables",
      "suggestedMember": "Member Name",
      "deadlineDaysFromNow": 5,
      "priority": "High"
    }
  ]
}`;
    const rawJson = await callGemini(prompt, 'You are a technical project manager for university group projects.', true);
    res.json({ success: true, plan: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to generate project breakdown.';
    console.error('Project Planner Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 5. Campus Help Center Guidance
app.all('/api/ai/campus-guidance', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { userProblem, university, degree } = params;

    if (req.method === 'GET' && !userProblem) {
      return res.json({ success: true, message: 'Campus Guidance endpoint is active.', endpoint: '/api/ai/campus-guidance' });
    }

    const systemInstruction = `You are CampusFlow AI, a university guidance assistant.
Analyze the student's problem and provide practical guidance.
Return JSON:
{
  "category": "Academic / Finance / Examination / Student Affairs / IT Support / Library / Administration / General",
  "recommendedDepartment": "Name of university department",
  "stepByStepActions": ["Step 1", "Step 2", "Step 3"],
  "requiredDocuments": ["Document 1", "Document 2"],
  "suggestedMessage": "Professional template email or formal written application text to submit to the department"
}
Do not claim that a university-specific policy is definitely true unless the student has provided that policy or information. When information is uncertain, clearly say that the student should verify details with the relevant university department.`;

    const prompt = `Student Info: University: ${university || 'University'}, Degree: ${degree || 'Undergraduate'}
Student Issue: "${userProblem || 'General inquiry'}"`;

    const rawJson = await callGemini(prompt, systemInstruction, true);
    res.json({ success: true, guidance: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to generate campus guidance.';
    console.error('Campus Guidance Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 6. AI Writing Assistant
app.all('/api/ai/writing-assistant', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { docType, prompt, recipient, studentName, university } = params;

    if (req.method === 'GET' && !prompt && !docType) {
      return res.json({ success: true, message: 'AI Writing Assistant endpoint is active.', endpoint: '/api/ai/writing-assistant' });
    }

    const systemInstruction = `You are a professional university correspondence writer. Produce highly articulate, polite, and formal academic documents, emails, leave requests, and applications.`;
    const fullPrompt = `Document Type: ${docType || 'Email'}
Student Name: ${studentName || 'Student'}
University: ${university || 'University'}
Recipient: ${recipient || 'Instructor / Department Head'}
Details & Context: ${prompt || 'Academic query'}

Task: Write the professional text.
Return JSON:
{
  "subject": "Subject line for email/application",
  "body": "Full body text of the document with proper placeholders if any"
}`;
    const rawJson = await callGemini(fullPrompt, systemInstruction, true);
    res.json({ success: true, result: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to generate document.';
    console.error('Writing Assistant Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 7. AI Coding Assistant
app.all('/api/ai/code-assistant', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { code, errorMessage, language } = params;

    if (req.method === 'GET' && !code) {
      return res.json({
        success: true,
        message: 'AI Coding Assistant API endpoint is ready. Send a POST request with { code, errorMessage, language } or GET with query params.',
        endpoint: '/api/ai/code-assistant'
      });
    }

    if (!code) {
      return res.status(400).json({ error: 'Missing required parameter: code snippet to analyze.' });
    }

    const systemInstruction = `You are an expert programming tutor for university CS/Engineering students. Explain code errors clearly without simply rewriting the whole project unless requested.`;
    const prompt = `Language: ${language || 'TypeScript'}
Error Message: ${errorMessage || 'Unknown Error'}
Code Snippet:
\`\`\`
${code}
\`\`\`

Task: Diagnose the error.
Return JSON:
{
  "errorMeaning": "What the error message actually means in simple terms",
  "whyItHappened": "Root cause of the bug",
  "causingLine": "Specific line or syntax block triggering the issue",
  "howToFix": "Step-by-step resolution instructions",
  "beginnerExplanation": "Easy analogy or concept explanation",
  "fixedCodeSnippet": "Corrected code snippet for the problematic block"
}`;
    const rawJson = await callGemini(prompt, systemInstruction, true);
    res.json({ success: true, analysis: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to analyze code error.';
    console.error('Code Assistant Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 8. AI Dashboard Recommendation
app.all('/api/ai/recommendation', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { tasks, courses } = params;

    const prompt = `Student's Pending Tasks: ${JSON.stringify(tasks || [])}
Active Courses: ${JSON.stringify(courses || [])}

Task: Generate a 1-2 sentence concise, highly personalized AI study tip or urgent priority recommendation for the student's dashboard header today.`;
    const text = await callGemini(prompt, 'You are an efficient student advisor giving a quick focus tip.', false);
    res.json({ success: true, recommendation: text.trim() });
  } catch (err: any) {
    res.json({ success: true, recommendation: 'You are all caught up! Keep reviewing your lecture notes for upcoming exams.' });
  }
});

// 9. Feature A: AI Auto-Scheduler
app.all('/api/ai/auto-scheduler', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { availability, courses, assignments, assessments, projects, currentDate } = params;

    if (req.method === 'GET' && !courses && !assignments) {
      return res.json({ success: true, message: 'AI Auto-Scheduler endpoint is active.', endpoint: '/api/ai/auto-scheduler' });
    }

    const prompt = `Student Availability Preferences:
Daily Max Study Hours: ${availability?.dailyHours || 3}
Preferred Study Window: ${availability?.preferredTimeOfDay || 'Evening'}
Break Duration: ${availability?.breakMinutes || 15} mins
Days Off: ${JSON.stringify(availability?.daysOff || [])}

Context Data:
Current Date: ${currentDate || new Date().toISOString().split('T')[0]}
Courses: ${JSON.stringify(courses || [])}
Pending Assignments: ${JSON.stringify(assignments || [])}
Upcoming Exams/Assessments: ${JSON.stringify(assessments || [])}
Active Projects: ${JSON.stringify(projects || [])}

Task: Automatically construct a realistic, optimized study schedule for the upcoming 7 days.
Rules:
- Assign sessions based on deadline urgency and course credit hours.
- Allocate time for exam preparation, assignment drafting, and project milestones.
- Ensure total hours per day does not exceed max daily study hours.
- Respect days off if possible.
- Provide clear, actionable titles and start/end times (e.g., "18:00", "19:30").

Return JSON array of session objects matching:
[
  {
    "title": "Calculus II - Chapter 4 Exam Prep",
    "courseName": "Calculus II",
    "date": "YYYY-MM-DD",
    "startTime": "18:00",
    "endTime": "19:30",
    "durationMinutes": 90,
    "sessionType": "Exam Prep",
    "priority": "High",
    "notes": "Focus on integration by parts and trigonometric substitution."
  }
]`;
    const rawJson = await callGemini(prompt, 'You are an intelligent academic scheduler for university students.', true);
    res.json({ success: true, sessions: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to generate automatic schedule.';
    console.error('Auto-Scheduler Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 10. Feature B: Academic Risk Radar
app.all('/api/ai/risk-analysis', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { courses, assignments, assessments, studySessions, projectTasks } = params;

    if (req.method === 'GET' && !courses && !assignments) {
      return res.json({ success: true, message: 'Academic Risk Analysis endpoint is active.', endpoint: '/api/ai/risk-analysis' });
    }

    const prompt = `Student Data for Risk Analysis:
Courses: ${JSON.stringify(courses || [])}
Assignments & Deadlines: ${JSON.stringify(assignments || [])}
Grades & Assessments: ${JSON.stringify(assessments || [])}
Study Logs: ${JSON.stringify(studySessions || [])}
Group Project Tasks: ${JSON.stringify(projectTasks || [])}

Task: Perform a deep proactive risk analysis across 5 risk dimensions:
1. Deadline Risk (overdue, impending tight deadlines)
2. Performance Risk (low grades, declining trends)
3. Workload Risk (unbalanced schedule, excessive study burden)
4. Exam Prep Risk (insufficient study time logged before exams)
5. Project Risk (delayed group tasks, bottleneck responsibilities)

Return JSON object with overall health score (0-100) and list of risk items matching:
{
  "academicHealthScore": 84,
  "risks": [
    {
      "id": "risk-1",
      "title": "Impending Physics Final Exam without log study sessions",
      "category": "Exam Prep Risk",
      "severity": "HIGH",
      "evidence": "Physics exam is in 3 days, but 0 study sessions logged for it.",
      "affectedArea": "Physics 101",
      "rootCause": "Student prioritized Programming assignment instead of Physics review.",
      "recommendation": "Schedule at least two 90-minute study blocks before Thursday.",
      "status": "Current"
    }
  ]
}`;
    const rawJson = await callGemini(prompt, 'You are CampusFlow AI Academic Risk Radar, detecting student academic vulnerabilities.', true);
    res.json({ success: true, analysis: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to analyze academic risks.';
    console.error('Risk Analysis Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 11. Feature D: AI Career Roadmap
app.all('/api/ai/career-roadmap', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { targetCareer, degree, currentSkills, weeklyHours, experienceLevel, userContext } = params;

    if (req.method === 'GET' && !targetCareer) {
      return res.json({ success: true, message: 'Career Roadmap endpoint is active.', endpoint: '/api/ai/career-roadmap' });
    }

    const prompt = `Student Career Target:
Target Career Role: ${targetCareer || 'Software Engineer'}
University Degree: ${degree || 'Undergraduate'}
Current Skills: ${JSON.stringify(currentSkills || [])}
Weekly Time Available for Career Study: ${weeklyHours || 5} hours/week
Experience Level: ${experienceLevel || 'Beginner'}
Projects & Academic Background: ${JSON.stringify(userContext || {})}

Task: Build a personalized, highly structured multi-stage career roadmap to help this student transition successfully into their target role upon graduation.

Return JSON object matching:
{
  "targetCareer": "${targetCareer || 'Software Engineer'}",
  "overallProgress": 15,
  "recommendedSkills": ["Skill A", "Skill B", "Skill C"],
  "stages": [
    {
      "stageName": "Phase 1: Foundations & Core Mastery",
      "description": "Master essential tools, algorithms, and concepts required for entry-level roles.",
      "skills": ["Skill 1", "Skill 2"],
      "projectIdeas": ["Build a full-stack portfolio app", "Create a data analysis notebook"],
      "prerequisites": ["Basic Programming"],
      "durationWeeks": 6,
      "completed": false
    }
  ]
}`;
    const rawJson = await callGemini(prompt, 'You are an elite career strategist for university students.', true);
    res.json({ success: true, roadmap: parseGeminiJson(rawJson) });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to generate career roadmap.';
    console.error('Career Roadmap Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 12. Feature E: Resume-to-Portfolio Data Extraction
app.all('/api/ai/resume-parse', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { resumeText, fileBase64, mimeType, existingProfile } = params;

    if (req.method === 'GET' && !resumeText && !fileBase64) {
      return res.json({ success: true, message: 'Resume Parse endpoint is active.', endpoint: '/api/ai/resume-parse' });
    }

    const cleanedText = (resumeText || '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ');

    const prompt = `Resume Content / Text Document:
"""
${cleanedText}
"""

Existing Student Context:
${JSON.stringify(existingProfile || {})}

CRITICAL MANDATE:
Extract verified profile information strictly from the provided text, document file, or existing context.
Extract as much real detail as possible:
- fullName: Full Name of student
- headline: Professional Headline (e.g., Computer Science Undergrad & Full Stack Developer)
- subtitle: Passionate subheader statement or short mission
- bio: Engaging 2-3 sentence summary paragraph describing technical focus and goals
- skills: List of technical skills, languages, frameworks, or tools (as string array)
- workExperience: List of work roles/internships/TA roles ({ title, company, duration, description })
- education: List of educational qualifications ({ degree, institution, year })
- projects: List of projects ({ title, description, tags, link })
- achievements: List of honors, awards, or certifications (as string array)

If a section is missing from the document, return reasonable empty arrays or preserve the student's name/education.

Return JSON object matching:
{
  "fullName": "Student Name",
  "headline": "Professional Headline",
  "subtitle": "Short subheader statement",
  "bio": "Concise summary paragraph",
  "skills": ["Skill 1", "Skill 2"],
  "workExperience": [
    {
      "title": "Role Title",
      "company": "Company / Lab Name",
      "duration": "Dates",
      "description": "Responsibilities and accomplishments"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University / School",
      "year": "Graduation Year"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Project overview and technologies used",
      "tags": ["React", "TypeScript"],
      "link": ""
    }
  ],
  "achievements": ["Achievement or Honor 1"]
}`;

    let rawJson = '';
    if (fileBase64) {
      rawJson = await callGeminiWithMedia(
        prompt,
        { base64: fileBase64, mimeType: mimeType || 'application/pdf' },
        'You are a meticulous resume data extractor for student portfolios. Output strict JSON only.',
        true
      );
    } else {
      rawJson = await callGemini(
        prompt,
        'You are a meticulous resume data extractor for student portfolios. Output strict JSON only.',
        true
      );
    }

    const extracted = parseGeminiJson(rawJson);
    res.json({ success: true, extracted });
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to parse resume data.';
    console.error('Resume Parse Error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// 13. Daily Briefing Generation
app.all('/api/ai/daily-briefing', async (req, res) => {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const { profile, assignments, risks, sessions } = params;
    const prompt = `Student Context:
Name: ${profile?.fullName || 'Student'}
University: ${profile?.university || 'University'}
Pending Deadlines: ${JSON.stringify(assignments || [])}
Active Academic Risks: ${JSON.stringify(risks || [])}
Today's Scheduled Sessions: ${JSON.stringify(sessions || [])}

Task: Generate an empowering, clear Daily AI Briefing for the student's dashboard header.
Return JSON object:
{
  "greeting": "Personalized greeting sentence",
  "priorityHeadline": "Main focus headline for today",
  "academicHealthStatus": "Short status phrase (e.g. Optimal / Needs Attention / High Workload)",
  "topActionToday": "Specific recommendation for today",
  "briefSummary": "1-2 sentence overview of priorities and risks today"
}`;
    const rawJson = await callGemini(prompt, 'You are CampusFlow AI Daily Academic Briefing assistant.', true);
    res.json({ success: true, briefing: parseGeminiJson(rawJson) });
  } catch (err: any) {
    res.json({
      success: true,
      briefing: {
        greeting: "Good day! Here is your daily academic briefing.",
        priorityHeadline: "Focus on upcoming deadlines and exam preparation",
        academicHealthStatus: "Stable",
        topActionToday: "Review your assignment schedule and log study hours.",
        briefSummary: "Keep up with your scheduled study sessions and track assignment priorities."
      }
    });
  }
});

// Catch-all 404 for /api routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global Express Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const errorMessage = err?.message || 'Internal Server Error';
  console.error('Express Global Error:', errorMessage);
  if (!res.headersSent) {
    res.status(err.status || err.statusCode || 500).json({
      error: errorMessage,
    });
  }
});

