import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Play, Pause, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ChallengesScreen() {
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const challenges = useLiveQuery(() => db.challenges.toArray()) || [];

  const [type, setType] = useState('Daily Upload');
  const [duration, setDuration] = useState(50);
  const [customName, setCustomName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.challenges.add({
      id: crypto.randomUUID(),
      type,
      custom_name: type === 'Custom' ? customName : type,
      duration,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      created_at: new Date().toISOString()
    });
    setIsCreating(false);
  };

  const togglePause = async (id: string, currentStatus: string) => {
    await db.challenges.update(id, { status: currentStatus === 'active' ? 'paused' : 'active' });
  };

  const deleteChallenge = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await db.challenges.delete(deletingId);
      await db.checkins.where({ challenge_id: deletingId }).delete();
      await db.weekly_insights.where({ challenge_id: deletingId }).delete();
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 pt-12 max-w-md mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#111827] to-[#4B5563]">
          Challenges
        </h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-3 bg-[#6366F1] rounded-full text-white shadow-[0_8px_20px_rgb(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        {challenges.map(challenge => (
          <div key={challenge.id} className="bg-white border border-[#E5E7EB] p-6 rounded-[32px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-[#111827]">{challenge.custom_name || challenge.type}</h3>
              <span className={`text-xs px-3 py-1 rounded-xl font-bold ${challenge.status === 'active' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                {challenge.status}
              </span>
            </div>
            <div className="mt-6 flex justify-between items-end">
              <div className="flex flex-col gap-2 text-sm text-[#6B7280] font-medium">
                <div>🎯 {challenge.duration} Days Mission</div>
                <div>📅 Started {format(new Date(challenge.start_date), 'MMM d, yyyy')}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => togglePause(challenge.id, challenge.status)} 
                  className="p-3 bg-[#F8FAFC] rounded-[16px] hover:bg-[#F1F5F9] transition-colors border border-[#E5E7EB]"
                >
                  {challenge.status === 'active' ? <Pause className="w-5 h-5 text-[#F59E0B]" /> : <Play className="w-5 h-5 text-[#10B981]" />}
                </button>
                <button 
                  onClick={() => deleteChallenge(challenge.id)} 
                  className="p-3 bg-[#FEF2F2] rounded-[16px] hover:bg-[#FEE2E2] transition-colors border border-[#FECACA]"
                >
                  <Trash2 className="w-5 h-5 text-[#EF4444]" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {challenges.length === 0 && !isCreating && (
          <p className="text-center text-[#6B7280] mt-16 font-medium">No challenges yet. Tap + to start.</p>
        )}
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-2xl p-6 pt-12 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-[#111827]">New Mission</h2>
              <button onClick={() => setIsCreating(false)} className="p-2 bg-white rounded-full text-[#111827] shadow-sm border border-[#E5E7EB]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6 max-w-md mx-auto bg-white border border-[#E5E7EB] p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] font-bold uppercase tracking-wider">Type of Challenge</label>
                <select 
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 text-[#111827] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 font-medium"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>Daily Upload</option>
                  <option>Daily Gym</option>
                  <option>Daily Reading</option>
                  <option>Custom</option>
                </select>
              </div>

              {type === 'Custom' && (
                <div className="space-y-2">
                  <label className="text-sm text-[#6B7280] font-bold uppercase tracking-wider">Challenge Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. 10k Steps Every Day"
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 text-[#111827] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 font-medium"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-[#6B7280] font-bold uppercase tracking-wider">Duration (Days)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 75, 100, 150, 200].map(d => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-3 rounded-2xl font-bold transition-all ${duration === d ? 'bg-[#6366F1] text-white shadow-md scale-[1.02]' : 'bg-[#F8FAFC] text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F1F5F9]'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full mt-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgb(99,102,241,0.25)] hover:shadow-[0_12px_25px_rgb(99,102,241,0.35)]"
              >
                Begin Journey Srujan 🚀
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 w-full max-w-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-center"
            >
              <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-[#EF4444]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">Delete Challenge?</h3>
              <p className="text-[#6B7280] font-medium mb-8">This will permanently delete your streak, check-ins, and all associated analytics for this challenge.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-4 bg-[#F3F4F6] text-[#4B5563] font-bold rounded-2xl hover:bg-[#E5E7EB] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-[#EF4444] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(239,68,68,0.25)] hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
