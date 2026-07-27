import React from 'react';
import { Menu, Plus, GraduationCap, School, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onQuickAddCourse?: () => void;
  onQuickAddAssignment?: () => void;
  onOpenProfile?: () => void;
  onOpenThemeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onQuickAddCourse,
  onQuickAddAssignment,
  onOpenProfile,
  onOpenThemeModal
}) => {
  const { userProfile } = useAuth();
  const { activeThemeOption } = useTheme();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Academic Dashboard';
      case 'courses':
        return 'Course Management';
      case 'assignments':
        return 'Assignments & Tasks';
      case 'study-planner':
        return 'AI Study Planner';
      case 'scheduler':
        return 'AI Auto-Scheduler';
      case 'risks':
        return 'Academic Risk Radar';
      case 'study-assistant':
        return 'AI Study Assistant';
      case 'performance':
        return 'Academic Performance';
      case 'projects':
        return 'Group Projects';
      case 'career':
        return 'AI Career Roadmap';
      case 'portfolio':
        return 'AI Resume Portfolio';
      case 'campus-help':
        return 'Campus Help Center';
      case 'ai-writing':
        return 'AI Writing Assistant';
      case 'coding-assistant':
        return 'AI Coding Assistant';
      case 'notifications':
        return 'Notifications & Reminders';
      case 'profile':
        return 'Profile & Settings';
      default:
        return 'CampusFlow AI';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0c]/70 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-lg text-slate-100">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{getTitle()}</h2>
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-300 hover:text-white group transition-colors cursor-pointer text-left"
            title="Click to view profile"
          >
            <School className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
              {!userProfile?.university || userProfile.university.toLowerCase().includes('stanford')
                ? 'Bahria University'
                : userProfile.university}
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onQuickAddAssignment && (
          <button
            onClick={onQuickAddAssignment}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 border border-indigo-400/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        )}

        {onQuickAddCourse && (
          <button
            onClick={onQuickAddCourse}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-slate-100 rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        )}

        {/* Theme Palette Button */}
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            title={`Current Theme: ${activeThemeOption.name}`}
            className="p-2 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-xl border border-white/10 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Palette className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Theme</span>
          </button>
        )}

        {/* User Badge / Profile Button */}
        <button
          onClick={onOpenProfile}
          title="Click to view & edit Profile"
          className="relative group focus:outline-none"
        >
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border-2 border-indigo-400/80 shadow-md ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white font-bold text-sm flex items-center justify-center border border-white/20 shadow-md ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform">
              {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
