import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { motion } from 'framer-motion';
import { Upload, Loader2, Sparkles, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function InsightsScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  
  const weeklyInsights = useLiveQuery(() => db.weekly_insights.toArray()) || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (!base64) return;

      try {
        const apiKey = localStorage.getItem('gemini_api_key') || '';
        const response = await fetch('/api/analyze-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            prompt: `Extract metrics from this social media analytics screenshot. Return JSON strictly following this format: {"views": 1000, "likes": 50, "comments": 10, "shares": 5, "retention_pct": 40.5, "follower_change": 15}. Do not include markdown codeblocks around the JSON. If a metric is missing, put 0.`,
            customKey: apiKey
          })
        });

        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        const jsonStr = data.text.replace(/```json/g, '').replace(/```/g, '');
        const metrics = JSON.parse(jsonStr);

        const newInsight = {
          id: crypto.randomUUID(),
          challenge_id: 'default',
          week_number: weeklyInsights.length + 1,
          ...metrics,
          week_start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          ai_summary: 'Processing complete.'
        };

        await db.weekly_insights.add({ ...newInsight, ai_coach_message: `Great job this week! Your views hit ${metrics.views}. Keep the momentum going! 🔥` });
        
        setIsUploading(false);
      } catch (err) {
        console.error(err);
        setAiMessage('Failed to analyze image. Please ensure your Gemini API key is set in Settings.');
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const chartData = weeklyInsights.map(wi => ({
    name: `Week ${wi.week_number}`,
    views: wi.views,
    likes: wi.likes
  }));

  return (
    <div className="p-6 pt-12 max-w-md mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-[#111827]">Weekly Growth 📈</h1>

      <div className="bg-white border border-[#E5E7EB] shadow-sm p-6 rounded-[32px] mb-8">
        <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#F59E0B]" /> Upload Analytics
        </h3>
        <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#CBD5E1] rounded-2xl cursor-pointer hover:bg-[#F8FAFC] hover:border-[#6366F1] transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-[#90939a] mb-2" />
            )}
            <p className="text-sm text-[#6B7280] font-medium">
              {isUploading ? 'AI is analyzing your growth...' : 'Upload screenshot for AI review'}
            </p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
        </label>
        {aiMessage && <p className="mt-4 text-sm text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] p-3 rounded-xl font-medium">{aiMessage}</p>}
      </div>

      {weeklyInsights.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 h-64 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-4">Total Views Trajectory</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} fontWeight={600} tickMargin={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={4} dot={{ fill: '#6366F1', r: 5, strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-[#EFF6FF] to-[#FAF5FF] rounded-[32px] p-6 border border-[#DBEAFE] shadow-sm">
            <h3 className="text-xs font-bold text-[#6366F1] mb-2 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Coach Notes
            </h3>
            <p className="text-[#1E40AF] font-medium text-lg leading-relaxed">
              {weeklyInsights[weeklyInsights.length - 1].ai_coach_message || "Keep pushing Srujan! Analytics uploaded."}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center text-[#6B7280] py-16 font-medium bg-white border border-[#E5E7EB] rounded-[32px] border-dashed">
          <BarChart3 className="w-12 h-12 mx-auto text-[#CBD5E1] mb-4" />
          No insights uploaded yet.<br/>Snap a screenshot of your analytics and drop it above.
        </div>
      )}
    </div>
  );
}
