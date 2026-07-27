import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Trash2,
  Check,
  Send,
  ShieldAlert,
  Calendar,
  Layers,
  Inbox,
  Filter
} from 'lucide-react';
import {
  NotificationPreference,
  InAppNotification
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  subscribeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteInAppNotification,
  addInAppNotification
} from '../lib/firestoreService';

export const NotificationsView: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const userId = currentUser?.uid || 'demo-student-12345';
  const userEmail = currentUser?.email || userProfile?.email || 'student@university.edu';

  const [prefs, setPrefs] = useState<NotificationPreference>({
    emailNotificationsEnabled: true,
    quizAlerts: true,
    assignmentAlerts: true,
    examAlerts: true,
    projectAlerts: true,
    studySessionAlerts: true,
    careerAlerts: false,
    reminderLeadTimeHours: 24,
    userEmail
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [testSent, setTestSent] = useState<boolean>(false);

  useEffect(() => {
    getNotificationPreferences(userId).then((data) => {
      if (data) setPrefs(data);
    });

    const unsub = subscribeNotifications(userId, (data) => {
      setNotifications(data);
    });

    return () => unsub();
  }, [userId]);

  const handleSavePrefs = async () => {
    try {
      setLoading(true);
      await saveNotificationPreferences(userId, { ...prefs, userEmail });
      alert('Notification preferences saved successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestSent(true);
    // Add sample in-app notification to simulate alert system dispatch
    await addInAppNotification(userId, {
      title: 'Sample Email Reminder Dispatched',
      message: `Test email alert successfully sent to ${userEmail} (Lead time: ${prefs.reminderLeadTimeHours}h before deadlines).`,
      type: 'exam',
      date: new Date().toISOString(),
      read: false
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleMarkRead = async (notifId: string) => {
    await markNotificationRead(userId, notifId);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(userId, notifications);
  };

  const handleDelete = async (notifId: string) => {
    await deleteInAppNotification(userId, notifId);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-slate-900/80 p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5" />
            <span>Smart Reminder & Notification Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Automated Deadline & Exam Alerts</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Configure automated email notifications and track real-time academic alerts for upcoming exams, assignment deadlines, and study sessions.
          </p>
        </div>

        <button
          onClick={handleSendTestEmail}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg border border-amber-400/30 inline-flex items-center gap-2 transition-all relative z-10 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>{testSent ? 'Test Alert Dispatched!' : 'Send Test Email Alert'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Notification Preferences */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Alert Preferences</span>
              </h3>
              <button
                onClick={handleSavePrefs}
                disabled={loading}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save
              </button>
            </div>

            {/* Main Email Toggle */}
            <div className="p-3 bg-black/30 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Email Notifications</span>
                <span className="text-[10px] text-slate-400">{userEmail}</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailNotificationsEnabled}
                onChange={(e) => setPrefs({ ...prefs, emailNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </div>

            {/* Lead Time Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reminder Lead Time</label>
              <select
                value={prefs.reminderLeadTimeHours}
                onChange={(e) => setPrefs({ ...prefs, reminderLeadTimeHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#12131c] border border-white/15 rounded-xl text-xs text-white"
              >
                <option value={2}>2 Hours Before Deadline</option>
                <option value={12}>12 Hours Before Deadline</option>
                <option value={24}>24 Hours Before (1 Day)</option>
                <option value={48}>48 Hours Before (2 Days)</option>
              </select>
            </div>

            {/* Category Toggles */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 block">Alert Categories</span>

              {[
                { key: 'examAlerts', label: 'Exam & Midterm Alerts' },
                { key: 'assignmentAlerts', label: 'Assignment Due Reminders' },
                { key: 'quizAlerts', label: 'Quiz Notifications' },
                { key: 'projectAlerts', label: 'Group Project Milestones' },
                { key: 'studySessionAlerts', label: 'Scheduled Study Session Starts' }
              ].map((cat) => (
                <label key={cat.key} className="flex items-center justify-between p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-200 cursor-pointer">
                  <span>{cat.label}</span>
                  <input
                    type="checkbox"
                    checked={(prefs as any)[cat.key]}
                    onChange={(e) => setPrefs({ ...prefs, [cat.key]: e.target.checked })}
                    className="w-3.5 h-3.5 accent-amber-500 rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: In-App Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-400" />
                <span>Notification Center</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full">
                    {unreadCount} Unread
                  </span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                disabled={notifications.length === 0}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Mark All Read
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'exam', 'risk', 'study', 'general'].map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === ft ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {ft}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center space-y-3 max-w-md mx-auto">
                <Bell className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
                <h3 className="text-base font-bold text-white">No notifications yet</h3>
                <p className="text-xs text-slate-400">
                  Upcoming assignment deadlines, exam alerts, and study session reminders will appear here in real-time.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = notif.read;

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      isRead
                        ? 'bg-white/5 border-white/10 opacity-70'
                        : 'bg-amber-950/20 border-amber-500/30 shadow-lg shadow-amber-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isRead && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-1 text-slate-400 hover:text-amber-300"
                            title="Mark as Read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="font-mono">{new Date(notif.date).toLocaleString()}</span>
                      <span className="uppercase font-bold text-amber-400">{notif.type}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
