import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  X,
  Zap,
  Save
} from 'lucide-react';
import { GroupProject, ProjectTask, Course } from '../types';
import { fetchProjectPlan } from '../lib/aiService';
import {
  addProject,
  deleteProject,
  subscribeProjectTasks,
  addProjectTask,
  updateProjectTask,
  deleteProjectTask
} from '../lib/firestoreService';
import { useAuth } from '../context/AuthContext';

interface GroupProjectsViewProps {
  projects: GroupProject[];
  courses: Course[];
}

export const GroupProjectsView: React.FC<GroupProjectsViewProps> = ({ projects, courses }) => {
  const { userProfile } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [tasks, setTasks] = useState<ProjectTask[]>([]);

  // Modal States
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAiPlanner, setShowAiPlanner] = useState(false);

  // New Project Form
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCourseId, setProjCourseId] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [projMembersText, setProjMembersText] = useState('');

  // New Task Form
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedMember, setAssignedMember] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');

  // AI Planner state
  const [aiPrompt, setAiPrompt] = useState('We need to build a web application for LMS in 3 weeks. There are 4 team members.');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const unsub = subscribeProjectTasks(selectedProjectId, (tList) => {
      setTasks(tList);
    });
    return () => unsub();
  }, [selectedProjectId]);

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !userProfile) return;
    const members = projMembersText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    await addProject({
      name: projName,
      description: projDesc,
      courseId: projCourseId,
      ownerId: userProfile.uid,
      memberIds: [userProfile.uid],
      memberEmails: [userProfile.email, ...members],
      deadline: projDeadline || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });

    setShowCreateProject(false);
    setProjName('');
    setProjDesc('');
    setProjMembersText('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || !selectedProjectId) return;
    await addProjectTask(selectedProjectId, {
      name: taskName,
      description: taskDesc,
      assignedMember: assignedMember || 'Unassigned',
      deadline: taskDeadline || new Date().toISOString().split('T')[0],
      status: 'To Do'
    });
    setShowCreateTask(false);
    setTaskName('');
    setTaskDesc('');
  };

  const handleGenerateAiPlan = async () => {
    setGeneratingAi(true);
    try {
      const plan = await fetchProjectPlan({
        projectName: currentProject?.name || 'Group Project',
        description: aiPrompt,
        courseName: 'University Course',
        durationWeeks: 3,
        teamMemberCount: currentProject?.memberEmails?.length || 4,
        teamMembers: currentProject?.memberEmails || ['Alex', 'Sarah', 'Jordan', 'Taylor']
      });
      setGeneratedPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSaveAiTasks = async () => {
    if (!generatedPlan || !generatedPlan.tasks || !selectedProjectId) return;
    for (const t of generatedPlan.tasks) {
      await addProjectTask(selectedProjectId, {
        name: t.name,
        description: t.description,
        assignedMember: t.suggestedMember || 'Team Member',
        deadline: new Date(Date.now() + (t.deadlineDaysFromNow || 7) * 86400000)
          .toISOString()
          .split('T')[0],
        status: 'To Do'
      });
    }
    setShowAiPlanner(false);
    setGeneratedPlan(null);
  };

  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Select Project */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold text-white">Group Project Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Collaborating on team assignments, member task assignments, and AI project breakdowns.
          </p>
        </div>

        <button
          onClick={() => setShowCreateProject(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Group Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl p-12 text-center rounded-3xl border border-dashed border-white/20 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">No group projects created yet</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Create a group project, invite team members, and let AI break down the project into milestones and tasks.
          </p>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedProjectId === p.id
                    ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {currentProject && (
            <div className="space-y-6">
              {/* Project Dashboard Header */}
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">{currentProject.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">{currentProject.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAiPlanner(true)}
                      className="px-3.5 py-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 font-bold text-xs rounded-xl border border-sky-400/30 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>AI Task Breakdown</span>
                    </button>

                    <button
                      onClick={() => setShowCreateTask(true)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>

                    <button
                      onClick={() => deleteProject(currentProject.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar & Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Completion</p>
                    <p className="text-lg font-black text-sky-400 mt-0.5">{completionPercentage}%</p>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Tasks Done</p>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">
                      {completedTasksCount} / {tasks.length}
                    </p>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Team Members</p>
                    <p className="text-lg font-black text-slate-100 mt-0.5">
                      {currentProject.memberEmails?.length || 1}
                    </p>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Project Deadline</p>
                    <p className="text-xs font-mono font-bold text-rose-400 mt-1">{currentProject.deadline}</p>
                  </div>
                </div>
              </div>

              {/* Tasks Board Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* To Do */}
                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-300 text-xs px-1">
                    <span>TO DO ({tasks.filter((t) => t.status === 'To Do').length})</span>
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.status === 'To Do')
                      .map((task) => (
                        <div key={task.id} className="bg-white/5 p-3.5 rounded-2xl border border-white/10 shadow-lg space-y-2">
                          <p className="font-bold text-xs text-white">{task.name}</p>
                          <p className="text-[11px] text-slate-300 leading-snug">{task.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                            <span className="font-semibold text-slate-300">Assigned: {task.assignedMember}</span>
                            <button
                              onClick={() => updateProjectTask(selectedProjectId, task.id, { status: 'In Progress' })}
                              className="text-sky-400 hover:underline font-bold"
                            >
                              Move to Progress →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-amber-500/10 backdrop-blur-xl p-4 rounded-3xl border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between font-bold text-amber-300 text-xs px-1">
                    <span>IN PROGRESS ({tasks.filter((t) => t.status === 'In Progress').length})</span>
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.status === 'In Progress')
                      .map((task) => (
                        <div key={task.id} className="bg-white/5 p-3.5 rounded-2xl border border-amber-500/30 shadow-lg space-y-2">
                          <p className="font-bold text-xs text-white">{task.name}</p>
                          <p className="text-[11px] text-slate-300 leading-snug">{task.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                            <span className="font-semibold text-slate-300">Assigned: {task.assignedMember}</span>
                            <button
                              onClick={() => updateProjectTask(selectedProjectId, task.id, { status: 'Completed' })}
                              className="text-emerald-400 hover:underline font-bold"
                            >
                              Mark Done ✓
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Completed */}
                <div className="bg-emerald-500/10 backdrop-blur-xl p-4 rounded-3xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between font-bold text-emerald-300 text-xs px-1">
                    <span>COMPLETED ({tasks.filter((t) => t.status === 'Completed').length})</span>
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.status === 'Completed')
                      .map((task) => (
                        <div key={task.id} className="bg-white/5 p-3.5 rounded-2xl border border-emerald-500/30 shadow-lg space-y-2 opacity-70">
                          <p className="font-bold text-xs text-white line-through">{task.name}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Completed by: {task.assignedMember}</span>
                            <button
                              onClick={() => deleteProjectTask(selectedProjectId, task.id)}
                              className="text-rose-400 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Project Planner Modal */}
      {showAiPlanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/15 space-y-4 max-h-[85vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                <span>AI Group Project Planner</span>
              </div>
              <button onClick={() => setShowAiPlanner(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Describe project goal & requirements
              </label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={handleGenerateAiPlan}
                disabled={generatingAi}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 inline-flex items-center gap-2"
              >
                {generatingAi ? 'Generating Breakdown...' : 'Generate AI Task Breakdown'}
              </button>
            </div>

            {generatedPlan && (
              <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
                <h4 className="font-bold text-sky-400 text-sm">{generatedPlan.overview}</h4>

                <div className="space-y-2">
                  <p className="font-bold text-slate-300 uppercase text-[10px]">Tasks Breakdown</p>
                  {generatedPlan.tasks?.map((t: any, idx: number) => (
                    <div key={idx} className="bg-black/30 p-3 rounded-xl border border-white/10">
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-[11px] text-slate-300 mt-1">{t.description}</p>
                      <p className="text-[10px] text-sky-400 mt-1 font-semibold">
                        Suggested Assignee: {t.suggestedMember}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveAiTasks}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Import & Populate These Tasks</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Create Group Project</h3>
              <button onClick={() => setShowCreateProject(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Campus Mobile App Design"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Team Member Emails (comma separated)</label>
                <input
                  type="text"
                  placeholder="sarah@univ.edu, john@univ.edu"
                  value={projMembersText}
                  onChange={(e) => setProjMembersText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={projDeadline}
                  onChange={(e) => setProjDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Goal Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of scope..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="px-4 py-2 border border-white/15 text-slate-300 text-xs font-semibold rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Add Project Task</h3>
              <button onClick={() => setShowCreateTask(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Database Schema"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Member</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={assignedMember}
                  onChange={(e) => setAssignedMember(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Task scope..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 border border-white/15 text-slate-300 text-xs font-semibold rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
