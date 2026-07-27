import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarDays,
  Sparkles,
  BarChart3,
  Users,
  HelpCircle,
  FileText,
  Code2,
  User,
  LogOut,
  Clock,
  ShieldAlert,
  Compass,
  Globe,
  Bell,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab =
  | 'dashboard'
  | 'courses'
  | 'assignments'
  | 'study-planner'
  | 'study-assistant'
  | 'performance'
  | 'scheduler'
  | 'risks'
  | 'projects'
  | 'career'
  | 'portfolio'
  | 'ai-writing'
  | 'coding-assistant'
  | 'campus-help'
  | 'notifications'
  | 'profile';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { userProfile, logoutUser } = useAuth();

  const navGroups = [
    {
      group: null, // Top single item
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'ACADEMIC',
      items: [
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'assignments', label: 'Assignments', icon: CheckSquare },
        { id: 'study-planner', label: 'Study Planner', icon: CalendarDays },
        { id: 'study-assistant', label: 'AI Study Assistant', icon: Sparkles, badge: 'AI' },
        { id: 'performance', label: 'Performance', icon: BarChart3 }
      ]
    },
    {
      group: 'PRODUCTIVITY',
      items: [
        { id: 'scheduler', label: 'AI Scheduler', icon: Clock, badge: 'AI' },
        { id: 'risks', label: 'Risk Radar', icon: ShieldAlert, badge: 'AI' },
        { id: 'projects', label: 'Projects', icon: Users }
      ]
    },
    {
      group: 'CAREER',
      items: [
        { id: 'career', label: 'Career Roadmap', icon: Compass, badge: 'AI' },
        { id: 'portfolio', label: 'My Portfolio', icon: Globe, badge: 'AI' }
      ]
    },
    {
      group: 'TOOLS',
      items: [
        { id: 'ai-writing', label: 'AI Writing', icon: FileText, badge: 'AI' },
        { id: 'coding-assistant', label: 'Coding Assistant', icon: Code2, badge: 'AI' },
        { id: 'campus-help', label: 'Campus Help', icon: HelpCircle, badge: 'AI' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0d0e15] text-slate-100 flex flex-col z-50 transition-transform duration-200 ease-in-out border-r border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl text-sky-400 font-black">◈</span>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                CampusFlow <span className="text-purple-400 text-xs px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Student Operating System</p>
            </div>
          </div>
        </div>

        {/* Navigation Items Grouped */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.group && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as ActiveTab);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/30 text-white border border-indigo-500/50 shadow-md font-bold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-extrabold ${
                          isActive
                            ? 'bg-purple-500/40 text-purple-200 border border-purple-400/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/10 space-y-1 bg-black/20">
          <button
            onClick={() => {
              setActiveTab('notifications');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-white/20 shrink-0"
              />
            ) : (
              <User className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <div className="flex-1 text-left truncate">
              <p className="text-xs font-bold text-white truncate">
                {userProfile?.fullName || 'Student Profile'}
              </p>
            </div>
          </button>

          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

