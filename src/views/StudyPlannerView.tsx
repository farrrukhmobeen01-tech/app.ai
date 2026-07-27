import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  BookOpen,
  Plus,
  Save,
  Zap,
  Check
} from 'lucide-react';
import { Course, Assignment, StudySession } from '../types';
import { fetchStudyPlan } from '../lib/aiService';

interface StudyPlannerViewProps {
  courses: Course[];
  assignments: Assignment[];
  studySessions: StudySession[];
  onSaveSessions: (sessions: Omit<StudySession, 'id'>[]) => Promise<void>;
  onToggleSession: (sessionId: string, completed: boolean) => Promise<void>;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  courses,
  assignments,
  studySessions,
  onSaveSessions,
  onToggleSession
}) => {
  const [availableHours, setAvailableHours] = useState(3);
  const [customNotes, setCustomNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setSavedSuccess(false);
    try {
      const plan = await fetchStudyPlan({
        courses,
        assignments,
        availableHoursPerDay: availableHours,
        customNotes
      });
      setGeneratedPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAcceptAndSave = async () => {
    if (!generatedPlan || !generatedPlan.schedule) return;
    setSaving(true);
    try {
      const newSessions: Omit<StudySession, 'id'>[] = [];
      generatedPlan.schedule.forEach((daySchedule: any) => {
        if (daySchedule.sessions) {
          daySchedule.sessions.forEach((s: any) => {
            newSessions.push({
              day: daySchedule.day,
              title: s.title || s.courseName,
              durationHours: s.durationHours || 1,
              focus: s.focus || 'Review topic',
              completed: false,
              date: new Date().toISOString().split('T')[0]
            });
          });
        }
      });
      await onSaveSessions(newSessions);
      setSavedSuccess(true);
      setGeneratedPlan(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-purple-950/70 backdrop-blur-2xl text-white p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-sky-300 text-xs font-semibold mb-3 border border-indigo-400/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Scheduling Engine</span>
          </div>
          <h1 className="text-2xl font-black">AI Study Planner</h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Generate an optimal daily study roadmap based on your active course assignments, upcoming exams, and available study hours.
          </p>
        </div>
      </div>

      {/* Generator Input Controls */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
        <h3 className="font-bold text-white text-base">Planner Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Daily Available Study Hours</label>
              <span className="text-xs font-mono font-bold text-sky-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                {availableHours} hours / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              How much time you can dedicate to studying every day.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Upcoming Exams / Custom Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Physics midterm next Monday, DSA quiz on Friday"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center justify-center gap-2 transition-colors"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing deadlines & crafting study plan...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate Personalized Study Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Generated AI Proposal Preview */}
      {generatedPlan && (
        <div className="bg-slate-950/80 backdrop-blur-2xl text-white p-6 rounded-3xl space-y-6 shadow-2xl border border-indigo-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Generated Schedule</span>
              <h2 className="text-lg font-bold mt-0.5">{generatedPlan.summary || 'Weekly Study Roadmap'}</h2>
            </div>
            <button
              onClick={handleAcceptAndSave}
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg inline-flex items-center gap-2 transition-colors shrink-0"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Accept & Save to Calendar</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedPlan.schedule?.map((dayItem: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-bold text-indigo-300 text-sm">{dayItem.day}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{dayItem.totalHours} hrs</span>
                </div>
                <div className="space-y-2">
                  {dayItem.sessions?.map((s: any, sIdx: number) => (
                    <div key={sIdx} className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs">
                      <div className="flex items-center justify-between text-slate-100 font-semibold">
                        <span>{s.title || s.courseName}</span>
                        <span className="text-[10px] text-sky-400">{s.durationHours}h</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{s.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
          <Check className="w-4 h-4" />
          <span>Study plan accepted and saved to your personal study log!</span>
        </div>
      )}

      {/* Saved Active Study Sessions List */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Your Planned Study Sessions</h3>

        {studySessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No saved study sessions yet. Generate a schedule above to populate your study timetable.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studySessions.map((session) => (
              <div
                key={session.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  session.completed
                    ? 'bg-white/5 border-white/5 opacity-50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => onToggleSession(session.id, !session.completed)}
                  className={`mt-0.5 ${session.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-indigo-400'}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-sky-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30">
                      {session.day}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{session.durationHours} hrs</span>
                  </div>
                  <p className={`text-xs font-bold mt-1.5 ${session.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {session.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{session.focus}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
