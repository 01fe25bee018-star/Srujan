import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format, differenceInDays, isSameDay, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Target, Shield, Check } from 'lucide-react';

export default function HomeScreen() {
  const challenges = useLiveQuery(() => db.challenges.where('status').equals('active').toArray()) || [];
  const allCheckins = useLiveQuery(() => db.checkins.toArray()) || [];

  const timeOfDay = new Date().getHours();
  const greetingText = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';

  const handleCheckIn = async (challengeId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = await db.checkins.where({ challenge_id: challengeId, date: today }).first();
    
    if (!existing) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#F59E0B', '#10B981']
      });
      await db.checkins.add({
        id: crypto.randomUUID(),
        challenge_id: challengeId,
        date: today,
        shield_used: false,
        created_at: new Date().toISOString(),
        synced: false
      });
    }
  };

  const getStreak = (challengeId: string) => {
    const checkinsForChallenge = allCheckins.filter(c => c.challenge_id === challengeId).sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const todayDate = new Date();
    // Simplified streak calc
    for (let i = 0; i < checkinsForChallenge.length; i++) {
      const cDate = new Date(checkinsForChallenge[i].date);
      const diff = differenceInDays(todayDate, cDate);
      if (diff === streak || diff === streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="p-6 pt-12 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
          {greetingText}, Srujan 👋
        </h1>
        <p className="text-[#6B7280] mt-2 font-medium">Every day compounds. Keep pushing.</p>
      </motion.div>

      <div className="mt-8 space-y-6">
        {challenges.length === 0 ? (
          <div className="p-8 bg-white border border-[#E5E7EB] rounded-[32px] text-center shadow-sm">
            <Target className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#111827] mb-2">No active challenges</h3>
            <p className="text-[#6B7280] mb-6">Start a new journey today to build discipline.</p>
          </div>
        ) : (
          challenges.map((challenge, idx) => {
            const streak = getStreak(challenge.id);
            const today = format(new Date(), 'yyyy-MM-dd');
            const hasCheckedInToday = allCheckins.some(c => c.challenge_id === challenge.id && c.date === today);
            
            const pctComplete = Math.min(Math.round((streak / challenge.duration) * 100), 100);

            return (
              <motion.div 
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-[#E5E7EB] p-6 rounded-[32px] flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#F3F4F6]" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * pctComplete / 100)} className="text-[#6366F1]" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#111827]">
                      {pctComplete}%
                    </div>
                  </div>
                  <div className="bg-[#FEF3C7] text-[#D97706] p-2 rounded-xl border border-[#FDE68A] text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> 1 Shield
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-[#111827]">{challenge.custom_name || challenge.type}</h3>
                  <p className="text-[#6B7280] font-medium">{challenge.duration} Days Challenge</p>
                  
                  <div className="flex items-center gap-2 mt-4 ml-1">
                    <span className={`text-4xl drop-shadow-md ${streak >= 50 ? 'animate-pulse' : ''} ${streak >= 21 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>🔥</span>
                    <div>
                      <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-widest">Current Streak</p>
                      <p className="text-xl font-mono font-bold text-[#D97706]">{streak} DAYS</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleCheckIn(challenge.id)}
                    disabled={hasCheckedInToday}
                    className={`w-full py-4 rounded-[20px] font-bold text-lg transition-all ${
                      hasCheckedInToday 
                        ? 'bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_8px_20px_rgb(99,102,241,0.25)] hover:shadow-[0_12px_25px_rgb(99,102,241,0.35)] active:scale-[0.98]'
                    }`}
                  >
                    {hasCheckedInToday ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-[#10B981]" /> Already Logged Today
                      </span>
                    ) : (
                      '✅ Mark Today as Done'
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
