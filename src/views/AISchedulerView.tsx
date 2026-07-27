import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Sliders,
  Check,
  AlertTriangle,
  BookOpen,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  Course,
  Assignment,
  Assessment,
  GroupProject,
  AvailabilityPreferences,
  ScheduleSession,
  ScheduleSessionStatus
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getAvailability,
  saveAvailability,
  subscribeScheduleSessions,
  addScheduleSession,
  updateScheduleSession,
  deleteScheduleSession,
  bulkSaveScheduleSessions
} from '../lib/firestoreService';
import { fetchAutoScheduler } from '../lib/aiService';

interface AISchedulerViewProps {
  courses: Course[];
  assignments: Assignment[];
  assessments: Assessment[];
  projects: GroupProject[];
}

export const AISchedulerView: React.FC<AISchedulerViewProps> = ({
  courses,
  assignments,
  assessments,
  projects
}) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || 'demo-student-12345';

  const [availability, setAvailabilityState] = useState<AvailabilityPreferences>({
    dailyHours: 4,
    preferredTimeOfDay: 'Evening',
    breakMinutes: 15,
    daysOff: ['Sunday'],
    maxContinuousHours: 2
  });

  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Manual Session Form
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [sessionType, setSessionType] = useState<any>('Assignment Work');
  const [priority, setPriority] = useState<any>('Medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Load availability
    getAvailability(userId).then((data) => {
      if (data) setAvailabilityState(data);
    });

    // Subscribe schedule sessions
    const unsub = subscribeScheduleSessions(userId, (data) => {
      setSessions(data);
    });

    return () => unsub();
  }, [userId]);

  const handleSaveAvailability = async () => {
    try {
      setLoading(true);
      await saveAvailability(userId, availability);
      setShowConfig(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setGenerating(true);
    try {
      const generated = await fetchAutoScheduler({
        availability,
        courses,
        assignments,
        assessments,
        projects,
        currentDate: new Date().toISOString().split('T')[0]
      });

      if (Array.isArray(generated) && generated.length > 0) {
        const formatted = generated.map((s: any) => ({
          title: s.title || 'Study Session',
          courseName: s.courseName || 'General',
          date: s.date || new Date().toISOString().split('T')[0],
          startTime: s.startTime || '18:00',
          endTime: s.endTime || '19:30',
          durationMinutes: s.durationMinutes || 90,
          sessionType: s.sessionType || 'Assignment Work',
          priority: s.priority || 'Medium',
          status: 'Scheduled' as ScheduleSessionStatus,
          notes: s.notes || ''
        }));

        await bulkSaveScheduleSessions(userId, formatted);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate AI schedule. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddManualSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addScheduleSession(userId, {
        title,
        courseName,
        date,
        startTime,
        endTime,
        durationMinutes: 90,
        sessionType,
        priority,
        status: 'Scheduled',
        notes
      });
      setShowManualModal(false);
      setTitle('');
      setNotes('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (sessionId: string, newStatus: ScheduleSessionStatus) => {
    await updateScheduleSession(userId, sessionId, { status: newStatus });
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteScheduleSession(userId, sessionId);
  };

  // Group sessions by Date
  const groupedSessions = sessions.reduce((acc, session) => {
    const d = session.date || 'Today';
    if (!acc[d]) acc[d] = [];
    acc[d].push(session);
    return acc;
  }, {} as Record<string, ScheduleSession[]>);

  const sortedDates = Object.keys(groupedSessions).sort();

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Scheduler</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Smart Study Time Optimizer</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Automatically calculates realistic study sessions based on assignment deadlines, upcoming exams, course credits, and your availability.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md"
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Preferences</span>
          </button>

          <button
            onClick={handleGenerateSchedule}
            disabled={generating}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 border border-indigo-400/30 inline-flex items-center gap-2 transition-all disabled:opacity-60"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Generating Schedule...' : 'Auto-Generate AI Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Preferences Drawer / Modal */}
      {showConfig && (
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 text-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Availability & Study Preferences</span>
            </h3>
            <button
              onClick={() => setShowConfig(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Daily Study Hours</label>
              <input
                type="number"
                min={1}
                max={12}
                value={availability.dailyHours}
                onChange={(e) => setAvailabilityState({ ...availability, dailyHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Time Window</label>
              <select
                value={availability.preferredTimeOfDay}
                onChange={(e) => setAvailabilityState({ ...availability, preferredTimeOfDay: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#12131c] border border-white/15 rounded-xl text-xs text-white"
              >
                <option value="Morning">Morning (8 AM - 12 PM)</option>
                <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="Evening">Evening (5 PM - 10 PM)</option>
                <option value="Flexible">Flexible / Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Break Duration (Mins)</label>
              <input
                type="number"
                step={5}
                value={availability.breakMinutes}
                onChange={(e) => setAvailabilityState({ ...availability, breakMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Days Off</label>
              <select
                multiple
                value={availability.daysOff}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                  setAvailabilityState({ ...availability, daysOff: opts });
                }}
                className="w-full px-3 py-1.5 bg-[#12131c] border border-white/15 rounded-xl text-xs text-white h-20"
              >
                <option value="Sunday">Sunday</option>
                <option value="Saturday">Saturday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveAvailability}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Main Schedule Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Your Optimized Study Schedule</h2>
            <p className="text-xs text-slate-400">Review, accept, edit, or mark study sessions complete.</p>
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Custom Session</span>
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center mx-auto shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No AI schedule sessions yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong className="text-white">Auto-Generate AI Schedule</strong> to scan your coursework and build an intelligent study plan.
            </p>
            <button
              onClick={handleGenerateSchedule}
              disabled={generating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Schedule Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateStr) => {
              const daySessions = groupedSessions[dateStr];
              return (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-xs font-mono font-bold">
                      {dateStr}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySessions.map((session) => {
                      const isCompleted = session.status === 'Completed';
                      const isSkipped = session.status === 'Skipped';

                      return (
                        <div
                          key={session.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isCompleted
                              ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                              : isSkipped
                              ? 'bg-slate-900/40 border-white/10 opacity-60'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-400/30">
                                {session.sessionType}
                              </span>
                              <h4 className={`text-sm font-bold mt-1.5 ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                                {session.title}
                              </h4>
                              {session.courseName && (
                                <p className="text-xs text-slate-400">{session.courseName}</p>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Delete Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              {session.startTime} - {session.endTime}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span>{session.durationMinutes} mins</span>
                          </div>

                          {session.notes && (
                            <p className="text-xs text-slate-300 bg-black/30 p-2 rounded-xl border border-white/5">
                              {session.notes}
                            </p>
                          )}

                          {/* Session Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
                            <button
                              onClick={() => handleStatusChange(session.id, isCompleted ? 'Scheduled' : 'Completed')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                  : 'bg-white/10 hover:bg-emerald-600/30 text-slate-200 hover:text-emerald-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                            </button>

                            <button
                              onClick={() => handleStatusChange(session.id, 'Skipped')}
                              className="px-2.5 py-1 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-medium transition-colors"
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Session Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-md w-full p-6 border border-white/15 space-y-4 text-slate-100">
            <h3 className="font-bold text-white text-base">Add Custom Study Session</h3>
            <form onSubmit={handleAddManualSession} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 5 Practice Problems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12131c] border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#12131c] border border-white/15 rounded-xl text-xs text-white"
                  >
                    <option value="Assignment Work">Assignment Work</option>
                    <option value="Exam Prep">Exam Prep</option>
                    <option value="Quiz Review">Quiz Review</option>
                    <option value="Project Work">Project Work</option>
                    <option value="General Reading">General Reading</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Optional study focus notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-white/10 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
