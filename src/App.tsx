import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Trophy, BarChart3, Settings, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

import HomeScreen from './screens/HomeScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import InsightsScreen from './screens/InsightsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import SettingsScreen from './screens/SettingsScreen';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function Navigation() {
  const location = useLocation();
  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Challenges', path: '/challenges', icon: Target },
    { name: 'Insights', path: '/insights', icon: BarChart3 },
    { name: 'Badges', path: '/achievements', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-white/80 backdrop-blur-2xl border border-[#E5E7EB] rounded-3xl p-2 max-w-md mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={cn(
                "relative flex flex-col items-center gap-1 transition-colors",
                 isActive ? "text-[#6366F1]" : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              {tab.name === 'Home' && isActive ? (
                 <div className="w-14 h-14 absolute -top-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 border-4 border-[#F8FAFC]">
                   <tab.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                 </div>
              ) : (
                <tab.icon
                  className="w-6 h-6 transition-transform duration-300 active:scale-95"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] selection:bg-[#6366F1]/20 font-sans pb-24 relative overflow-hidden">
        {/* Soft light theme background mesh */}
        <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.07] rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#6366F1] opacity-[0.07] rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 h-full">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/challenges" element={<ChallengesScreen />} />
            <Route path="/insights" element={<InsightsScreen />} />
            <Route path="/achievements" element={<AchievementsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}
