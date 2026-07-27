import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Calendar,
  Zap,
  GraduationCap,
  ShieldAlert,
  Activity,
  CheckSquare,
  ChevronRight,
  Bell,
  User,
  MoreHorizontal,
  FileEdit
} from 'lucide-react';
import { Course, Assignment, Assessment } from '../types';
import { fetchDashboardRecommendation } from '../lib/aiService';

interface DashboardViewProps {
  courses: Course[];
  assignments: Assignment[];
  assessments: Assessment[];
  onNavigate: (tab: any) => void;
  onAddCourse: () => void;
  onAddAssignment: () => void;
  onToggleAssignmentStatus: (assignment: Assignment) => void;
  studentName: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  assignments,
  assessments,
  onNavigate,
  onAddCourse,
  onAddAssignment,
  onToggleAssignmentStatus,
  studentName
}) => {
  const [aiTip, setAiTip] = useState<string>('');
  const [loadingTip, setLoadingTip] = useState<boolean>(false);

  // Time of day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Statistics Calculation
  const activeCoursesCount = courses.length;
  const pendingAssignments = assignments.filter((a) => a.status !== 'Completed');
  const completedAssignmentsCount = assignments.filter((a) => a.status === 'Completed').length;
  const pendingTasksCount = pendingAssignments.length;

  const currentAcademicAverage = assessments.length > 0
    ? Math.round(assessments.reduce((acc, item) => acc + item.percentage, 0) / assessments.length)
    : null;

  // Calculate Academic Health Score dynamically
  const completionRate = assignments.length > 0
    ? Math.round((completedAssignmentsCount / assignments.length) * 100)
    : 100;
  
  const gradeScore = currentAcademicAverage !== null ? currentAcademicAverage : 85;
  const academicHealthScore = assignments.length === 0 && assessments.length === 0
    ? 100
    : Math.round((completionRate * 0.5) + (gradeScore * 0.5));

  // Risk calculation from real user data
  const now = new Date();
  const highRiskCount = pendingAssignments.filter((a) => {
    const due = new Date(a.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 1 || a.priority === 'High';
  }).length;

  const mediumRiskCount = pendingAssignments.filter((a) => {
    const due = new Date(a.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays > 1 && diffDays <= 4 && a.priority !== 'High';
  }).length;

  // Fetch AI tip when assignments or courses change
  useEffect(() => {
    let isMounted = true;
    if (assignments.length > 0 || courses.length > 0) {
      setLoadingTip(true);
      fetchDashboardRecommendation({ tasks: pendingAssignments, courses })
        .then((tip) => {
          if (isMounted) setAiTip(tip);
        })
        .finally(() => {
          if (isMounted) setLoadingTip(false);
        });
    } else {
      setAiTip("Add your courses and upcoming tasks to get personalized AI daily focus recommendations.");
    }
    return () => { isMounted = false; };
  }, [assignments, courses]);

  // Priority sort for Today's Focus
  const focusTasks = [...pendingAssignments].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (isNaN(dateA) || isNaN(dateB)) return 0;
    if (dateA !== dateB) return dateA - dateB;
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  }).slice(0, 3);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            {timeGreeting}, {studentName || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Here's your academic overview for today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => onNavigate('notifications')}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-amber-400 rounded-2xl border border-white/10 transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-[#0d0e15]" />
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-xs">
              {studentName ? studentName.charAt(0) : 'S'}
            </div>
            <span className="text-xs font-bold pr-1 hidden sm:inline">{studentName || 'Profile'}</span>
          </button>
        </div>
      </div>

      {/* 2. AI DAILY BRIEFING HERO CARD */}
      <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/70 to-slate-900/80 p-6 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30 uppercase tracking-wider">
            <span className="text-purple-400 text-sm">✦</span>
            <span>AI Daily Briefing</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
            Updated Just Now
          </span>
        </div>

        <div>
          {focusTasks.length > 0 ? (
            <>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                You have {focusTasks.length} pending {focusTasks.length === 1 ? 'priority' : 'priorities'} today.
              </h2>
              <div className="mt-3 space-y-2 text-xs text-slate-200">
                {focusTasks.map((task, idx) => {
                  const course = courses.find((c) => c.id === task.courseId);
                  return (
                    <div key={task.id} className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">
                        <strong className="text-white font-semibold">{task.title}</strong>{' '}
                        {course ? `(${course.courseCode || course.courseName})` : ''} -{' '}
                        <span className="text-amber-300">Due {task.dueDate}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-2 space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                All clear! No pending assignments right now.
              </h2>
              <p className="text-xs text-slate-300">
                Great job staying on top of your work. Add new assignments or review your courses to keep momentum.
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-start gap-3">
          {focusTasks.length > 0 ? (
            <button
              onClick={() => onNavigate('scheduler')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/30 border border-purple-400/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>View AI Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onAddAssignment}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 border border-indigo-400/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. STATISTICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Courses */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
              Enrolled
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{activeCoursesCount}</p>
            <p className="text-xs font-semibold text-slate-400">Active Courses</p>
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Pending
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{pendingTasksCount}</p>
            <p className="text-xs font-semibold text-slate-400 font-medium">Pending Tasks</p>
          </div>
        </div>

        {/* Avg Grade */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Assessments
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-white">
              {currentAcademicAverage !== null ? `${currentAcademicAverage}%` : 'N/A'}
            </p>
            <p className="text-xs font-semibold text-slate-400">Average Grade</p>
          </div>
        </div>

        {/* Academic Score */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              highRiskCount > 0
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {highRiskCount > 0 ? 'Attention' : 'Healthy'}
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-white">{academicHealthScore}/100</p>
            <p className="text-xs font-semibold text-slate-400">Academic Score</p>
          </div>
        </div>
      </div>

      {/* 4. TODAY'S PRIORITIES & UPCOMING DEADLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Priorities */}
        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Today's Priorities</h3>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {focusTasks.length > 0 ? (
              focusTasks.map((task) => {
                const course = courses.find((c) => c.id === task.courseId);
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-start gap-3 group"
                  >
                    <button
                      onClick={() => onToggleAssignmentStatus(task)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Mark as Complete"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-300">
                          {task.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          task.priority === 'High'
                            ? 'text-rose-300 bg-rose-500/20 border-rose-500/30'
                            : 'text-amber-300 bg-amber-500/20 border-amber-500/30'
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {course ? course.courseCode || course.courseName : 'General'}
                        </span>
                        <span>•</span>
                        <span className="text-amber-300">Due {task.dueDate}</span>
                      </div>

                      <div className="pt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                        <button
                          onClick={() => onToggleAssignmentStatus(task)}
                          className="hover:text-emerald-400 font-bold transition-colors cursor-pointer"
                        >
                          ✓ Complete
                        </button>
                        <button
                          onClick={() => onNavigate('assignments')}
                          className="hover:text-sky-400 font-bold transition-colors cursor-pointer"
                        >
                          ✏ View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-2xl bg-white/5 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
                <p className="text-xs font-bold text-white">No Pending Priority Tasks</p>
                <p className="text-[11px] text-slate-400">
                  You have completed all pending priorities!
                </p>
                <button
                  onClick={onAddAssignment}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Assignment</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines (Timeline Style) */}
        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-white text-sm">Upcoming Deadlines</h3>
            </div>
            <button
              onClick={onAddAssignment}
              className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {assignments.length > 0 ? (
            <div className="pl-2 space-y-4 relative border-l-2 border-indigo-500/30 ml-2">
              {assignments.slice(0, 5).map((item) => {
                const course = courses.find((c) => c.id === item.courseId);
                const isCompleted = item.status === 'Completed';
                return (
                  <div key={item.id} className="relative pl-4 space-y-1">
                    <div
                      className={`w-3 h-3 rounded-full absolute -left-[19px] top-1 ring-4 ring-[#0d0e15] ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : item.priority === 'High'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className={`font-bold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.dueDate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {course ? `${course.courseCode || course.courseName}` : 'General Academic'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-2xl bg-white/5 space-y-2">
              <Calendar className="w-8 h-8 text-sky-400 mx-auto opacity-80" />
              <p className="text-xs font-bold text-white">No Upcoming Deadlines</p>
              <p className="text-[11px] text-slate-400">
                Your schedule is clean. Add an assignment or test date to track deadlines.
              </p>
              <button
                onClick={onAddAssignment}
                className="mt-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. ACADEMIC HEALTH CARD & RISK RADAR CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Academic Health Card */}
        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              Academic Health
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {academicHealthScore >= 80 ? 'Healthy Status' : 'Needs Focus'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-white">{academicHealthScore} / 100</p>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                {academicHealthScore >= 80 ? 'Healthy & On Track' : 'Needs Progress'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-emerald-200 flex items-center justify-center font-bold text-xs text-white bg-emerald-950/30">
              {academicHealthScore}%
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-white/10 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Average Grade</span>
              <span className="font-bold text-white">
                {currentAcademicAverage !== null ? `${currentAcademicAverage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Task Completion Rate</span>
              <span className="font-bold text-white">{completionRate}%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Active Courses</span>
              <span className="font-bold text-white">{activeCoursesCount}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight italic pt-1 border-t border-white/5">
            CampusFlow productivity health metric.
          </p>
        </div>

        {/* Risk Radar Card */}
        <div className="bg-white/5 p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              Academic Risk Radar
            </h3>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>{highRiskCount} High Priority Risks</span>
              </span>
              <span className="text-[10px] text-rose-300">
                {highRiskCount > 0 ? 'Action Needed' : 'None'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{mediumRiskCount} Medium Risks</span>
              </span>
              <span className="text-[10px] text-amber-300">
                {mediumRiskCount > 0 ? 'Review' : 'None'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{activeCoursesCount} Active Courses</span>
              </span>
              <span className="text-[10px] text-emerald-300">Monitored</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('risks')}
            className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            View Full Risk Radar
          </button>
        </div>

        {/* AI Recommendation Card */}
        <div className="bg-gradient-to-tr from-purple-950/70 to-indigo-950/70 p-5 rounded-3xl border border-purple-500/30 shadow-xl space-y-3.5 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                AI Focus Insight
              </h3>
            </div>
            <span className="text-[9px] font-bold text-purple-300 bg-purple-500/30 px-2 py-0.5 rounded uppercase">
              Smart Tip
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-200 leading-relaxed font-medium">
              {loadingTip ? (
                <span className="animate-pulse text-slate-400">Generating personal study recommendation...</span>
              ) : (
                aiTip
              )}
            </p>
          </div>

          <button
            onClick={() => onNavigate('scheduler')}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 border border-purple-400/30 transition-all cursor-pointer"
          >
            Open AI Scheduler
          </button>
        </div>
      </div>
    </div>
  );
};

