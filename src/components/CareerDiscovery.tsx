import React, { useState } from 'react';
import { DiscoveryResponse } from '../types';
import { Loader2, AlertCircle, Compass, Search, UserCircle, Briefcase, Award, Upload, FileText, ExternalLink, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTrackedJobs } from '../hooks/useTrackedJobs';

export default function CareerDiscovery() {
  const [resumeText, setResumeText] = useState('');
  const [resumePdf, setResumePdf] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCoverLetter, setExpandedCoverLetter] = useState<number | null>(null);

  const { trackedJobs, addJob, removeJob } = useTrackedJobs();
  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'High' | 'Moderate' | 'Stretch'>('All');
  const [visibleCount, setVisibleCount] = useState(15);

  const togglePreference = (type: string) => {
    setPreferences(prev => 
      prev.includes(type) ? prev.filter(p => p !== type) : [...prev, type]
    );
  };

  const isJobTracked = (jobTitle: string, company: string): boolean => {
    return trackedJobs.some(j => j.id === `${jobTitle}-${company}`);
  };

  const getTrackedStatus = (jobTitle: string, company: string): string | null => {
    const job = trackedJobs.find(j => j.id === `${jobTitle}-${company}`);
    return job ? job.status : null;
  };

  const handleToggleTrack = (job: any) => {
    const id = `${job.jobTitle}-${job.company}`;
    if (isJobTracked(job.jobTitle, job.company)) {
      removeJob(id);
    } else {
      addJob({
        id,
        jobTitle: job.jobTitle,
        company: job.company,
        location: job.location,
        link: job.searchQueryLink,
        salary: job.salary,
        status: 'Saved',
        dateAdded: new Date().toISOString()
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported.');
        return;
      }
      setPdfName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setResumePdf(base64);
      };
      reader.readAsDataURL(file);
    }
  };
  const [error, setError] = useState('');
  const [result, setResult] = useState<DiscoveryResponse | null>(null);

  const handleDiscover = async () => {
    if (!resumeText.trim() && !resumePdf) {
      setError('Please provide your resume (Text or PDF).');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/job-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            resumeText,
            resumePdf,
            jobTypePreference: preferences.join(', '),
            userSelectedRoles: [] // can easily extend with an input array in the future
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze career options.');
      }

      setResult(data as DiscoveryResponse);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-zinc-800">Resume / CV</label>
          <label className="text-xs text-zinc-600 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full cursor-pointer font-medium transition-colors flex items-center shadow-sm">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload PDF
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        {pdfName ? (
          <div className="w-full h-[240px] p-6 flex flex-col items-center justify-center bg-zinc-50 border-2 border-zinc-200 border-dashed rounded-2xl shadow-inner transition-colors hover:border-zinc-300">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <FileText className="w-8 h-8 text-zinc-700" />
            </div>
            <span className="text-sm font-semibold text-zinc-800 truncate max-w-[80%]">{pdfName}</span>
            <button 
              onClick={() => { setPdfName(''); setResumePdf(''); setResumeText(''); }} 
              className="mt-4 text-xs bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 px-4 py-2 rounded-full font-medium shadow-sm transition-all"
            >
              Remove PDF
            </button>
          </div>
        ) : (
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here, or upload a PDF to discover the best fitting roles..."
            className="w-full h-[240px] p-5 text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-zinc-100 focus:border-zinc-400 focus:outline-none resize-none transition-all shadow-inner leading-relaxed"
          />
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-zinc-800">Target Role Type (Optional)</label>
        <div className="flex flex-wrap gap-2">
          {['Full-Time', 'Internship', 'Coding', 'Non-Coding', 'Remote'].map((type) => (
            <button
              key={type}
              onClick={() => togglePreference(type)}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                preferences.includes(type)
                  ? 'border-indigo-600 bg-indigo-600 focus:ring-4 focus:ring-indigo-100 text-white shadow-md'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={handleDiscover}
          disabled={loading || (!resumeText && !resumePdf)}
          className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Profile...
            </>
          ) : (
            <>
              <Compass className="w-5 h-5" />
              Discover Career Path
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-8 pt-8 border-t border-neutral-100 animate-in fade-in duration-700 delay-100">
          
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
            <div className="flex items-start gap-4 mb-4">
              <UserCircle className="w-10 h-10 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  {result.profile?.name || "Candidate Profile"}
                </h3>
                <p className="text-neutral-700 text-sm leading-relaxed">{result.profile?.summary}</p>
              </div>
            </div>
            
            <div className="mt-6 grid md:grid-cols-2 gap-6 bg-white/50 p-4 rounded-xl border border-indigo-100/50">
               <div>
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Education & Experience</h4>
                  <ul className="text-sm text-neutral-700 space-y-1">
                    {result.profile?.education?.slice(0, 2).map((edu, i) => <li key={i} className="flex items-start gap-2"><span className="text-indigo-400">•</span> {edu}</li>)}
                    {result.profile?.experience?.slice(0, 2).map((exp, i) => <li key={i} className="flex items-start gap-2"><span className="text-indigo-400">•</span> {exp}</li>)}
                    {result.profile?.internships?.slice(0, 2).map((int, i) => <li key={i} className="flex items-start gap-2"><span className="text-indigo-400">•</span> {int} (Internship)</li>)}
                  </ul>
               </div>
               <div>
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Top Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.profile?.skills?.slice(0, 8).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-800 text-[10px] font-bold uppercase rounded shadow-sm">
                        {skill}
                      </span>
                    ))}
                    {result.profile?.technicalSkills?.slice(0, 8).map((skill, i) => (
                      <span key={`tech-${i}`} className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-white text-[10px] font-bold uppercase rounded shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {(() => {
            const filteredJobs = result.jobs?.filter(job => {
              const catMatch = activeCategory === 'All' || 
                (activeCategory === 'High' && job.category.includes('High Match')) ||
                (activeCategory === 'Moderate' && job.category.includes('Moderate')) ||
                (activeCategory === 'Stretch' && job.category.includes('Stretch'));
              
              if (!catMatch) return false;

              if (!filterQuery.trim()) return true;
              const q = filterQuery.toLowerCase();
              return (
                job.jobTitle.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                (job.location || '').toLowerCase().includes(q) ||
                (job.requiredSkills || []).some((s: string) => s.toLowerCase().includes(q))
              );
            }) || [];

            return (
              <div className="space-y-6">
                {/* Advanced Filtering Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                       <Briefcase className="w-5 h-5 text-indigo-600 animate-pulse" />
                       Matched Opportunities
                    </h3>
                    <p className="text-xs text-zinc-500 font-semibold mt-1">
                      We identified <span className="text-indigo-600 font-extrabold">{result.jobs?.length || 0} tailored opportunities</span> matched precisely to your resume.
                    </p>
                  </div>

                  {/* Real-time search filter */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Filter by title, company, skills..."
                      value={filterQuery}
                      onChange={(e) => {
                        setFilterQuery(e.target.value);
                        setVisibleCount(15);
                      }}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:ring-4 focus:ring-indigo-150 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Score Category pill filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'All', label: `All Matches (${result.jobs?.length || 0})` },
                      { id: 'High', label: `High Match (${result.jobs?.filter(j => j.category.includes('High')).length || 0})` },
                      { id: 'Moderate', label: `Moderate Match (${result.jobs?.filter(j => j.category.includes('Moderate')).length || 0})` },
                      { id: 'Stretch', label: `Stretch Goals (${result.jobs?.filter(j => j.category.includes('Stretch')).length || 0})` }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id as any);
                          setVisibleCount(15);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeCategory === cat.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 border border-transparent cursor-pointer font-semibold'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Showing {Math.min(visibleCount, filteredJobs.length)} of {filteredJobs.length} matches
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredJobs.slice(0, visibleCount).map((job, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                   <div className="p-5 border-b border-neutral-100 flex flex-wrap justify-between items-start gap-4">
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-lg text-neutral-900">{job.jobTitle}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              job.category.includes('Easy Apply') ? 'bg-green-100 text-green-800' :
                              job.category.includes('Moderate') ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {job.matchPercentage}% Match • {job.category.split('(')[0].trim()}
                            </span>
                         </div>
                         <p className="text-sm text-neutral-600 font-medium">{job.company} • {job.location} • {job.platform}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                         <button
                           onClick={() => handleToggleTrack(job)}
                           className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border ${
                             isJobTracked(job.jobTitle, job.company) 
                               ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                               : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                           }`}
                         >
                           <CheckCircle className={`w-4 h-4 ${isJobTracked(job.jobTitle, job.company) ? 'text-green-600' : 'text-zinc-400'}`} />
                           {isJobTracked(job.jobTitle, job.company) 
                              ? (getTrackedStatus(job.jobTitle, job.company) || 'Tracked') 
                              : 'Track Job'}
                         </button>
                         <a 
                           href={job.searchQueryLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                         >
                            <ExternalLink className="w-4 h-4" />
                            Apply Now
                         </a>
                      </div>
                   </div>
                   
                   <div className="p-5 bg-neutral-50 grid md:grid-cols-2 gap-6">
                      <div>
                         <h5 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Required Skills</h5>
                         <div className="flex flex-wrap gap-1.5">
                           {job.requiredSkills?.map((req, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-700 text-xs rounded">{req}</span>
                           ))}
                         </div>
                      </div>
                      <div>
                         <h5 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Missing Skills to Learn</h5>
                         <div className="flex flex-wrap gap-1.5">
                           {job.missingSkills?.map((miss, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">{miss}</span>
                           ))}
                           {(!job.missingSkills || job.missingSkills.length === 0) && (
                              <span className="text-xs text-green-600 font-medium">None detected!</span>
                           )}
                         </div>
                      </div>
                   </div>
                   
                   <div className="p-5 border-t border-neutral-100 bg-white">
                      <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Resume Suggestions specific to this role</h5>
                      <p className="text-sm text-neutral-700">{job.resumeSuggestions}</p>
                      
                      {job.coverLetter && (
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                          <button 
                            onClick={() => setExpandedCoverLetter(expandedCoverLetter === idx ? null : idx)}
                            className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {expandedCoverLetter === idx ? 'Hide Cover Letter' : 'Show Tailored Cover Letter'}
                            {expandedCoverLetter === idx ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                          </button>
                          
                          {expandedCoverLetter === idx && (
                            <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                              <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">
                                {job.coverLetter}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                   </div>
                </div>
              ))}
              
              {filteredJobs.length > visibleCount && (
                <div className="flex justify-center pt-8">
                  <button 
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 15)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wider px-6 py-3 rounded-full text-xs uppercase shadow hover:shadow-lg transition-all cursor-pointer"
                  >
                     Show More Matched Opportunities [+15]
                  </button>
                </div>
              )}

              {filteredJobs.length === 0 && (
                <div className="p-12 text-center text-zinc-500 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl">
                  No matching jobs found with your filter terms. Try altering your keywords!
                </div>
              )}
            </div>
          </div>
        );
      })()}
        </div>
      )}
    </div>
  );
}
