import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const MILESTONES = [
  { days: 1, name: "The seed is planted", emoji: "🌱" },
  { days: 7, name: "Bronze Streak", emoji: "🥉" },
  { days: 14, name: "Lightning Badge", emoji: "⚡" },
  { days: 21, name: "Silver Streak", emoji: "🥈" },
  { days: 30, name: "30-Day Medal", emoji: "🏅" },
  { days: 50, name: "Gold Medal", emoji: "🥇" },
  { days: 75, name: "Diamond Badge", emoji: "💎" },
  { days: 100, name: "Century Crown", emoji: "👑" },
  { days: 150, name: "Elite Trident", emoji: "🔱" },
  { days: 200, name: "Legend Star", emoji: "🌟" }
];

export default function AchievementsScreen() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const checkins = useLiveQuery(() => db.checkins.toArray()) || [];

  const topStreak = checkins.length > 0 ? Array.from(new Set(checkins.map(c => c.date))).length : 0;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#F8FAFC', scale: 2 });
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = `Srujan_Challenge_${new Date().getTime()}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  };

  return (
    <div className="p-6 pt-12 max-w-md mx-auto min-h-screen">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D97706] to-[#F59E0B] mb-8">
        Achievements 🏆
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-12">
        {MILESTONES.map((m, idx) => {
          const unlocked = topStreak >= m.days;
          return (
            <motion.div 
              key={m.days}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-[24px] border flex flex-col items-center justify-center text-center transition-all ${
                unlocked 
                  ? 'bg-white border-[#FDE68A] shadow-[0_8px_20px_rgb(245,158,11,0.1)]' 
                  : 'bg-[#F1F5F9] border-[#E5E7EB] opacity-60 grayscale'
              }`}
            >
              <div className={`text-4xl mb-3 ${unlocked ? 'drop-shadow-md' : ''}`}>{m.emoji}</div>
              <h4 className={`font-bold text-sm ${unlocked ? 'text-[#111827]' : 'text-[#6B7280]'}`}>{m.name}</h4>
              <p className="text-xs text-[#9CA3AF] mt-1 font-medium">Day {m.days}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-4 flex justify-between items-end">
        <h3 className="font-bold text-xl text-[#111827]">Progress Card</h3>
        <button 
          onClick={handleDownload} 
          disabled={downloading}
          className="flex items-center gap-2 text-sm bg-white border border-[#E5E7EB] px-4 py-2 rounded-full hover:bg-[#F8FAFC] shadow-sm font-bold text-[#111827] transition-all"
        >
          {downloading ? "Generating..." : <><Download className="w-4 h-4" /> Save Tag</>}
        </button>
      </div>

      <div 
        ref={cardRef} 
        className="p-8 rounded-[32px] bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC] border border-[#E5E7EB] shadow-[0_20px_50px_rgb(0,0,0,0.06)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-full blur-[40px] -z-10" />
        
        <h2 className="text-2xl font-black mb-1 text-[#111827]">Srujan's Journey</h2>
        <p className="text-[#F59E0B] font-bold text-xs uppercase tracking-widest mb-8">Never Break Complete</p>
        
        <div className="flex items-end gap-2 mb-2">
          <span className="text-6xl font-black text-[#111827]">{topStreak}</span>
          <span className="text-xl text-[#6B7280] font-bold mb-1">Days</span>
          <span className="text-4xl drop-shadow-md mb-2">🔥</span>
        </div>
        
        <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden mb-8 border border-[#E5E7EB]">
          <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full shadow-inner" style={{ width: `${Math.min((topStreak/50)*100, 100)}%` }} />
        </div>

        <div className="text-[10px] text-[#9CA3AF] font-bold tracking-widest uppercase">
          Srujan's Challenge Tracker • Certified Profile
        </div>
      </div>
    </div>
  );
}
