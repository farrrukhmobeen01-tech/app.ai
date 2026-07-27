export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  university: string;
  degree: string;
  semester: string;
  avatarUrl?: string;
  bio?: string;
  studentId?: string;
  phone?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  instructorName: string;
  creditHours: number;
  color: string;
  description?: string;
  createdAt?: string;
}

export type AssignmentPriority = 'Low' | 'Medium' | 'High';
export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  priority: AssignmentPriority;
  estimatedHours: number;
  status: AssignmentStatus;
  attachedText?: string;
  attachedFileName?: string;
  attachedFileData?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AssessmentType = 'Quiz' | 'Assignment' | 'Midterm' | 'Final Exam' | 'Project' | 'Other';

export interface Assessment {
  id: string;
  name: string;
  courseId: string;
  type: AssessmentType;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  date: string;
  createdAt?: string;
}

export interface StudySession {
  id: string;
  day: string;
  title: string;
  durationHours: number;
  focus: string;
  completed: boolean;
  courseId?: string;
  date?: string;
}

export interface GroupProject {
  id: string;
  name: string;
  description: string;
  courseId: string;
  ownerId: string;
  memberIds: string[];
  memberEmails: string[];
  deadline: string;
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  assignedMember: string;
  deadline: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  createdAt?: string;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface AIPerformanceAnalysis {
  strengths: string[];
  weaknesses: string[];
  subjectsNeedingAttention: string[];
  recommendedActions: string[];
  summary: string;
}

export interface CampusHelpGuidance {
  category: string;
  recommendedDepartment: string;
  stepByStepActions: string[];
  requiredDocuments: string[];
  suggestedMessage: string;
}

export interface WritingResult {
  subject: string;
  body: string;
}

export interface CodeAnalysisResult {
  errorMeaning: string;
  whyItHappened: string;
  causingLine: string;
  howToFix: string;
  beginnerExplanation: string;
  fixedCodeSnippet: string;
}

// Phase 2: Advanced Intelligence Expansion Types

export interface AvailabilityPreferences {
  id?: string;
  dailyHours: number;
  preferredTimeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Flexible';
  breakMinutes: number;
  daysOff: string[]; // e.g. ['Sunday']
  maxContinuousHours: number;
}

export type ScheduleSessionType = 'Assignment Work' | 'Exam Prep' | 'Quiz Review' | 'Project Work' | 'General Reading' | 'Lab Work';
export type ScheduleSessionStatus = 'Scheduled' | 'Accepted' | 'Completed' | 'Skipped' | 'Rescheduled';

export interface ScheduleSession {
  id: string;
  title: string;
  courseId?: string;
  courseName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h or 12h display)
  endTime: string;
  durationMinutes: number;
  sessionType: ScheduleSessionType;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: ScheduleSessionStatus;
  notes?: string;
  createdAt?: string;
}

export type RiskCategory = 'Deadline Risk' | 'Performance Risk' | 'Workload Risk' | 'Exam Prep Risk' | 'Project Risk';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AcademicRisk {
  id: string;
  title: string;
  category: RiskCategory;
  severity: RiskSeverity;
  evidence: string;
  affectedArea: string;
  rootCause: string;
  recommendation: string;
  status: 'Current' | 'Resolved';
  createdAt: string;
}

export interface CareerStage {
  stageName: string;
  description: string;
  skills: string[];
  projectIdeas: string[];
  prerequisites: string[];
  durationWeeks: number;
  completed?: boolean;
}

export interface CareerRoadmap {
  id: string;
  targetCareer: string;
  degree: string;
  experienceLevel: string;
  weeklyHours: number;
  overallProgress: number; // 0 - 100
  stages: CareerStage[];
  recommendedSkills: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ResumeDocument {
  id: string;
  fileName: string;
  fileDataUrl?: string;
  extractedText?: string;
  uploadDate: string;
}

export interface PortfolioWorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface PortfolioEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface PortfolioProject {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export interface PortfolioProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  headline: string;
  subtitle: string;
  bio: string;
  skills: string[];
  workExperience: PortfolioWorkExperience[];
  education: PortfolioEducation[];
  projects: PortfolioProject[];
  achievements: string[];
  theme: 'modern-dark' | 'minimal-light' | 'creative-gradient';
  isPublished: boolean;
  publicSlug: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id?: string;
  emailNotificationsEnabled: boolean;
  quizAlerts: boolean;
  assignmentAlerts: boolean;
  examAlerts: boolean;
  projectAlerts: boolean;
  studySessionAlerts: boolean;
  careerAlerts: boolean;
  reminderLeadTimeHours: number;
  userEmail?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'exam' | 'risk' | 'study' | 'portfolio' | 'general';
  date: string;
  read: boolean;
  actionTab?: string;
  category?: string;
}

