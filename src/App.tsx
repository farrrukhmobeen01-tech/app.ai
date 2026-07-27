import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';

// Views
import { DashboardView } from './views/DashboardView';
import { CoursesView } from './views/CoursesView';
import { AssignmentsView } from './views/AssignmentsView';
import { StudyPlannerView } from './views/StudyPlannerView';
import { StudyAssistantView } from './views/StudyAssistantView';
import { PerformanceView } from './views/PerformanceView';
import { GroupProjectsView } from './views/GroupProjectsView';
import { CampusHelpView } from './views/CampusHelpView';
import { WritingAssistantView } from './views/WritingAssistantView';
import { CodingAssistantView } from './views/CodingAssistantView';
import { ProfileView } from './views/ProfileView';
import { AISchedulerView } from './views/AISchedulerView';
import { RiskRadarView } from './views/RiskRadarView';
import { CareerRoadmapView } from './views/CareerRoadmapView';
import { PortfolioBuilderView } from './views/PortfolioBuilderView';
import { NotificationsView } from './views/NotificationsView';

// Types & Services
import { Course, Assignment, Assessment, StudySession, GroupProject } from './types';
import {
  subscribeCourses,
  addCourse,
  deleteCourse,
  subscribeAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  subscribeAssessments,
  addAssessment,
  deleteAssessment,
  subscribeStudySessions,
  saveStudySessions,
  toggleStudySession,
  subscribeProjects
} from './lib/firestoreService';

function MainLayout() {
  const { currentUser, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  // Firestore state collections
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [projects, setProjects] = useState<GroupProject[]>([]);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    const uEmail = currentUser.email || '';

    const unsubCourses = subscribeCourses(uid, setCourses);
    const unsubAssignments = subscribeAssignments(uid, setAssignments);
    const unsubAssessments = subscribeAssessments(uid, setAssessments);
    const unsubSessions = subscribeStudySessions(uid, setStudySessions);
    const unsubProjects = subscribeProjects(uid, uEmail, setProjects);

    return () => {
      unsubCourses();
      unsubAssignments();
      unsubAssessments();
      unsubSessions();
      unsubProjects();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading CampusFlow AI...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal />;
  }

  // Handlers
  const handleAddCourse = async (course: Omit<Course, 'id'>) => {
    const tempId = 'course-' + Date.now();
    const newCourse: Course = { id: tempId, ...course };
    setCourses((prev) => [...prev, newCourse]);
    try {
      const realId = await addCourse(currentUser.uid, course);
      setCourses((prev) => prev.map((c) => (c.id === tempId ? { ...c, id: realId } : c)));
    } catch (err) {
      console.warn('Firestore write failed, kept in local state:', err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    try {
      await deleteCourse(currentUser.uid, courseId);
    } catch (err) {
      console.warn('Firestore delete failed:', err);
    }
  };

  const handleAddAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    const tempId = 'assignment-' + Date.now();
    const newAssignment: Assignment = { id: tempId, ...assignment };
    setAssignments((prev) => [...prev, newAssignment]);
    try {
      const realId = await addAssignment(currentUser.uid, assignment);
      setAssignments((prev) => prev.map((a) => (a.id === tempId ? { ...a, id: realId } : a)));
      return realId;
    } catch (err) {
      console.warn('Firestore write failed, kept in local state:', err);
      return tempId;
    }
  };

  const handleUpdateAssignment = async (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    try {
      await updateAssignment(currentUser.uid, id, updates);
    } catch (err) {
      console.warn('Firestore update failed:', err);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteAssignment(currentUser.uid, id);
    } catch (err) {
      console.warn('Firestore delete failed:', err);
    }
  };

  const handleToggleAssignmentStatus = async (item: Assignment) => {
    const nextStatus = item.status === 'Completed' ? 'In Progress' : 'Completed';
    setAssignments((prev) => prev.map((a) => (a.id === item.id ? { ...a, status: nextStatus } : a)));
    try {
      await updateAssignment(currentUser.uid, item.id, { status: nextStatus });
    } catch (err) {
      console.warn('Firestore status update failed:', err);
    }
  };

  const handleAddAssessment = async (assessment: Omit<Assessment, 'id'>) => {
    const tempId = 'assessment-' + Date.now();
    const newAssessment: Assessment = { id: tempId, ...assessment };
    setAssessments((prev) => [...prev, newAssessment]);
    try {
      const realId = await addAssessment(currentUser.uid, assessment);
      setAssessments((prev) => prev.map((a) => (a.id === tempId ? { ...a, id: realId } : a)));
      return realId;
    } catch (err) {
      console.warn('Firestore write failed, kept in local state:', err);
      return tempId;
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteAssessment(currentUser.uid, id);
    } catch (err) {
      console.warn('Firestore delete failed:', err);
    }
  };

  const handleSaveSessions = async (sessions: Omit<StudySession, 'id'>[]) => {
    try {
      await saveStudySessions(currentUser.uid, sessions);
    } catch (err) {
      console.warn('Firestore save sessions failed:', err);
    }
  };

  const handleToggleSession = async (sessionId: string, completed: boolean) => {
    setStudySessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, completed } : s)));
    try {
      await toggleStudySession(currentUser.uid, sessionId, completed);
    } catch (err) {
      console.warn('Firestore toggle session failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex font-sans antialiased relative overflow-hidden">
      {/* Mesh Gradient Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/15 blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-cyan-500/15 blur-[110px] pointer-events-none z-0" />

      <div className="relative z-10 flex w-full min-h-screen">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={mobileSidebarOpen}
          setIsOpen={setMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            activeTab={activeTab}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onQuickAddCourse={() => setActiveTab('courses')}
            onQuickAddAssignment={() => setActiveTab('assignments')}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenThemeModal={() => setThemeModalOpen(true)}
          />

          <ThemeSelectorModal
            isOpen={themeModalOpen}
            onClose={() => setThemeModalOpen(false)}
          />

          <main className="flex-1 overflow-y-auto pb-12">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  courses={courses}
                  assignments={assignments}
                  assessments={assessments}
                  onNavigate={setActiveTab}
                  onAddCourse={() => setActiveTab('courses')}
                  onAddAssignment={() => setActiveTab('assignments')}
                  onToggleAssignmentStatus={handleToggleAssignmentStatus}
                  studentName={userProfile?.fullName || 'Student'}
                />
              )}

              {activeTab === 'courses' && (
                <CoursesView
                  courses={courses}
                  assignments={assignments}
                  assessments={assessments}
                  onAddCourse={handleAddCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onAddAssignment={handleAddAssignment}
                />
              )}

              {activeTab === 'assignments' && (
                <AssignmentsView
                  assignments={assignments}
                  courses={courses}
                  onAddAssignment={handleAddAssignment}
                  onUpdateAssignment={handleUpdateAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                  onToggleStatus={handleToggleAssignmentStatus}
                />
              )}

              {activeTab === 'study-planner' && (
                <StudyPlannerView
                  courses={courses}
                  assignments={assignments}
                  studySessions={studySessions}
                  onSaveSessions={handleSaveSessions}
                  onToggleSession={handleToggleSession}
                />
              )}

              {activeTab === 'scheduler' && (
                <AISchedulerView
                  courses={courses}
                  assignments={assignments}
                  assessments={assessments}
                  projects={projects}
                />
              )}

              {activeTab === 'risks' && (
                <RiskRadarView
                  courses={courses}
                  assignments={assignments}
                  assessments={assessments}
                  studySessions={studySessions}
                  projects={projects}
                />
              )}

              {activeTab === 'study-assistant' && <StudyAssistantView courses={courses} />}

              {activeTab === 'performance' && (
                <PerformanceView
                  assessments={assessments}
                  courses={courses}
                  onAddAssessment={handleAddAssessment}
                  onDeleteAssessment={handleDeleteAssessment}
                />
              )}

              {activeTab === 'projects' && (
                <GroupProjectsView projects={projects} courses={courses} />
              )}

              {activeTab === 'career' && <CareerRoadmapView />}

              {activeTab === 'portfolio' && <PortfolioBuilderView />}

              {activeTab === 'campus-help' && <CampusHelpView />}

              {activeTab === 'ai-writing' && <WritingAssistantView />}

              {activeTab === 'coding-assistant' && <CodingAssistantView />}

              {activeTab === 'notifications' && <NotificationsView />}

              {activeTab === 'profile' && <ProfileView />}
            </motion.div>
          </main>
      </div>
    </div>
  </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
