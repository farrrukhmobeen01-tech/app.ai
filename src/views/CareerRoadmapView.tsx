import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Target,
  Clock,
  Layers,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  Award,
  Zap,
  Star,
  Terminal
} from 'lucide-react';
import { CareerRoadmap, CareerStage } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  subscribeCareerRoadmaps,
  saveCareerRoadmap,
  deleteCareerRoadmap
} from '../lib/firestoreService';
import { fetchCareerRoadmap } from '../lib/aiService';

export const CareerRoadmapView: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const userId = currentUser?.uid || 'demo-student-12345';

  const [targetCareer, setTargetCareer] = useState<string>('AI Engineer');
  const [weeklyHours, setWeeklyHours] = useState<number>(6);
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const presetCareers = [
    'AI / Machine Learning Engineer',
    'Full-Stack Software Engineer',
    'Data Scientist',
    'Cybersecurity Specialist',
    'Cloud Systems Architect',
    'Product Manager',
    'Mobile Developer (iOS/Android)',
    'UI/UX Product Designer'
  ];

  useEffect(() => {
    const unsub = subscribeCareerRoadmaps(userId, (data) => {
      setRoadmaps(data);
      if (data.length > 0 && !activeRoadmap) {
        setActiveRoadmap(data[0]);
      }
    });

    return () => unsub();
  }, [userId]);

  const handleGenerateRoadmap = async () => {
    if (!targetCareer.trim()) return;
    setGenerating(true);

    try {
      const res = await fetchCareerRoadmap({
        targetCareer,
        degree: userProfile?.degree || 'Undergraduate Degree',
        currentSkills: [],
        weeklyHours,
        experienceLevel,
        userContext: {
          university: userProfile?.university,
          semester: userProfile?.semester
        }
      });

      if (res && Array.isArray(res.stages)) {
        const newRoadmap: CareerRoadmap = {
          id: `roadmap-${Date.now()}`,
          targetCareer,
          degree: userProfile?.degree || 'Undergraduate',
          experienceLevel,
          weeklyHours,
          overallProgress: res.overallProgress || 0,
          recommendedSkills: res.recommendedSkills || [],
          stages: res.stages.map((st: any) => ({
            stageName: st.stageName || 'Phase 1: Core Fundamentals',
            description: st.description || 'Master key concepts and practical skills.',
            skills: st.skills || [],
            projectIdeas: st.projectIdeas || [],
            prerequisites: st.prerequisites || [],
            durationWeeks: st.durationWeeks || 4,
            completed: false
          })),
          createdAt: new Date().toISOString()
        };

        await saveCareerRoadmap(userId, newRoadmap);
        setActiveRoadmap(newRoadmap);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate career roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStage = async (stageIndex: number) => {
    if (!activeRoadmap) return;

    const updatedStages = [...activeRoadmap.stages];
    updatedStages[stageIndex].completed = !updatedStages[stageIndex].completed;

    const completedCount = updatedStages.filter(s => s.completed).length;
    const progress = Math.round((completedCount / updatedStages.length) * 100);

    const updatedRoadmap: CareerRoadmap = {
      ...activeRoadmap,
      stages: updatedStages,
      overallProgress: progress
    };

    setActiveRoadmap(updatedRoadmap);
    await saveCareerRoadmap(userId, updatedRoadmap);
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    await deleteCareerRoadmap(userId, roadmapId);
    if (activeRoadmap?.id === roadmapId) {
      setActiveRoadmap(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900/80 p-6 sm:p-8 rounded-3xl border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>AI Career Roadmap Strategist</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Degree-to-Job Career Transition Engine</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Builds a personalized, step-by-step career path matching your degree, available study hours, and target industry role upon graduation.
          </p>
        </div>
      </div>

      {/* Generator Input Section */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 text-slate-100">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Configure Your Career Objective</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Career Role *</label>
            <input
              type="text"
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              placeholder="e.g. AI Engineer, Data Analyst..."
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
            />
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[10px] text-slate-400">Presets:</span>
              {presetCareers.slice(0, 4).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTargetCareer(preset)}
                  className="text-[10px] bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 px-2 py-0.5 rounded-lg border border-white/10 transition-colors"
                >
                  {preset.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Prep Hours Available</label>
            <input
              type="number"
              min={1}
              max={40}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
            />
            <p className="text-[10px] text-slate-400 mt-1">Dedicated study hours/week outside coursework.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#12131c] border border-white/15 rounded-xl text-xs text-white"
            >
              <option value="Beginner">Beginner (Starting from scratch)</option>
              <option value="Intermediate">Intermediate (Has taken relevant courses)</option>
              <option value="Advanced">Advanced (Has built prior projects)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Calibrates prerequisite depth.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/30 inline-flex items-center gap-2 transition-all disabled:opacity-60"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Generating AI Roadmap...' : 'Generate Career Transition Roadmap'}</span>
          </button>
        </div>
      </div>

      {/* Saved Roadmaps Tabs */}
      {roadmaps.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {roadmaps.map((rm) => {
            const isActive = activeRoadmap?.id === rm.id;
            return (
              <div
                key={rm.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-600/20 border-emerald-400/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveRoadmap(rm)}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{rm.targetCareer}</span>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-mono">
                  {rm.overallProgress}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRoadmap(rm.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Roadmap View */}
      {activeRoadmap ? (
        <div className="space-y-6">
          {/* Overview Header */}
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Career Roadmap</span>
                <h2 className="text-2xl font-extrabold text-white">{activeRoadmap.targetCareer}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Degree: {activeRoadmap.degree} • Prep Speed: {activeRoadmap.weeklyHours} hours/week • Level: {activeRoadmap.experienceLevel}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400">Roadmap Progress</span>
                  <p className="text-2xl font-extrabold text-emerald-400">{activeRoadmap.overallProgress}%</p>
                </div>
              </div>
            </div>

            {/* Recommended Core Skills Pills */}
            {activeRoadmap.recommendedSkills?.length > 0 && (
              <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-300">Target Industry Skills:</span>
                {activeRoadmap.recommendedSkills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stages Progression Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Step-by-Step Transition Phases</span>
            </h3>

            <div className="space-y-4">
              {activeRoadmap.stages.map((stage, idx) => {
                const isDone = stage.completed;

                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl border transition-all space-y-4 ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/30 opacity-80'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isDone ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className={`text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                            {stage.stageName}
                          </h4>
                          <span className="text-xs text-slate-400">Estimated Duration: {stage.durationWeeks} weeks</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStage(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-white/10 hover:bg-emerald-600/30 text-slate-200 hover:text-emerald-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isDone ? 'Completed Phase' : 'Mark Phase Complete'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/5">
                      {stage.description}
                    </p>

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Required Skills */}
                      {stage.skills?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Key Skills to Master</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {stage.skills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-xs">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Portfolio Project Ideas */}
                      {stage.projectIdeas?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Suggested Portfolio Projects</p>
                          <ul className="space-y-1">
                            {stage.projectIdeas.map(p => (
                              <li key={p} className="text-slate-300 flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">No active career roadmap</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select your target industry role above and click <strong className="text-white">Generate Career Transition Roadmap</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
