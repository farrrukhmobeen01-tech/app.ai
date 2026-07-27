import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Building2,
  FileCheck,
  Send,
  Copy,
  Check,
  Compass,
  ArrowRight
} from 'lucide-react';
import { CampusHelpGuidance } from '../types';
import { fetchCampusGuidance } from '../lib/aiService';
import { useAuth } from '../context/AuthContext';

export const CampusHelpView: React.FC = () => {
  const { userProfile } = useAuth();
  const [userProblem, setUserProblem] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [guidance, setGuidance] = useState<CampusHelpGuidance | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const presets = [
    'I lost my university student ID card.',
    'I need to apply for a course withdrawal.',
    'How do I submit a medical leave of absence request?',
    'I need to request a semester fee installment plan.',
    'How do I appeal a missing or incorrect exam grade?'
  ];

  const handleConsult = async (problemText?: string) => {
    const textToSubmit = problemText || userProblem;
    if (!textToSubmit.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const result = await fetchCampusGuidance({
        userProblem: textToSubmit,
        university: userProfile?.university,
        degree: userProfile?.degree
      });
      setGuidance(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (guidance?.suggestedMessage) {
      navigator.clipboard.writeText(guidance.suggestedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white/5 backdrop-blur-xl text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-sky-300 text-xs font-semibold mb-3 border border-indigo-400/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Campus Administrative Resolver</span>
          </div>
          <h1 className="text-2xl font-black text-white">Campus Help Center</h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Describe any university procedure, administrative issue, or document request in natural language to receive step-by-step guidance and generated official emails.
          </p>
        </div>
      </div>

      {/* Input Form & Presets */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">What do you need assistance with?</h3>

        <div className="flex gap-2 flex-wrap">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUserProblem(p);
                handleConsult(p);
              }}
              className="text-[11px] font-medium bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all border border-white/10"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            placeholder="e.g. I lost my library card and need to issue a replacement"
            value={userProblem}
            onChange={(e) => setUserProblem(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => handleConsult()}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            {loading ? (
              <span>Analyzing Issue...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get Step-by-Step Guidance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Guidance Output Card */}
      {guidance && (
        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/20 border border-sky-400/30 px-2.5 py-1 rounded-full">
                Category: {guidance.category}
              </span>
              <h2 className="text-lg font-bold text-white mt-2">
                Recommended Department: {guidance.recommendedDepartment}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>University Administration</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step by Step Action Plan */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-sky-400" />
                <span>Step-by-Step Actions</span>
              </h4>
              <ol className="space-y-2">
                {guidance.stepByStepActions?.map((step, idx) => (
                  <li key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-200 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Required Documents */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Required Documents</span>
              </h4>
              <ul className="space-y-2">
                {guidance.requiredDocuments?.map((doc, idx) => (
                  <li key={idx} className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Application / Message */}
          {guidance.suggestedMessage && (
            <div className="bg-slate-950/80 backdrop-blur-2xl text-white p-6 rounded-2xl space-y-3 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-sky-400">Suggested Official Application / Email</span>
                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-slate-200 flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>
              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                {guidance.suggestedMessage}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
