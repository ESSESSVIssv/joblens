import React, { useState, useEffect } from 'react';
import JobMatcher from './components/JobMatcher';
import CareerDiscovery from './components/CareerDiscovery';
import JobTracker from './components/JobTracker';
import { useTrackedJobs } from './hooks/useTrackedJobs';
import { 
  Briefcase, 
  Compass, 
  LayoutList, 
  Sparkles, 
  Bell, 
  X, 
  DollarSign, 
  MapPin, 
  Building2, 
  CheckCircle, 
  Search, 
  ExternalLink,
  Info
} from 'lucide-react';

interface NotificationJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchRate: number; // ATS score
  description: string;
  requiredSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

const mockNotificationJobs: NotificationJob[] = [
  {
    id: "PM-TechCorp-1",
    title: "Product Manager",
    company: "TechCorp",
    location: "Remote, CA",
    salary: "$125,000 - $150,000",
    matchRate: 92,
    description: "Join our core team to define the customer experiences of our future AI-driven platforms. You will work side-by-side with agile engineering squads, design systems experts, and growth leads to craft robust roadmaps and execute seamless delivery.",
    requiredSkills: ["Product Strategy", "PRD Writing", "Data Analysis", "SQL"],
    missingSkills: ["A/B Testing Frameworks"],
    recommendations: ["Include metrics-driven outcomes in your prior experience statements", "Highlight prior cross-functional leadership and roadmap alignment achievements."]
  },
  {
    id: "FED-InnoSoft-1",
    title: "Frontend Developer",
    company: "InnoSoft",
    location: "San Francisco, CA (Hybrid)",
    salary: "$110,000 - $135,000",
    matchRate: 88,
    description: "Build state-of-the-art developer tools using modern standard React frameworks, styling with Tailwind CSS, and keeping code base highly performant with TypeScript. Collaborative, high-craft, and design-centric environment.",
    requiredSkills: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    missingSkills: ["Next.js", "Zustand (State Management)"],
    recommendations: ["Ensure your TypeScript skills highlight modern React 19 architecture", "Integrate responsive CSS layout examples into the projects section of your resume."]
  },
  {
    id: "UX-Globex-1",
    title: "UX Designer",
    company: "Globex",
    location: "New York, NY",
    salary: "$95,000 - $115,000",
    matchRate: 81,
    description: "Craft modern user experience structures, design responsive layouts in Figma, and run empirical user feedback interviews. Position requires strong typography sensibilities, modular layout understanding, and rapid-wireframing capabilities.",
    requiredSkills: ["Figma", "User Research", "Wireframing", "Typography Design"],
    missingSkills: ["Interactive Prototyping"],
    recommendations: ["Describe user testing processes in your project bullet points", "Add details on visual design systems and design token integration."]
  },
  {
    id: "DA-Acme-1",
    title: "Data Analyst",
    company: "Acme Systems",
    location: "Chicago, IL",
    salary: "$90,000 - $110,000",
    matchRate: 85,
    description: "Unlock actionable business insights using large-scale transaction databases. Build clean, insightful, interactive BI Dashboards with Tableau, craft complex SQL window functions, and automate data prep pipelines with Python.",
    requiredSkills: ["SQL", "Tableau", "Python", "Data Modeling"],
    missingSkills: ["Cloud Warehousing (BigQuery)"],
    recommendations: ["Describe your automated data-cleaning techniques for large, unorganized databases", "Highlight direct metrics showing the business or reporting impact your analyses achieved."]
  },
  {
    id: "GH-Nexus-1",
    title: "Growth Marketer",
    company: "Nexus Industries",
    location: "Austin, TX (Hybrid)",
    salary: "$100,000 - $125,000",
    matchRate: 77,
    description: "Lead customer acquisition funnels, refine search engine optimization tactics, deploy digital advertising assets, and analyze multi-channel cohort retention rates to maximize our applet customer activation rates.",
    requiredSkills: ["Cohort Analysis", "SEO", "Google Analytics", "A/B Testing"],
    missingSkills: ["Product Led Growth Strategy"],
    recommendations: ["Quantify user growth milestones in your summaries (e.g. '% increase in customer conversion')", "Include details regarding your coordination across copy, creative, and analytics teams."]
  },
  {
    id: "OM-Peak-1",
    title: "Operations Lead",
    company: "Peak Logistics",
    location: "Remote",
    salary: "$85,000 - $105,000",
    matchRate: 79,
    description: "Organize partner onboarding networks, streamline dispatch workflows, and coordinate regional logistic coordinators. Position focuses on efficiency improvement, cost-optimization, and high-quality partner satisfaction metrics.",
    requiredSkills: ["Operations Strategy", "Customer Success", "Project Coordination", "Excel"],
    missingSkills: ["CRM Automation Systems"],
    recommendations: ["Highlight proficiency with spreadsheets, pipeline tracking tools, and operations dashboards", "Detail partner-facing or vendor negotiation initiatives in your resume bullets."]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'match' | 'discover' | 'track'>('match');
  const [toastJob, setToastJob] = useState<NotificationJob | null>(null);
  const [selectedJob, setSelectedJob] = useState<NotificationJob | null>(null);
  const { addJob, trackedJobs } = useTrackedJobs();

  useEffect(() => {
    // Automatic background notifications have been removed as requested to elevate user trust.
  }, []);

  const handleSaveToTracker = (job: NotificationJob) => {
    addJob({
      id: `${job.title}-${job.company}-${Date.now()}`,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      link: `https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} jobs`)}`,
      salary: job.salary,
      status: 'Saved',
      dateAdded: new Date().toISOString()
    });

    // Close notifications and modal
    setSelectedJob(null);
    setToastJob(null);

    // Seamlessly navigate to Job Tracker
    setActiveTab('track');
  };

  const isJobAlreadyTracked = (jobName: string, companyName: string) => {
    return trackedJobs.some(j => j.jobTitle.toLowerCase() === jobName.toLowerCase() && j.company.toLowerCase() === companyName.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* Interactive Toast Notification (Click to open Quick View Modal) */}
      {toastJob && (
        <div 
          onClick={() => setSelectedJob(toastJob)}
          className="fixed bottom-6 right-6 bg-white border border-zinc-250/90 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-2xl p-4 pr-12 animate-in slide-in-from-bottom-5 fade-in duration-300 z-40 max-w-sm cursor-pointer hover:border-indigo-400 hover:shadow-[0_12px_40px_rgba(79,70,229,0.15)] transition-all group border-l-4 border-l-indigo-600"
          id="interactive-toast"
        >
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl shrink-0 group-hover:bg-indigo-200 transition-colors">
              <Bell className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                ⚡ Match Discovered 
                <span className="bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.2 rounded">
                  {toastJob.matchRate}% Score
                </span>
              </p>
              <h4 className="text-sm font-bold text-zinc-900 truncate leading-snug group-hover:text-indigo-600 transition-colors">
                {toastJob.title}
              </h4>
              <p className="text-xs text-zinc-500 font-semibold truncate mb-1">
                {toastJob.company}
              </p>
              <p className="text-[11px] text-zinc-400 font-medium line-clamp-2">
                {toastJob.description}
              </p>
              <div className="mt-2 text-[10px] text-indigo-600 font-bold flex items-center gap-1 group-hover:underline">
                Click to Quick View & Apply
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Stop opening the modal
              setToastJob(null);
            }}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 p-1 rounded-full transition-all"
            title="Dismiss Notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Central "Quick View" Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" id="quick-view-modal">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-2xl shrink-0">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none">{selectedJob.title}</h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ATS Match: {selectedJob.matchRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                    <span className="flex items-center gap-1 font-semibold text-zinc-700"><Building2 className="w-4 h-4 text-zinc-400" /> {selectedJob.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-zinc-400" /> {selectedJob.location}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200 p-1.5 rounded-full hover:bg-zinc-50 transition-colors"
                title="Close Quick View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Primary Stats Panel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl text-indigo-600 border border-indigo-150 shadow-sm">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">Estimated Salary</span>
                    <span className="text-sm font-bold text-zinc-950">{selectedJob.salary}</span>
                  </div>
                </div>

                <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-2xl flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl text-teal-600 border border-teal-150 shadow-sm">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 block">ATS Match Score</span>
                    <span className="text-sm font-bold text-zinc-950">{selectedJob.matchRate}% Excellent fit</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Job Description Context</h4>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal bg-zinc-50/50 border border-zinc-150 p-4 rounded-2xl">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills Analysis */}
              <div className="grid sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Matched Resume Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requiredSkills.map((sk, index) => (
                      <span key={index} className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Missing / Priority Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.missingSkills.map((sk, index) => (
                      <span key={index} className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-250 px-2.5 py-1 rounded-lg">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ATS Resume Optimizations */}
              <div className="bg-indigo-50/40 border border-indigo-100/60 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  ATS Match Recommendations
                </h4>
                <ul className="text-xs text-indigo-800 space-y-2">
                  {selectedJob.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white/75 p-2.5 rounded-xl border border-indigo-100">
                      <span className="text-indigo-600 font-extrabold select-none">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-wrap gap-3 justify-between items-center">
              <div>
                <span className="text-xs text-zinc-400 font-medium">Identify and apply for role</span>
              </div>
              <div className="flex gap-2">
                {/* Search In Any App Pathways */}
                <div className="dropdown relative group">
                  <button className="bg-white border border-zinc-250 hover:bg-zinc-100 text-zinc-700 px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 group cursor-pointer shadow-sm transition-all">
                    <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                    View Online
                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">Search</span>
                  </button>
                  {/* Fly-out custom search options across major platforms */}
                  <div className="hidden group-hover:block absolute bottom-full mb-1 right-0 bg-white border border-zinc-200 shadow-xl rounded-2xl p-3.5 w-80 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-left">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">Search on Major Portals</p>
                    <div className="grid grid-cols-2 gap-1 mb-3">
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${selectedJob.company} ${selectedJob.title} jobs`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-neutral-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Google Search</span>
                      </a>
                      <a 
                        href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(`${selectedJob.company} ${selectedJob.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-neutral-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>LinkedIn</span>
                      </a>
                      <a 
                        href={`https://www.indeed.com/jobs?q=${encodeURIComponent(`${selectedJob.company} ${selectedJob.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-neutral-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Indeed</span>
                      </a>
                      <a 
                        href={`https://www.ziprecruiter.com/candidate/search?search=${encodeURIComponent(`${selectedJob.company} ${selectedJob.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-neutral-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <span>ZipRecruiter</span>
                      </a>
                      <a 
                        href={`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(`${selectedJob.company} ${selectedJob.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-neutral-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>Glassdoor</span>
                      </a>
                      <a 
                        href={`https://wellfound.com/jobs?q=${encodeURIComponent(`${selectedJob.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-neutral-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Wellfound</span>
                      </a>
                    </div>

                    {/* any app custom lookup engine */}
                    <div className="border-t border-zinc-100 pt-3 mt-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 px-1">Custom Platform / Search App</label>
                      <div className="flex gap-1.5 p-1 bg-zinc-50 border border-zinc-200 rounded-xl" onClick={(e) => e.stopPropagation()}>
                        <input
                          id="custom-portal-input"
                          type="text"
                          placeholder="e.g. TotalJobs, Dice, Reed..."
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(`${val} ${selectedJob.company} ${selectedJob.title}`)}`, '_blank');
                              }
                            }
                          }}
                          className="w-full bg-transparent px-2 py-1 text-xs text-zinc-700 placeholder-zinc-400 outline-none focus:ring-0"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const el = document.getElementById('custom-portal-input') as HTMLInputElement | null;
                            if (el && el.value.trim()) {
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(`${el.value.trim()} ${selectedJob.company} ${selectedJob.title}`)}`, '_blank');
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-2xs font-bold shrink-0 transition-colors cursor-pointer"
                        >
                          Go
                        </button>
                      </div>
                      <span className="text-[9px] text-zinc-400 mt-1 block px-1 leading-normal font-medium">Type portal name & press Enter to launch search instantly</span>
                    </div>
                  </div>
                </div>

                {/* Instant Save and Monitor Trigger with Auto Navigation */}
                <button
                  onClick={() => handleSaveToTracker(selectedJob)}
                  disabled={isJobAlreadyTracked(selectedJob.title, selectedJob.company)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all focus:ring-4 focus:ring-indigo-100 ${
                    isJobAlreadyTracked(selectedJob.title, selectedJob.company)
                      ? 'bg-zinc-100 text-zinc-450 border border-zinc-200 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-750 text-white cursor-pointer active:scale-98'
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  {isJobAlreadyTracked(selectedJob.title, selectedJob.company) ? 'Saved' : 'One-Click Track'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/85 backdrop-blur-md sticky top-0 z-30 border-b border-zinc-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
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
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
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
