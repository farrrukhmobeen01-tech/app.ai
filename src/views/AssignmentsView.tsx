import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  X,
  Filter,
  ArrowUpDown,
  Paperclip,
  Upload,
  FileText,
  Eye,
  Copy,
  Download,
  FileCode,
  Check
} from 'lucide-react';
import { Assignment, Course, AssignmentPriority, AssignmentStatus } from '../types';

interface AssignmentsViewProps {
  assignments: Assignment[];
  courses: Course[];
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<string>;
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  onDeleteAssignment: (id: string) => Promise<void>;
  onToggleStatus: (assignment: Assignment) => Promise<void>;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  courses,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onToggleStatus
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Attachment Viewer Modal
  const [viewingAttachment, setViewingAttachment] = useState<Assignment | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<AssignmentPriority>('Medium');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [status, setStatus] = useState<AssignmentStatus>('Not Started');

  // File Upload & Pasted Text State
  const [attachedText, setAttachedText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileData, setAttachedFileData] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCourseId(courses.length > 0 ? courses[0].id : '');
    const todayStr = new Date().toISOString().split('T')[0];
    setDueDate(todayStr);
    setPriority('Medium');
    setEstimatedHours(2);
    setStatus('Not Started');
    setAttachedText('');
    setAttachedFileName('');
    setAttachedFileData('');
    setShowModal(true);
  };

  const openEditModal = (item: Assignment) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setCourseId(item.courseId);
    setDueDate(item.dueDate);
    setPriority(item.priority);
    setEstimatedHours(item.estimatedHours);
    setStatus(item.status);
    setAttachedText(item.attachedText || '');
    setAttachedFileName(item.attachedFileName || '');
    setAttachedFileData(item.attachedFileData || '');
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please attach a smaller file.');
      return;
    }

    setAttachedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        courseId,
        dueDate,
        priority,
        estimatedHours: Number(estimatedHours),
        status,
        attachedText,
        attachedFileName,
        attachedFileData
      };

      if (editingId) {
        await onUpdateAssignment(editingId, payload);
      } else {
        await onAddAssignment(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
      setSubmitting(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const filteredAssignments = assignments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (courseFilter !== 'all' && a.courseId !== courseFilter) return false;
    return true;
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold text-white">Assignments & Tasks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track coursework deadlines, upload submission files, or paste essay drafts & notes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span>Filter:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-white/15 rounded-xl bg-white/5 text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all" className="bg-slate-900">All Statuses</option>
            <option value="Not Started" className="bg-slate-900">Not Started</option>
            <option value="In Progress" className="bg-slate-900">In Progress</option>
            <option value="Completed" className="bg-slate-900">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Course:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 border border-white/15 rounded-xl bg-white/5 text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all" className="bg-slate-900">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl p-12 text-center rounded-3xl border border-dashed border-white/20 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mx-auto">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">No assignments found</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Add your upcoming assignments, paste essay drafts, or attach homework files to keep track.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((item) => {
            const course = courses.find((c) => c.id === item.courseId);
            const isDone = item.status === 'Completed';
            const hasAttachments = Boolean(item.attachedFileName || item.attachedText);

            return (
              <div
                key={item.id}
                className={`bg-white/5 backdrop-blur-xl p-5 rounded-2xl border transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone ? 'border-white/10 opacity-60' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => onToggleStatus(item)}
                    className={`mt-1 p-1 rounded-full transition-colors ${
                      isDone ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 hover:text-indigo-400'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {item.title}
                      </h3>
                      {course && (
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded text-white border border-white/20"
                          style={{ backgroundColor: course.color ? `${course.color}dd` : '#4f46e5dd' }}
                        >
                          {course.courseCode}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>
                    )}

                    {/* Attachment / Pasted Text Indicators */}
                    {hasAttachments && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {item.attachedFileName && (
                          <button
                            onClick={() => setViewingAttachment(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                            <span className="truncate max-w-[150px]">{item.attachedFileName}</span>
                          </button>
                        )}

                        {item.attachedText && (
                          <button
                            onClick={() => setViewingAttachment(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Pasted Text Attached ({item.attachedText.length} chars)</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-slate-200 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        Due: {item.dueDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Est: {item.estimatedHours}h
                      </span>
                      <span>•</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          item.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.priority === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/10 shrink-0">
                  {hasAttachments && (
                    <button
                      onClick={() => setViewingAttachment(item)}
                      className="p-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-400/30 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="View Attached File / Text"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  )}

                  <select
                    value={item.status}
                    onChange={(e) => onUpdateAssignment(item.id, { status: e.target.value as AssignmentStatus })}
                    className="px-2.5 py-1.5 border border-white/15 rounded-xl text-xs font-semibold bg-white/5 text-slate-100 outline-none"
                  >
                    <option value="Not Started" className="bg-slate-900">Not Started</option>
                    <option value="In Progress" className="bg-slate-900">In Progress</option>
                    <option value="Completed" className="bg-slate-900">Completed</option>
                  </select>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    title="Edit assignment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteAssignment(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors"
                    title="Delete assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Viewing Attached Content */}
      {viewingAttachment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/15 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-white text-base">
                  Attachments & Solution Notes
                </h3>
                <p className="text-xs text-slate-400">{viewingAttachment.title}</p>
              </div>
              <button
                onClick={() => setViewingAttachment(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Attachment Box */}
            {viewingAttachment.attachedFileName && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{viewingAttachment.attachedFileName}</p>
                      <p className="text-[10px] text-slate-400">Attached File Document</p>
                    </div>
                  </div>

                  {viewingAttachment.attachedFileData && (
                    <a
                      href={viewingAttachment.attachedFileData}
                      download={viewingAttachment.attachedFileName}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>

                {/* Preview Image if image data URL */}
                {viewingAttachment.attachedFileData?.startsWith('data:image/') && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/10 max-h-60 bg-black/40 flex items-center justify-center p-2">
                    <img
                      src={viewingAttachment.attachedFileData}
                      alt="Attachment Preview"
                      className="max-h-56 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Pasted Text Box */}
            {viewingAttachment.attachedText && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Pasted Content / Text Solution</span>
                  </div>

                  <button
                    onClick={() => handleCopyText(viewingAttachment.attachedText || '')}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-xl font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                  {viewingAttachment.attachedText}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setViewingAttachment(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit Assignment */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/15 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">
                {editingId ? 'Edit Assignment' : 'Create Assignment'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search Tree Implementation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="" className="bg-slate-900">-- General / No Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Low" className="bg-slate-900">Low</option>
                    <option value="Medium" className="bg-slate-900">Medium</option>
                    <option value="High" className="bg-slate-900">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Not Started" className="bg-slate-900">Not Started</option>
                    <option value="In Progress" className="bg-slate-900">In Progress</option>
                    <option value="Completed" className="bg-slate-900">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Task summary, submission guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Attach File Section */}
              <div className="space-y-1.5 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                <label className="block text-xs font-semibold text-slate-200">
                  Attach Homework / Document File
                </label>

                {attachedFileName ? (
                  <div className="flex items-center justify-between p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-indigo-300 shrink-0" />
                      <span className="text-xs font-medium text-white truncate">{attachedFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFileName('');
                        setAttachedFileData('');
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/15 hover:border-indigo-400/50 rounded-xl cursor-pointer transition-colors bg-white/5">
                    <Upload className="w-5 h-5 text-indigo-400 mb-1" />
                    <span className="text-xs font-bold text-slate-200">Click to upload file</span>
                    <span className="text-[10px] text-slate-400">PDF, DOCX, TXT, Images, ZIP up to 5MB</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Paste or Write Text Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Write or Paste Essay / Code / Solution Text
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clipText = await navigator.clipboard.readText();
                        if (clipText) setAttachedText((prev) => (prev ? prev + '\n' + clipText : clipText));
                      } catch (e) {
                        // fallback
                      }
                    }}
                    className="text-[10px] font-bold text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Paste Clipboard</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder="Paste your essay draft, code snippet, assignment prompt text, or solution here..."
                  value={attachedText}
                  onChange={(e) => setAttachedText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  {submitting ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
