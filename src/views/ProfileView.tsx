import React, { useState, useEffect } from 'react';
import { User, School, GraduationCap, Save, Check, Upload, Image, Trash2, Camera, Phone, IdCard, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../lib/firestoreService';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
];

export const ProfileView: React.FC = () => {
  const { userProfile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [university, setUniversity] = useState(
    userProfile?.university && !userProfile.university.toLowerCase().includes('stanford')
      ? userProfile.university
      : 'Bahria University'
  );
  const [degree, setDegree] = useState(userProfile?.degree || '');
  const [semester, setSemester] = useState(userProfile?.semester || '');
  const [studentId, setStudentId] = useState(userProfile?.studentId || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync profile data when userProfile loads or changes
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setUniversity(
        !userProfile.university || userProfile.university.toLowerCase().includes('stanford')
          ? 'Bahria University'
          : userProfile.university
      );
      setDegree(userProfile.degree || '');
      setSemester(userProfile.semester || '');
      setStudentId(userProfile.studentId || '');
      setPhone(userProfile.phone || '');
      setBio(userProfile.bio || '');
      setAvatarUrl(userProfile.avatarUrl || '');
    }
  }, [userProfile]);

  // File Upload with automatic image compression to ensure smooth, fast uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setAvatarUrl(compressedDataUrl);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSaving(true);
    setSuccess(false);
    try {
      await saveUserProfile({
        ...userProfile,
        fullName,
        university,
        degree,
        semester,
        studentId,
        phone,
        bio,
        avatarUrl
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-8 text-slate-100">
        
        {/* Profile Picture Header & Upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Student Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-400/80 shadow-xl shadow-indigo-500/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-400 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-indigo-500/30 border border-indigo-400/30">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              {/* Upload Overlay Icon */}
              <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold gap-1">
                <Camera className="w-5 h-5 text-sky-400" />
                <span>Change</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white">{fullName || 'Student Profile'}</h1>
              <p className="text-xs text-slate-400">{userProfile?.email}</p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-500/20 border border-sky-400/30 px-2.5 py-0.5 rounded-full">
                  {university || 'University Student'}
                </span>
                {studentId && (
                  <span className="text-[10px] font-mono text-slate-300 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full">
                    ID: {studentId}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upload Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Preset Avatar Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Choose a Student Avatar Preset</label>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(url)}
                className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  avatarUrl === url
                    ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-105'
                    : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                }`}
              >
                <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">University Email</label>
              <input
                type="text"
                disabled
                value={userProfile?.email || ''}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-xs cursor-not-allowed opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">University Name *</label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Degree / Program *</label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Semester</label>
              <input
                type="text"
                required
                placeholder="e.g. Semester 5 / Fall 2026"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID / Roll No.</label>
              <input
                type="text"
                placeholder="e.g. STU-2026-908"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Bio / About Me</label>
            <textarea
              rows={3}
              placeholder="Share your research interests, career goals, or campus involvement..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
