import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  User,
  GraduationCap,
  Clock,
  Trash2,
  Edit2,
  FileText,
  X,
  CheckSquare,
  BarChart2,
  FolderPlus
} from 'lucide-react';
import { Course, Assignment, Assessment } from '../types';

interface CoursesViewProps {
  courses: Course[];
  assignments: Assignment[];
  assessments: Assessment[];
  onAddCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  onDeleteCourse: (courseId: string) => Promise<void>;
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  assignments,
  assessments,
  onAddCourse,
  onDeleteCourse,
  onAddAssignment
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form State
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [creditHours, setCreditHours] = useState(3);
  const [color, setColor] = useState('#4f46e5');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    setSubmitting(true);
    try {
      await onAddCourse({
        courseName,
        courseCode: courseCode || 'CS-101',
        instructorName,
        creditHours: Number(creditHours),
        color,
        description
      });
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
      setSubmitting(false);
      setCourseName('');
      setCourseCode('');
      setInstructorName('');
      setCreditHours(3);
      setDescription('');
    }
  };

  const presetColors = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold text-white">Enrolled Courses</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage active university subjects, credit hours, instructors, and assignments.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Course Cards Grid */}
      {courses.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl p-12 text-center rounded-3xl border border-dashed border-white/20 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">You haven't added any courses yet</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Add your university courses to start tracking assignments, grades, and AI study notes for each subject.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Course</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const courseAssignments = assignments.filter((a) => a.courseId === course.id);
            const pendingCount = courseAssignments.filter((a) => a.status !== 'Completed').length;

            const courseAssessments = assessments.filter((a) => a.courseId === course.id);
            const avgGrade =
              courseAssessments.length > 0
                ? Math.round(
                    courseAssessments.reduce((sum, item) => sum + item.percentage, 0) / courseAssessments.length
                  )
                : null;

            return (
              <div
                key={course.id}
                className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl hover:border-white/20 transition-all flex flex-col overflow-hidden group"
              >
                <div
                  className="p-5 text-white relative"
                  style={{ backgroundColor: course.color ? `${course.color}dd` : '#4f46e5dd' }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 backdrop-blur-md border border-white/20">
                      {course.courseCode}
                    </span>
                    <button
                      onClick={() => onDeleteCourse(course.id)}
                      className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-black/30 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-extrabold mt-3 leading-snug">{course.courseName}</h3>
                  <p className="text-xs text-white/90 font-medium mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{course.instructorName || 'Instructor Not Specified'}</span>
                  </p>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {course.description || 'No course description provided.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-[10px] text-slate-400 font-medium">Credit Hours</p>
                      <p className="text-xs font-bold text-slate-100 mt-0.5">{course.creditHours} CH</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-[10px] text-slate-400 font-medium">Pending Tasks</p>
                      <p className="text-xs font-bold text-amber-400 mt-0.5">{pendingCount}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-[10px] text-slate-400 font-medium">Avg Grade</p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">
                        {avgGrade !== null ? `${avgGrade}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full py-2 bg-white/10 hover:bg-white/15 text-slate-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    <span>View Course Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Add New Course</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="CS-201"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={creditHours}
                    onChange={(e) => setCreditHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Instructor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ahmed Khan"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Theme Color</label>
                <div className="flex items-center gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Syllabus topic focus, lab location, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  {submitting ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Detail Drawer Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-white/15 overflow-hidden text-slate-100">
            <div
              className="p-6 text-white flex items-start justify-between"
              style={{ backgroundColor: selectedCourse.color ? `${selectedCourse.color}dd` : '#4f46e5dd' }}
            >
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 border border-white/20">
                  {selectedCourse.courseCode}
                </span>
                <h2 className="text-xl font-bold mt-2">{selectedCourse.courseName}</h2>
                <p className="text-xs text-white/90 mt-1">Instructor: {selectedCourse.instructorName || 'N/A'}</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-white/80 hover:text-white p-1 bg-black/30 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Course Description
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                  {selectedCourse.description || 'No detailed description provided for this course.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Assignments for this Course
                </h4>
                {assignments.filter((a) => a.courseId === selectedCourse.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No assignments created for this course yet.</p>
                ) : (
                  <div className="space-y-2">
                    {assignments
                      .filter((a) => a.courseId === selectedCourse.id)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{item.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Due: {item.dueDate}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            {item.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
