import React, { useState } from 'react';
import {
  X,
  Palette,
  Bell,
  Sparkles,
  Moon,
  Sun,
  Heart,
  Volume2,
  Image as ImageIcon,
  Flame,
  User,
  Shield,
  Trash2,
  QrCode,
  Upload,
  Check,
} from 'lucide-react';
import { APP_ICONS, NOTIFICATION_SOUNDS, CHAT_BACKGROUNDS } from '../utils/filters';
import { UserProfile, NotificationSound } from '../types';
import { playHaptic, playNotificationSound, playBubblePopSound, playSoftMeowSound } from '../utils/audio';

interface SettingsViewProps {
  user: UserProfile;
  partner: UserProfile;
  selectedIcon: string;
  selectedSound: NotificationSound;
  selectedBg: string;
  isDark: boolean;
  meowStreak: number;
  onUpdateIcon: (iconId: string) => void;
  onUpdateSound: (soundId: NotificationSound) => void;
  onUpdateBg: (bgId: string) => void;
  onToggleDark: () => void;
  onUpdateUserNickname: (nickname: string) => void;
  onUpdatePartnerNickname: (nickname: string) => void;
  onOpenInvite: () => void;
  onClose: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  partner,
  selectedIcon,
  selectedSound,
  selectedBg,
  isDark,
  meowStreak,
  onUpdateIcon,
  onUpdateSound,
  onUpdateBg,
  onToggleDark,
  onUpdateUserNickname,
  onUpdatePartnerNickname,
  onOpenInvite,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'customization' | 'profile' | 'sound' | 'secret_box'>('customization');
  const [editUserNick, setEditUserNick] = useState(user.nickname);
  const [editPartnerNick, setEditPartnerNick] = useState(partner.nickname);
  const [customBgUploaded, setCustomBgUploaded] = useState<string | null>(null);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomBgUploaded(result);
        onUpdateBg(`url(${result})`);
        playHaptic('medium');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestSound = (soundId: NotificationSound) => {
    playNotificationSound(soundId);
    onUpdateSound(soundId);
  };

  const saveNicknames = () => {
    playHaptic('light');
    playBubblePopSound();
    onUpdateUserNickname(editUserNick.trim() || user.name);
    onUpdatePartnerNickname(editPartnerNick.trim() || partner.name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md max-h-[90vh] rounded-3xl p-6 shadow-2xl overflow-y-auto no-scrollbar flex flex-col justify-between ${
        isDark ? 'bg-slate-900 border border-slate-700/60 text-white' : 'bg-white/95 border border-sky-200/80 text-slate-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-pink-400 to-indigo-400 p-0.5 shadow">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center text-xl ${
                isDark ? 'bg-slate-900' : 'bg-white'
              }`}>
                🐾
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Meow Private Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shared only between you and {partner.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHaptic('light');
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl my-4 text-xs font-semibold">
          <button
            onClick={() => {
              playHaptic('light');
              setActiveTab('customization');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'customization'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Aesthetics
          </button>
          <button
            onClick={() => {
              playHaptic('light');
              setActiveTab('sound');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'sound'
                ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Meow Alerts
          </button>
          <button
            onClick={() => {
              playHaptic('light');
              setActiveTab('profile');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Nicknames
          </button>
          <button
            onClick={() => {
              playHaptic('light');
              setActiveTab('secret_box');
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'secret_box'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Streak
          </button>
        </div>

        {/* Tab 1: Aesthetics (App Icons & Chat Backgrounds & Dark Mode) */}
        {activeTab === 'customization' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    {isDark ? 'Velvet Night Theme' : 'Pastel Cloud Theme'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Preserves soft light blue glowing accents
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  playHaptic('medium');
                  onToggleDark();
                }}
                className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
                  isDark ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isDark ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* App Icon Chooser */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Custom App Icon
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Select your favorite cute kitten emblem
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {APP_ICONS.map(icon => {
                  const isSelected = selectedIcon === icon.id;
                  return (
                    <button
                      key={icon.id}
                      onClick={() => {
                        playHaptic('light');
                        playBubblePopSound();
                        onUpdateIcon(icon.id);
                      }}
                      className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/40 shadow-sm ring-2 ring-sky-400/40 scale-105'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm mb-1"
                        style={{ backgroundColor: icon.color }}
                      >
                        <span className="text-lg">🐱</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                        {icon.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Background Customizer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chat Background Atmosphere
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CHAT_BACKGROUNDS.map(bg => {
                  const isSelected = selectedBg === bg.value;
                  return (
                    <button
                      key={bg.id}
                      onClick={() => {
                        playHaptic('light');
                        playBubblePopSound();
                        onUpdateBg(bg.value);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-pink-400 bg-pink-50/60 dark:bg-pink-950/40 ring-1 ring-pink-400'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {bg.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-500" />}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {bg.type === 'gradient' ? 'Dynamic flow' : 'Art style'}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Upload Personal Photo Background */}
              <div className="mt-3">
                <label className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-sky-300 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-300">
                    Upload Custom Chat Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Notification & Meow Alert Sounds */}
        {activeTab === 'sound' && (
          <div className="space-y-3 animate-in fade-in">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Whenever {partner.nickname} sends a snap, voice note, or calls, Meow plays your chosen soft sound.
            </p>

            <div className="space-y-2">
              {NOTIFICATION_SOUNDS.map(snd => {
                const isSelected = selectedSound === snd.id;
                return (
                  <button
                    key={snd.id}
                    onClick={() => handleTestSound(snd.id as NotificationSound)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/40 ring-1 ring-pink-400'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {snd.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {snd.desc}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                      Play ▶
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Intimate Nicknames & Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Your Nickname
              </label>
              <input
                type="text"
                value={editUserNick}
                onChange={e => setEditUserNick(e.target.value)}
                maxLength={24}
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Partner's Secret Nickname
              </label>
              <input
                type="text"
                value={editPartnerNick}
                onChange={e => setEditPartnerNick(e.target.value)}
                maxLength={24}
                className={`w-full px-4 py-2.5 rounded-2xl border text-sm font-medium focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <button
              onClick={saveNicknames}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-pink-400 text-white font-semibold text-xs shadow-md hover:scale-[1.02] active:scale-98 transition-all"
            >
              Save Nicknames ✨
            </button>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  onClose();
                  onOpenInvite();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <QrCode className="w-4 h-4 text-sky-500" />
                <span>Show Secret Invite QR & Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Meow Streak & Intimate Memories */}
        {activeTab === 'secret_box' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Streak card */}
            <div className="p-5 rounded-3xl bg-gradient-to-tr from-amber-400/20 via-pink-400/20 to-sky-400/20 border border-amber-300/40 dark:border-amber-500/30 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-md text-3xl mb-2 animate-bounce">
                🔥🐾
              </div>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">
                {meowStreak} Days Streak
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs mx-auto">
                You and {partner.nickname} have shared intimate snaps every single day!
              </p>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-slate-800/50 border border-sky-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-300">
                <Shield className="w-4 h-4" /> 100% Private 1-on-1 Vault
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                No third parties, public profiles, feeds, or advertisements. Only the two of you exist here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
