import React, { useState } from 'react';
import {
  BarChart3,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle,
  X,
  GraduationCap
} from 'lucide-react';
import { Assessment, Course, AssessmentType, AIPerformanceAnalysis } from '../types';
import { fetchPerformanceAnalysis } from '../lib/aiService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PerformanceViewProps {
  assessments: Assessment[];
  courses: Course[];
  onAddAssessment: (assessment: Omit<Assessment, 'id'>) => Promise<string>;
  onDeleteAssessment: (id: string) => Promise<void>;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  assessments,
  courses,
  onAddAssessment,
  onDeleteAssessment
}) => {
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState(courses.length > 0 ? courses[0].id : '');
  const [type, setType] = useState<AssessmentType>('Quiz');
  const [obtainedMarks, setObtainedMarks] = useState(18);
  const [totalMarks, setTotalMarks] = useState(20);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIPerformanceAnalysis | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || totalMarks <= 0) return;
    setSubmitting(true);
    try {
      const percentage = Math.round((Number(obtainedMarks) / Number(totalMarks)) * 100);
      await onAddAssessment({
        name,
        courseId,
        type,
        obtainedMarks: Number(obtainedMarks),
        totalMarks: Number(totalMarks),
        percentage,
        date
      });
      setShowModal(false);
      setName('');
      setObtainedMarks(18);
      setTotalMarks(20);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const overallAvg = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.percentage, 0) / assessments.length)
    : 0;

  // Course averages map
  const courseAverages = courses.map((course) => {
    const list = assessments.filter((a) => a.courseId === course.id);
    const avg = list.length > 0
      ? Math.round(list.reduce((sum, item) => sum + item.percentage, 0) / list.length)
      : null;
    return { course, avg, count: list.length };
  });

  const validAverages = courseAverages.filter((c) => c.avg !== null) as {
    course: Course;
    avg: number;
    count: number;
  }[];

  const bestCourse = validAverages.length > 0
    ? [...validAverages].sort((a, b) => b.avg - a.avg)[0].course.courseCode
    : 'N/A';

  const weakestCourse = validAverages.length > 0
    ? [...validAverages].sort((a, b) => a.avg - b.avg)[0].course.courseCode
    : 'N/A';

  const handleAnalyzeAI = async () => {
    setAnalyzing(true);
    try {
      const res = await fetchPerformanceAnalysis({
        assessments,
        courses,
        overallAverage: overallAvg
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const assessmentTypes: AssessmentType[] = [
    'Quiz',
    'Assignment',
    'Midterm',
    'Final Exam',
    'Project',
    'Other'
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold text-white">Academic Performance Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Record quiz, exam, and project marks to compute grade percentages and course averages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeAI}
            disabled={analyzing || assessments.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? 'Analyzing...' : 'Analyze My Performance'}</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assessment</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl">
          <p className="text-xs text-slate-400 font-semibold">Overall Grade Average</p>
          <p className="text-2xl font-black text-white mt-1">{overallAvg}%</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl">
          <p className="text-xs text-slate-400 font-semibold">Best Performing Course</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{bestCourse}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl">
          <p className="text-xs text-slate-400 font-semibold">Subjects Needing Attention</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{weakestCourse}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl">
          <p className="text-xs text-slate-400 font-semibold">Recorded Assessments</p>
          <p className="text-2xl font-black text-indigo-400 mt-1">{assessments.length}</p>
        </div>
      </div>

      {/* AI Diagnosis Output */}
      {analysisResult && (
        <div className="bg-slate-950/80 backdrop-blur-2xl text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 border border-indigo-500/30">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4" />
            <span>AI Academic Performance Analysis</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{analysisResult.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Strengths</h4>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                {analysisResult.strengths?.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Weaknesses & Focus</h4>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                {analysisResult.weaknesses?.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Table */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Recorded Test & Quiz Results</h3>

        {assessments.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/20 rounded-2xl bg-white/5 space-y-2">
            <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-200">No assessment marks recorded yet</p>
            <p className="text-[11px] text-slate-400">
              Click "Add Assessment" to log your quiz scores, midterms, and project grades.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold uppercase tracking-wider border-b border-white/10 text-[10px]">
                  <th className="pb-3 pl-2">Assessment Name</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {assessments.map((item) => {
                  const course = courses.find((c) => c.id === item.courseId);
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-white">{item.name}</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-semibold border border-white/10">
                          {course ? course.courseCode : 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-300">{item.type}</td>
                      <td className="py-3.5 font-mono font-medium text-slate-200">
                        {item.obtainedMarks} / {item.totalMarks}
                      </td>
                      <td className="py-3.5 font-bold text-sky-400">{item.percentage}%</td>
                      <td className="py-3.5 text-slate-400 font-mono">{item.date}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onDeleteAssessment(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Add Assessment Marks</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Midterm Exam 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900">
                        {c.courseCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssessmentType)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {assessmentTypes.map((t) => (
                      <option key={t} value={t} className="bg-slate-900">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Obtained Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    value={obtainedMarks}
                    onChange={(e) => setObtainedMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-white/15 text-slate-300 text-xs font-semibold rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  {submitting ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
