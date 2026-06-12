import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Save, Server, Key, Bell, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsScreen() {
  const [geminiKey, setGeminiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnon, setSupabaseAnon] = useState('');
  const [saved, setSaved] = useState(false);
  const [notifPerm, setNotifPerm] = useState<string>('default');

  useEffect(() => {
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setSupabaseUrl(localStorage.getItem('supabase_url') || '');
    setSupabaseAnon(localStorage.getItem('supabase_anon_key') || '');
    if ('Notification' in window) {
      setNotifPerm(Notification.permission);
    }
  }, []);

  const requestNotif = async () => {
    try {
      if (!('Notification' in window)) {
        alert("Notifications are not supported in this browser.");
        return;
      }
      const perm = await Notification.requestPermission();
      setNotifPerm(perm);
      if (perm === 'granted') {
        new Notification("Notifications Enabled!", {
          body: "Srujan's Challenge Tracker is ready to push."
        });
      } else {
        alert("Notification permission denied or blocked by the preview environment. Please open the app in a new browser tab to enable.");
      }
    } catch (e) {
      alert("Error requesting notifications. Please open the app in a new tab to enable them.");
    }
  };

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('supabase_url', supabaseUrl);
    localStorage.setItem('supabase_anon_key', supabaseAnon);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = {
      challenges: await db.challenges.toArray(),
      checkins: await db.checkins.toArray(),
      weekly_insights: await db.weekly_insights.toArray()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'srujan_tracker_backup.json';
    a.click();
  };

  return (
    <div className="p-6 pt-12 max-w-md mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-[#111827]">Settings ⚙️</h1>

      <div className="space-y-6">
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-6 text-[#111827]">
            <Key className="w-5 h-5 text-[#F59E0B]" /> AI Configuration
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Gemini API Key (Vision)</label>
            <input 
              type="password"
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 text-[#111827] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none transition-all font-medium"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIza..."
            />
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-[#111827]">
            <Bell className="w-5 h-5 text-[#10B981]" /> Push Notifications
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#111827] font-bold text-sm">Daily Reminders</p>
              <p className="text-xs text-[#6B7280] font-medium mt-1">Never break the streak</p>
            </div>
            <button 
              onClick={requestNotif}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${notifPerm === 'granted' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#111827] text-white hover:bg-gray-800'}`}
            >
              {notifPerm === 'granted' ? 'Enabled' : 'Enable'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 mb-6 text-[#111827]">
            <Server className="w-5 h-5 text-[#3B82F6]" /> Cloud Sync (Supabase)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Project URL</label>
              <input 
                type="text"
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 text-[#111827] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none mt-1 transition-all font-medium"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Anon Key</label>
              <input 
                type="password"
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 text-[#111827] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none mt-1 transition-all font-medium"
                value={supabaseAnon}
                onChange={e => setSupabaseAnon(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] shadow-[0_8px_20px_rgb(99,102,241,0.25)] rounded-2xl font-bold flex items-center justify-center gap-2 text-white transition-all active:scale-95"
        >
          {saved ? <span className="text-white drop-shadow-md">Configuration Saved!</span> : <><Save className="w-5 h-5" /> Save Configuration</>}
        </button>

        <button 
          onClick={handleExport}
          className="w-full py-4 bg-white border border-[#E5E7EB] shadow-sm rounded-2xl font-bold flex items-center justify-center gap-2 text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          <Database className="w-5 h-5" /> Export DB (JSON)
        </button>
      </div>
    </div>
  );
}
