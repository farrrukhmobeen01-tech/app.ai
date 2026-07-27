import React from 'react';
import { Palette, Check, X, Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d0e15] border border-white/15 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Theme & Visual Styling</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Choose Your Aesthetic Workspace</h2>
          <p className="text-xs text-slate-400">
            Select a professionally crafted color scheme tailored for university study environments.
          </p>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/20 shadow-xl'
                    : 'border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {theme.name}
                    </span>
                    {isSelected ? (
                      <span className="p-1 bg-indigo-500 text-white rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/40 border border-white/5 flex items-center gap-1">
                        {theme.category === 'Dark' ? <Moon className="w-3 h-3 text-slate-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
                        {theme.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{theme.tagline}</p>
                </div>

                {/* Color Swatch Bar */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: theme.colors.bg }}
                    title="Background"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: theme.colors.card }}
                    title="Card Surface"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Accent Color"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: theme.colors.border }}
                    title="Border Accent"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
