import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  CheckCircle2,
  XCircle,
  RotateCw,
  Send,
  Upload,
  Lightbulb,
  Check
} from 'lucide-react';
import { Course, MCQQuestion, Flashcard } from '../types';
import { fetchStudyAssistantResponse } from '../lib/aiService';

interface StudyAssistantViewProps {
  courses: Course[];
}

export const StudyAssistantView: React.FC<StudyAssistantViewProps> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [contextText, setContextText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'explain' | 'mcq' | 'flashcard' | 'summarize'>('explain');
  const [loading, setLoading] = useState<boolean>(false);

  // Results
  const [explanationResult, setExplanationResult] = useState<string>('');
  const [mcqResult, setMcqResult] = useState<MCQQuestion[]>([]);
  const [flashcardResult, setFlashcardResult] = useState<Flashcard[]>([]);

  // Interactive Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const handleAction = async (mode: 'explain' | 'mcq' | 'flashcard' | 'summarize') => {
    if (!question.trim() && !contextText.trim()) return;
    setActiveTab(mode);
    setLoading(true);
    setUserAnswers({});
    setShowAnswer(false);

    try {
      const courseObj = courses.find((c) => c.id === selectedCourse);
      const res = await fetchStudyAssistantResponse({
        mode,
        question: question || 'Explain the provided study material in detail',
        contextText,
        course: courseObj ? courseObj.courseName : ''
      });

      if (mode === 'mcq') {
        setMcqResult(Array.isArray(res) ? res : []);
      } else if (mode === 'flashcard') {
        setFlashcardResult(Array.isArray(res) ? res : []);
        setActiveFlashcardIdx(0);
      } else {
        setExplanationResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
      }
    } catch (err: any) {
      console.error(err);
      setExplanationResult(`Error generating response: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContextText((prev) => `${prev}\n\n[Uploaded Document: ${file.name}]\n${event.target?.result}`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950/80 via-indigo-950/80 to-slate-950/80 backdrop-blur-2xl text-white p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-sky-300 text-xs font-semibold mb-3 border border-indigo-400/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Tutor Engine</span>
          </div>
          <h1 className="text-2xl font-black">AI Study Assistant</h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Paste lecture notes, ask complex course questions, generate practice multiple-choice quizzes, or study with AI flashcards.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Course (Optional)</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="" className="bg-slate-900">-- General Academic --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Topic or Question
            </label>
            <input
              type="text"
              placeholder="e.g. How does Dijkstra's Algorithm work?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">
              Paste Lecture Notes or Study Material
            </label>
            <label className="cursor-pointer text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Attach Text / Note File</span>
              <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea
            rows={4}
            placeholder="Paste your lecture transcript, slide text, or notes here for context..."
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleAction('explain')}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Explain Step-by-Step</span>
          </button>

          <button
            onClick={() => handleAction('summarize')}
            disabled={loading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/15 shadow-md inline-flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Summarize Material</span>
          </button>

          <button
            onClick={() => handleAction('mcq')}
            disabled={loading}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 border border-amber-400/30 inline-flex items-center gap-2 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Generate MCQs Quiz</span>
          </button>

          <button
            onClick={() => handleAction('flashcard')}
            disabled={loading}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 border border-sky-400/30 inline-flex items-center gap-2 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Generate Flashcards</span>
          </button>
        </div>
      </div>

      {/* Output Result Area */}
      {loading && (
        <div className="bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center space-y-3 shadow-xl">
          <div className="w-8 h-8 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-300">CampusFlow AI is analyzing your material...</p>
        </div>
      )}

      {!loading && activeTab === 'explain' && explanationResult && (
        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4" />
            <span>Explanation & Study Breakdown</span>
          </div>
          <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
            {explanationResult}
          </div>
        </div>
      )}

      {!loading && activeTab === 'summarize' && explanationResult && (
        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/10 pb-3">
            <FileText className="w-4 h-4" />
            <span>Summary & Key Concepts</span>
          </div>
          <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
            {explanationResult}
          </div>
        </div>
      )}

      {/* Interactive MCQ Quiz */}
      {!loading && activeTab === 'mcq' && mcqResult.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white text-base">Multiple-Choice Practice Quiz</h3>
            <span className="text-xs font-mono text-slate-400">{mcqResult.length} Questions</span>
          </div>

          <div className="space-y-6">
            {mcqResult.map((q, qIdx) => {
              const selectedOpt = userAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div key={qIdx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <p className="font-bold text-white text-xs sm:text-sm">
                    Q{qIdx + 1}. {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10';
                      if (isAnswered) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold';
                        } else if (optIdx === selectedOpt) {
                          btnStyle = 'bg-rose-500/20 border-rose-500/30 text-rose-300';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="p-3 bg-black/30 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1">
                      <p className="font-bold text-white">Explanation:</p>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Flashcards */}
      {!loading && activeTab === 'flashcard' && flashcardResult.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>
              Card {activeFlashcardIdx + 1} of {flashcardResult.length}
            </span>
            <span>Click card to flip</span>
          </div>

          <div
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full min-h-[220px] bg-gradient-to-tr from-slate-950/90 to-indigo-950/90 border border-white/15 text-white rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all hover:scale-[1.01]"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-2">
              {showAnswer ? 'Answer' : 'Question / Concept'}
            </span>
            <p className="text-base sm:text-lg font-bold leading-relaxed max-w-md">
              {showAnswer
                ? flashcardResult[activeFlashcardIdx].answer
                : flashcardResult[activeFlashcardIdx].question}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setShowAnswer(false);
                setActiveFlashcardIdx((prev) => Math.max(0, prev - 1));
              }}
              disabled={activeFlashcardIdx === 0}
              className="px-4 py-2 border border-white/15 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-40"
            >
              Previous Card
            </button>
            <button
              onClick={() => {
                setShowAnswer(false);
                setActiveFlashcardIdx((prev) => Math.min(flashcardResult.length - 1, prev + 1));
              }}
              disabled={activeFlashcardIdx === flashcardResult.length - 1}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 border border-indigo-400/30 disabled:opacity-40"
            >
              Next Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
