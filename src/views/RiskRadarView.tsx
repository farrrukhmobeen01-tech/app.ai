import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Filter,
  RefreshCw,
  Search,
  Check,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  Course,
  Assignment,
  Assessment,
  StudySession,
  GroupProject,
  AcademicRisk,
  RiskSeverity,
  RiskCategory
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  subscribeAcademicRisks,
  bulkSaveAcademicRisks,
  updateAcademicRiskStatus
} from '../lib/firestoreService';
import { fetchRiskAnalysis } from '../lib/aiService';

interface RiskRadarViewProps {
  courses: Course[];
  assignments: Assignment[];
  assessments: Assessment[];
  studySessions: StudySession[];
  projects: GroupProject[];
}

export const RiskRadarView: React.FC<RiskRadarViewProps> = ({
  courses,
  assignments,
  assessments,
  studySessions,
  projects
}) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || 'demo-student-12345';

  const [risks, setRisks] = useState<AcademicRisk[]>([]);
  const [healthScore, setHealthScore] = useState<number>(85);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'Current' | 'Resolved' | 'all'>('Current');

  useEffect(() => {
    const unsub = subscribeAcademicRisks(userId, (data) => {
      setRisks(data);
      if (data.length > 0) {
        // Compute health score dynamically if risks exist
        const criticalCount = data.filter(r => r.status === 'Current' && r.severity === 'CRITICAL').length;
        const highCount = data.filter(r => r.status === 'Current' && r.severity === 'HIGH').length;
        const medCount = data.filter(r => r.status === 'Current' && r.severity === 'MEDIUM').length;
        const deduction = (criticalCount * 25) + (highCount * 15) + (medCount * 8);
        setHealthScore(Math.max(15, 100 - deduction));
      }
    });

    return () => unsub();
  }, [userId]);

  const handleRunRiskAudit = async () => {
    setAnalyzing(true);
    try {
      const res = await fetchRiskAnalysis({
        courses,
        assignments,
        assessments,
        studySessions,
        projectTasks: []
      });

      if (res) {
        if (typeof res.academicHealthScore === 'number') {
          setHealthScore(res.academicHealthScore);
        }
        if (Array.isArray(res.risks)) {
          const formatted: AcademicRisk[] = res.risks.map((r: any, idx: number) => ({
            id: r.id || `risk-${Date.now()}-${idx}`,
            title: r.title || 'Potential Academic Vulnerability',
            category: (r.category as RiskCategory) || 'Deadline Risk',
            severity: (r.severity as RiskSeverity) || 'MEDIUM',
            evidence: r.evidence || 'No clear evidence recorded.',
            affectedArea: r.affectedArea || 'General Studies',
            rootCause: r.rootCause || 'Course workload density',
            recommendation: r.recommendation || 'Review your study plan and prioritize upcoming deadlines.',
            status: 'Current',
            createdAt: new Date().toISOString()
          }));

          await bulkSaveAcademicRisks(userId, formatted);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to analyze risks. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleResolve = async (riskId: string, currentStatus: 'Current' | 'Resolved') => {
    const nextStatus = currentStatus === 'Current' ? 'Resolved' : 'Current';
    await updateAcademicRiskStatus(userId, riskId, nextStatus);
  };

  const filteredRisks = risks.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityBadgeClass = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 border-rose-500/40 text-rose-300 ring-2 ring-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
      case 'MEDIUM':
        return 'bg-sky-500/20 border-sky-400/30 text-sky-300';
      case 'LOW':
        return 'bg-slate-500/20 border-slate-400/30 text-slate-300';
    }
  };

  const activeRisksCount = risks.filter(r => r.status === 'Current').length;
  const criticalCount = risks.filter(r => r.status === 'Current' && r.severity === 'CRITICAL').length;
  const resolvedCount = risks.filter(r => r.status === 'Resolved').length;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-slate-900/80 p-6 sm:p-8 rounded-3xl border border-rose-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Academic Risk Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Proactive Vulnerability Predictor</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Scans coursework, grade trends, pending deadlines, and study session density to detect academic risks before they impact your GPA.
          </p>
        </div>

        <button
          onClick={handleRunRiskAudit}
          disabled={analyzing}
          className="px-5 py-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/30 border border-rose-400/30 inline-flex items-center gap-2 transition-all disabled:opacity-60 shrink-0 relative z-10"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Scanning Academic Signals...' : 'Run Real-Time AI Risk Audit'}</span>
        </button>
      </div>

      {/* Health Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Health Score Card */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Health Score</span>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{healthScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                healthScore >= 80 ? 'bg-emerald-400' : healthScore >= 60 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Active Vulnerabilities */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Active Risks</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-4xl font-extrabold text-white">{activeRisksCount}</p>
          <p className="text-xs text-slate-400">Vulnerabilities detected across 5 risk dimensions.</p>
        </div>

        {/* Critical Risks */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Severity</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-4xl font-extrabold text-rose-400">{criticalCount}</p>
          <p className="text-xs text-slate-400">Requires immediate study session allocation.</p>
        </div>

        {/* Resolved Risks */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mitigated & Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-extrabold text-emerald-400">{resolvedCount}</p>
          <p className="text-xs text-slate-400">Past risks successfully addressed.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <button
            onClick={() => setStatusFilter('Current')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'Current' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Active Risks ({risks.filter(r => r.status === 'Current').length})
          </button>

          <button
            onClick={() => setStatusFilter('Resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'Resolved' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({risks.filter(r => r.status === 'Resolved').length})
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All History
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#12131c] border border-white/15 rounded-xl text-xs text-white"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Risk Cards Collection */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">No risks matching criteria</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run the AI Risk Audit to perform a comprehensive scan of your course workload, grades, and upcoming assignment deadlines.
            </p>
            <button
              onClick={handleRunRiskAudit}
              disabled={analyzing}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Risk Audit</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRisks.map((risk) => {
              const isResolved = risk.status === 'Resolved';

              return (
                <div
                  key={risk.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 ${
                    isResolved
                      ? 'bg-emerald-950/10 border-emerald-500/20 opacity-75'
                      : risk.severity === 'CRITICAL'
                      ? 'bg-rose-950/20 border-rose-500/30 shadow-lg shadow-rose-950/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadgeClass(risk.severity)}`}>
                        {risk.severity} SEVERITY
                      </span>

                      <span className="px-2.5 py-0.5 bg-white/10 text-slate-200 rounded-full text-[11px] font-semibold">
                        {risk.category}
                      </span>

                      <span className="text-xs text-indigo-300 font-medium">
                        Area: <strong>{risk.affectedArea}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleResolve(risk.id, risk.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-white/10 hover:bg-emerald-600/30 text-slate-200 hover:text-emerald-300'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isResolved ? 'Mark Unresolved' : 'Mark as Resolved'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className={`text-base font-bold ${isResolved ? 'line-through text-slate-400' : 'text-white'}`}>
                      {risk.title}
                    </h3>
                  </div>

                  {/* Evidence & Root Cause Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-black/30 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Observed Evidence</p>
                      <p className="text-slate-200 leading-relaxed">{risk.evidence}</p>
                    </div>

                    <div className="p-3 bg-black/30 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Root Cause Analysis</p>
                      <p className="text-slate-200 leading-relaxed">{risk.rootCause}</p>
                    </div>
                  </div>

                  {/* Actionable AI Recommendation */}
                  <div className="p-4 bg-indigo-500/10 border border-indigo-400/20 rounded-2xl flex items-start gap-3">
                    <div className="p-2 bg-indigo-600/30 text-indigo-300 rounded-xl shrink-0 mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                        Actionable Mitigation Recommendation
                      </p>
                      <p className="text-xs text-slate-200 font-medium mt-0.5 leading-relaxed">
                        {risk.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
