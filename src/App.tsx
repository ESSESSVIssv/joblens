import React, { useState, useEffect } from 'react';
import JobMatcher from './components/JobMatcher';
import CareerDiscovery from './components/CareerDiscovery';
import JobTracker from './components/JobTracker';
import { Briefcase, Compass, LayoutList, Sparkles, Github, Bell, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'match' | 'discover' | 'track'>('match');
  const [toast, setToast] = useState<{title: string, company: string} | null>(null);

  useEffect(() => {
    // Mock notification system
    const interval = setInterval(() => {
      const roles = ['Product Manager', 'Frontend Developer', 'UX Designer', 'Data Analyst', 'Growth Hacker', 'Operations Manager'];
      const companies = ['TechCorp', 'InnoSoft', 'Globex', 'Acme Systems', 'Nexus Industries'];
      
      setToast({
        title: roles[Math.floor(Math.random() * roles.length)],
        company: companies[Math.floor(Math.random() * companies.length)]
      });
      
      setTimeout(() => setToast(null), 5000);
    }, 45000); // Show a new job every 45 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-zinc-200 shadow-xl rounded-2xl p-4 pr-12 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-full mt-0.5">
              <Bell className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">New Job Discovered</p>
              <p className="text-sm font-semibold text-zinc-900">{toast.title}</p>
              <p className="text-xs text-zinc-500">{toast.company}</p>
            </div>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">JobLens</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Header Text */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Optimize your career path.
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
            Analyze your resume against precise job requirements, or let AI discover roles that perfectly align with your unique background and skills.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          <div className="inline-flex bg-zinc-100/80 p-1.5 rounded-full shadow-inner border border-zinc-200/50">
            <button
              onClick={() => setActiveTab('match')}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'match'
                  ? 'bg-white text-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Job Matcher
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'discover'
                  ? 'bg-white text-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              Career Discovery
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'track'
                  ? 'bg-white text-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              Job Tracker
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2rem] border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 mb-20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
           <div className="absolute -top-10 -right-10 p-8 opacity-[0.02] pointer-events-none rotate-12">
              <Sparkles className="w-96 h-96" />
           </div>
           <div className="relative z-10">
             {activeTab === 'match' ? <JobMatcher /> : activeTab === 'discover' ? <CareerDiscovery /> : <JobTracker />}
           </div>
        </div>
      </main>
    </div>
  );
}
