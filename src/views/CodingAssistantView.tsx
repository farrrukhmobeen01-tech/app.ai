import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Bug
} from 'lucide-react';
import { CodeAnalysisResult } from '../types';
import { fetchCodeAssistant } from '../lib/aiService';

export const CodingAssistantView: React.FC = () => {
  const [code, setCode] = useState<string>(`function calculateAverage(numbers) {\n  let total = 0;\n  for (let i = 0; i <= numbers.length; i++) {\n    total += numbers[i];\n  }\n  return total / numbers.length;\n}`);
  const [errorMessage, setErrorMessage] = useState<string>('TypeError: Cannot read property of undefined (reading numbers[i])');
  const [language, setLanguage] = useState<string>('JavaScript');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const languages = ['TypeScript', 'JavaScript', 'Python', 'C++', 'Java', 'C#', 'SQL', 'Rust', 'Go'];

  const handleDiagnose = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setCopiedCode(false);
    try {
      const res = await fetchCodeAssistant({ code, errorMessage, language });
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFixedCode = () => {
    if (analysis?.fixedCodeSnippet) {
      navigator.clipboard.writeText(analysis.fixedCodeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-sky-300 text-xs font-semibold mb-3 border border-indigo-400/20">
            <Code2 className="w-3.5 h-3.5" />
            <span>CS Bug Tutor Engine</span>
          </div>
          <h1 className="text-2xl font-black">AI Coding Assistant</h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Paste your code snippet and compiler/runtime error message to get an explanation of the root cause, exact bug line, and beginner-friendly fix.
          </p>
        </div>
      </div>

      {/* Input Code Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Programming Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Error Message / Terminal Stack Trace
            </label>
            <input
              type="text"
              placeholder="e.g. IndexOutOfBoundsException: Index 5 out of bounds for length 5"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Code Snippet</label>
          <textarea
            rows={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
          />
        </div>

        <button
          onClick={handleDiagnose}
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <span>Diagnosing Code Bug...</span>
          ) : (
            <>
              <Bug className="w-4 h-4" />
              <span>Diagnose Error & Explain Fix</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Diagnosis Output */}
      {analysis && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-base border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5" />
            <span>AI Code Diagnosis Breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200/80 space-y-1">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">What the Error Means</h4>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">{analysis.errorMeaning}</p>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-1">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Why It Happened (Root Cause)</h4>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">{analysis.whyItHappened}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Problematic Line / Block</h4>
            <pre className="p-3 bg-slate-900 text-rose-300 font-mono text-xs rounded-lg overflow-x-auto">
              {analysis.causingLine}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Beginner Explanation</h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              {analysis.beginnerExplanation}
            </p>
          </div>

          {/* Fixed Code Snippet */}
          {analysis.fixedCodeSnippet && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400">Corrected Code Snippet</span>
                <button
                  onClick={handleCopyFixedCode}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {analysis.fixedCodeSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
