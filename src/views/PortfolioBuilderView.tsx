import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Sparkles,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Award,
  BookOpen,
  Eye,
  FileText,
  ShieldCheck,
  Layers,
  Palette,
  File,
  X,
  User,
  Camera,
  Image
} from 'lucide-react';
import {
  PortfolioProfile,
  PortfolioWorkExperience,
  PortfolioEducation,
  PortfolioProject
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  subscribePortfolioProfile,
  savePortfolioProfile
} from '../lib/firestoreService';
import { fetchResumeParse } from '../lib/aiService';

export const PortfolioBuilderView: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const userId = currentUser?.uid || 'demo-student-12345';

  const [resumeText, setResumeText] = useState<string>('');
  const [parsing, setParsing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 350;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setPortfolio((prev) => ({ ...prev, avatarUrl: compressed }));
          }
        };
        if (typeof event.target?.result === 'string') {
          img.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const extractReadableTextFromBinaryBuffer = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let result = '';
    let currentChunk = '';

    for (let i = 0; i < bytes.length; i++) {
      const charCode = bytes[i];
      // Keep printable ASCII (32-126) and newlines/tabs
      if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
        currentChunk += String.fromCharCode(charCode);
      } else {
        if (currentChunk.trim().length >= 3) {
          result += currentChunk + ' ';
        }
        currentChunk = '';
      }
    }
    if (currentChunk.trim().length >= 3) {
      result += currentChunk;
    }

    // Strip PDF object tags & control noise
    return result
      .replace(/\/[\w\d]+/g, ' ')
      .replace(/<<[\s\S]*?>>/g, ' ')
      .replace(/\b(stream|endstream|obj|endobj|xref|trailer|startxref|FlateDecode|Filter|Length|Page|Type|Catalog|Font)\b/gi, ' ')
      .replace(/[^\x20-\x7E\n\r\t]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleProcessFile = (file: File) => {
    if (!file) return;

    const mime = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain');
    setFileMimeType(mime);

    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    });

    // Read Data URL for Gemini inlineData
    const readerDataUrl = new FileReader();
    readerDataUrl.onload = (e) => {
      const res = e.target?.result;
      if (typeof res === 'string') {
        setFileBase64(res);
      }
    };
    readerDataUrl.readAsDataURL(file);

    // Read clean readable text for preview display
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const readerText = new FileReader();
      readerText.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
          setResumeText(cleaned);
        }
      };
      readerText.readAsText(file);
    } else {
      const readerBuffer = new FileReader();
      readerBuffer.onload = (e) => {
        const buffer = e.target?.result;
        if (buffer instanceof ArrayBuffer) {
          const extractedText = extractReadableTextFromBinaryBuffer(buffer);
          setResumeText(
            extractedText.length > 30
              ? extractedText
              : `[Document loaded: ${file.name}] Ready for AI extraction.`
          );
        }
      };
      readerBuffer.readAsArrayBuffer(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const [portfolio, setPortfolio] = useState<PortfolioProfile>({
    id: 'default',
    userId,
    fullName: userProfile?.fullName || 'Student Name',
    headline: 'Computer Science Student & Tech Enthusiast',
    subtitle: 'Passionate about building scalable applications and solving complex problems.',
    bio: 'Dedicated undergraduate student pursuing hands-on technical excellence.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Git'],
    workExperience: [],
    education: [
      {
        degree: userProfile?.degree || 'Bachelor of Science',
        institution: userProfile?.university || 'Bahria University',
        year: '2026'
      }
    ],
    projects: [],
    achievements: [],
    theme: 'modern-dark',
    isPublished: false,
    publicSlug: (userProfile?.fullName || 'student').toLowerCase().replace(/\s+/g, '-') + '-portfolio',
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    const unsub = subscribePortfolioProfile(userId, (data) => {
      if (data) {
        setPortfolio(data);
      }
    });

    return () => unsub();
  }, [userId]);

  const handleParseResume = async () => {
    if (!resumeText.trim() && !fileBase64) return;
    setParsing(true);

    try {
      const extracted = await fetchResumeParse({
        resumeText,
        fileBase64,
        mimeType: fileMimeType,
        existingProfile: {
          fullName: userProfile?.fullName,
          university: userProfile?.university,
          degree: userProfile?.degree
        }
      });

      if (extracted) {
        const updated: PortfolioProfile = {
          ...portfolio,
          fullName: extracted.fullName || portfolio.fullName,
          headline: extracted.headline || portfolio.headline,
          subtitle: extracted.subtitle || portfolio.subtitle,
          bio: extracted.bio || portfolio.bio,
          skills: Array.isArray(extracted.skills) && extracted.skills.length > 0 ? extracted.skills : portfolio.skills,
          workExperience: Array.isArray(extracted.workExperience) && extracted.workExperience.length > 0 ? extracted.workExperience : portfolio.workExperience,
          education: Array.isArray(extracted.education) && extracted.education.length > 0 ? extracted.education : portfolio.education,
          projects: Array.isArray(extracted.projects) && extracted.projects.length > 0 ? extracted.projects : portfolio.projects,
          achievements: Array.isArray(extracted.achievements) && extracted.achievements.length > 0 ? extracted.achievements : portfolio.achievements,
          updatedAt: new Date().toISOString()
        };

        setPortfolio(updated);
        savePortfolioProfile(userId, updated).catch(console.error);

        // Instantly switch to live preview mode so the user sees the built portfolio cards
        setPreviewMode(true);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to parse resume text. Please check format and try again.');
    } finally {
      setParsing(false);
    }
  };

  const handleSavePortfolio = async () => {
    try {
      await savePortfolioProfile(userId, portfolio);
      alert('Portfolio saved successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async () => {
    const nextPublished = !portfolio.isPublished;
    const updated = { ...portfolio, isPublished: nextPublished };
    setPortfolio(updated);
    await savePortfolioProfile(userId, updated);
  };

  const publicUrl = `${window.location.origin}/?portfolio=${portfolio.publicSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeAvatar = portfolio.avatarUrl || userProfile?.avatarUrl;
  const hasExperience = Boolean(
    portfolio.workExperience &&
    portfolio.workExperience.length > 0 &&
    portfolio.workExperience.some((exp) => exp.title?.trim() || exp.company?.trim())
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-slate-900/80 p-6 sm:p-8 rounded-3xl border border-sky-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>AI Resume-to-Portfolio Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Instant Student Portfolio & Public Link</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Convert your resume into a clean, verified online portfolio with custom themes and instant shareable public web links for recruiters.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>{previewMode ? 'Edit Mode' : 'Live Preview'}</span>
          </button>

          <button
            onClick={handleTogglePublish}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg ${
              portfolio.isPublished
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{portfolio.isPublished ? 'Published (Live)' : 'Publish Portfolio'}</span>
          </button>
        </div>
      </div>

      {/* Shareable Link Box */}
      {portfolio.isPublished && (
        <div className="bg-emerald-500/10 border border-emerald-400/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Public Portfolio URL: <strong className="text-white font-mono">{publicUrl}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}

      {!previewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: AI Resume Extractor */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 text-slate-100">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <span>Resume Importer</span>
                </div>
                <div className="flex bg-white/10 p-1 rounded-xl gap-1 text-[11px] font-bold">
                  <button
                    onClick={() => setInputMethod('upload')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      inputMethod === 'upload' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setInputMethod('paste')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      inputMethod === 'paste' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Veracity Guard:</strong> AI extracts verified facts strictly from your file or text. Unverified achievements are excluded.
                </span>
              </div>

              {inputMethod === 'upload' ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                    className="hidden"
                  />

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-sky-400/30 hover:border-sky-400/60 bg-sky-500/5 hover:bg-sky-500/10 rounded-2xl text-center space-y-3 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Click or drag & drop resume file
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supports PDF, DOCX, TXT, MD & RTF
                      </p>
                    </div>
                  </div>

                  {uploadedFile && (
                    <div className="p-3 bg-white/5 border border-sky-500/30 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <File className="w-4 h-4 text-sky-400 shrink-0" />
                        <div className="truncate min-w-0">
                          <p className="font-bold text-white truncate">{uploadedFile.name}</p>
                          <p className="text-[10px] text-slate-400">{uploadedFile.size} • Extracted text ready</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          setFileBase64(null);
                          setFileMimeType(null);
                          setResumeText('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {resumeText && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Extracted Resume Text Preview ({resumeText.length} chars)
                      </span>
                      <textarea
                        rows={4}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] text-slate-300 leading-relaxed font-mono focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  rows={9}
                  placeholder="Paste your resume text here (Education, Work Experience, Skills, Projects, Honors)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/15 rounded-2xl text-xs text-white leading-relaxed placeholder:text-slate-500"
                />
              )}

              <button
                onClick={handleParseResume}
                disabled={parsing || (!resumeText.trim() && !fileBase64)}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg border border-sky-400/30 inline-flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${parsing ? 'animate-spin' : ''}`} />
                <span>{parsing ? 'Parsing Resume Facts...' : 'Extract Data & Build Portfolio'}</span>
              </button>
            </div>

            {/* Theme Picker */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" />
                <span>Select Portfolio Theme</span>
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'modern-dark', label: 'Modern Dark', bg: 'bg-slate-900 border-indigo-500/50 text-white' },
                  { id: 'minimal-light', label: 'Minimal Light', bg: 'bg-slate-100 text-slate-900 border-slate-300' },
                  { id: 'creative-gradient', label: 'Gradient Accent', bg: 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPortfolio({ ...portfolio, theme: t.id as any })}
                    className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${t.bg} ${
                      portfolio.theme === t.id ? 'ring-2 ring-sky-400' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Portfolio Editor Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Portfolio Content Editor</h3>
                <button
                  onClick={handleSavePortfolio}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>

              {/* Photo & 3D Avatar Controls */}
              <div className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-3">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400" /> Portfolio Avatar / Visual Identity
                  </span>
                  {activeAvatar ? (
                    <button
                      type="button"
                      onClick={() => setPortfolio({ ...portfolio, avatarUrl: '' })}
                      className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 font-medium"
                    >
                      Switch to 3D Avatar
                    </button>
                  ) : (
                    <span className="text-[10px] text-sky-300 font-bold bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-400/30">
                      ✨ 3D AI Avatar Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-1">
                  {activeAvatar ? (
                    <img
                      src={activeAvatar}
                      alt={portfolio.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400/50 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-purple-600 p-0.5 shadow-lg shrink-0">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
                        <span className="text-sm font-black text-white">
                          {portfolio.fullName ? portfolio.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'ST'}
                        </span>
                        <span className="text-[8px] font-extrabold text-sky-300 uppercase tracking-widest mt-0.5">3D</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-300 leading-snug">
                      {activeAvatar
                        ? 'Your uploaded photo is active in your portfolio preview.'
                        : 'No image uploaded yet. A high-tech 3D Avatar is dynamically generated for your portfolio!'}
                    </p>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/15"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      {activeAvatar ? 'Upload Custom Photo' : 'Upload Image'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Profile Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={portfolio.fullName}
                    onChange={(e) => setPortfolio({ ...portfolio, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    value={portfolio.headline}
                    onChange={(e) => setPortfolio({ ...portfolio, headline: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Summary</label>
                <textarea
                  rows={3}
                  value={portfolio.bio}
                  onChange={(e) => setPortfolio({ ...portfolio, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white leading-relaxed"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={portfolio.skills?.join(', ')}
                  onChange={(e) => setPortfolio({ ...portfolio, skills: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white"
                />
              </div>

              {/* Work Experience */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Work Experience ({portfolio.workExperience?.length || 0})</span>
                  <button
                    onClick={() => {
                      const exp = portfolio.workExperience || [];
                      setPortfolio({
                        ...portfolio,
                        workExperience: [
                          ...exp,
                          { title: 'Software Development Intern', company: 'Tech Lab', duration: 'Summer 2025', description: 'Assisted in building web features.' }
                        ]
                      });
                    }}
                    className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {!hasExperience && (
                  <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-xl text-xs text-amber-200/90 leading-relaxed">
                    ✨ <strong>Smart Auto-Hide Active:</strong> Since you have no work experience logged, the "Work Experience" heading and section will be automatically hidden from your public portfolio view!
                  </div>
                )}

                {portfolio.workExperience?.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-2 relative group">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = portfolio.workExperience.filter((_, i) => i !== idx);
                        setPortfolio({ ...portfolio, workExperience: updated });
                      }}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-400 p-1"
                      title="Remove experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-3 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Role Title"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...portfolio.workExperience];
                          updated[idx].title = e.target.value;
                          setPortfolio({ ...portfolio, workExperience: updated });
                        }}
                        className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Company/Org"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...portfolio.workExperience];
                          updated[idx].company = e.target.value;
                          setPortfolio({ ...portfolio, workExperience: updated });
                        }}
                        className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Dates/Duration"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...portfolio.workExperience];
                          updated[idx].duration = e.target.value;
                          setPortfolio({ ...portfolio, workExperience: updated });
                        }}
                        className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Responsibilities..."
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...portfolio.workExperience];
                        updated[idx].description = e.target.value;
                        setPortfolio({ ...portfolio, workExperience: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Projects ({portfolio.projects?.length || 0})</span>
                  <button
                    onClick={() => {
                      const projs = portfolio.projects || [];
                      setPortfolio({
                        ...portfolio,
                        projects: [
                          ...projs,
                          { title: 'Project Title', description: 'Brief overview of technologies and impact.', tags: ['React', 'TypeScript'], link: '' }
                        ]
                      });
                    }}
                    className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {portfolio.projects?.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-2">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...portfolio.projects];
                        updated[idx].title = e.target.value;
                        setPortfolio({ ...portfolio, projects: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Project Description..."
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...portfolio.projects];
                        updated[idx].description = e.target.value;
                        setPortfolio({ ...portfolio, projects: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Preview Mode Card */
        <div className={`p-8 rounded-3xl border shadow-2xl space-y-8 ${
          portfolio.theme === 'minimal-light'
            ? 'bg-slate-50 text-slate-900 border-slate-300'
            : portfolio.theme === 'creative-gradient'
            ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white border-purple-500/30'
            : 'bg-slate-900 text-white border-white/10'
        }`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-white/10">
            {activeAvatar ? (
              <div className="relative group shrink-0">
                <img
                  src={activeAvatar}
                  alt={portfolio.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-sky-400/50 shadow-2xl"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-sky-950/90 text-sky-300 text-[10px] font-extrabold rounded-full border border-sky-400/40 shadow">
                  Photo
                </span>
              </div>
            ) : (
              /* Smart 3D Avatar Display */
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-purple-600 p-0.5 shadow-2xl shrink-0 group">
                <div className="w-full h-full bg-slate-950/90 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.4),transparent_70%)] pointer-events-none" />
                  <div className="absolute inset-1 rounded-full border border-sky-400/20 animate-pulse" />
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 shadow-lg flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    <span className="text-base font-black text-white tracking-wider drop-shadow-md">
                      {portfolio.fullName ? portfolio.fullName.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'ST'}
                    </span>
                  </div>
                  <span className="mt-1.5 text-[9px] font-black text-sky-300 uppercase tracking-widest bg-sky-950/90 px-2 py-0.5 rounded-full border border-sky-400/30 shadow relative z-10">
                    3D Avatar
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 flex-1">
              <h1 className="text-3xl font-extrabold">{portfolio.fullName}</h1>
              <p className="text-base font-semibold text-sky-400">{portfolio.headline}</p>
              <p className="text-xs max-w-2xl leading-relaxed opacity-80">{portfolio.bio}</p>

              {/* Skills Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                {portfolio.skills?.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Education & Experience */}
          <div className={hasExperience ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
            <div className="space-y-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" /> Education
              </h3>
              {portfolio.education?.map((ed, i) => (
                <div key={i} className="p-3 bg-black/20 rounded-2xl border border-white/5 space-y-1">
                  <h4 className="text-xs font-bold">{ed.degree}</h4>
                  <p className="text-[11px] opacity-80">{ed.institution} • {ed.year}</p>
                </div>
              ))}
            </div>

            {hasExperience && (
              <div className="space-y-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-sky-400" /> Experience
                </h3>
                {portfolio.workExperience?.filter(exp => exp.title?.trim() || exp.company?.trim()).map((exp, i) => (
                  <div key={i} className="p-3 bg-black/20 rounded-2xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{exp.title}</span>
                      <span className="text-[10px] opacity-70">{exp.duration}</span>
                    </div>
                    <p className="text-[11px] text-sky-400 font-semibold">{exp.company}</p>
                    <p className="text-xs opacity-80 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          {portfolio.projects?.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" /> Featured Projects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.projects.map((p, i) => (
                  <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="text-sm font-bold">{p.title}</h4>
                    <p className="text-xs opacity-80 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
