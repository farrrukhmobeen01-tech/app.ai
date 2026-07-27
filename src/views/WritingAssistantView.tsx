import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Send,
  RotateCw,
  Mail,
  UserCheck
} from 'lucide-react';
import { WritingResult } from '../types';
import { fetchWritingAssistant } from '../lib/aiService';
import { useAuth } from '../context/AuthContext';

export const WritingAssistantView: React.FC = () => {
  const { userProfile } = useAuth();
  const [docType, setDocType] = useState<string>('Leave Application');
  const [customDocType, setCustomDocType] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WritingResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const docTypes = [
    'Leave Application',
    'Instructor Email',
    'Assignment Extension Request',
    'Late Submission Explanation',
    'Scholarship Application',
    'Internship Email',
    'Project Proposal',
    'Recommendation Request',
    'Course Withdrawal Request',
    'Academic Appeal',
    'General University Application',
    'Other (Custom Document)'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const finalDocType = docType === 'Other (Custom Document)'
        ? (customDocType.trim() || 'Custom Document')
        : docType;

      const res = await fetchWritingAssistant({
        docType: finalDocType,
        prompt,
        recipient,
        studentName: userProfile?.fullName,
        university: userProfile?.university
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      const textToCopy = `Subject: ${result.subject}\n\n${result.body}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-sky-300 text-xs font-semibold mb-3 border border-indigo-400/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Academic Correspondence Writer</span>
          </div>
          <h1 className="text-2xl font-black">AI Writing Assistant</h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Generate formal leave applications, official professor emails, course requests, and CV descriptions formatted to academic standards.
          </p>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {docTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {docType === 'Other (Custom Document)' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Document Name / Purpose *
              </label>
              <input
                type="text"
                placeholder="e.g. Internship NOC Request, Scholarship Appeal, Research Grant Proposal..."
                value={customDocType}
                onChange={(e) => setCustomDocType(e.target.value)}
                className="w-full px-3.5 py-2 border border-indigo-300 bg-indigo-50/30 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          ) : null}

          <div className={docType === 'Other (Custom Document)' ? 'md:col-span-1' : 'md:col-span-2'}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recipient Name / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Ahmed Khan, Head of Computer Science"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason or Details to Include
          </label>
          <textarea
            rows={4}
            placeholder="e.g. I was absent from Monday's Data Structures lecture due to severe fever and need to request an extension on Assignment 2..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-colors"
        >
          {loading ? (
            <span>Writing Document...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Document</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Result Output */}
      {result && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Generated Document Draft</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button
                onClick={handleGenerate}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{result.subject}</p>
            </div>

            <div className="pt-3 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Body</span>
              <pre className="text-xs sm:text-sm text-slate-800 font-sans whitespace-pre-wrap leading-relaxed mt-2">
                {result.body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
