import React, { useState } from 'react';
import { MatchResponse } from '../types';
import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink, Upload, FileText, Sparkles } from 'lucide-react';

export default function JobMatcher() {
  const [resumeText, setResumeText] = useState('');
  const [resumePdf, setResumePdf] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

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
  const [result, setResult] = useState<MatchResponse | null>(null);

  const handleMatch = async () => {
    if ((!resumeText.trim() && !resumePdf) || !jobDescription.trim()) {
      setError('Please provide both a resume (Text or PDF) and job description.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/resume-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText, resumePdf, jobDescription }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to match resume.');
      }

      setResult(data as MatchResponse);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid md:grid-cols-2 gap-6">
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
            <div className="w-full h-[280px] p-6 flex flex-col items-center justify-center bg-zinc-50 border-2 border-zinc-200 border-dashed rounded-2xl shadow-inner transition-colors hover:border-zinc-300">
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
              placeholder="Paste your resume text here..."
              className="w-full h-[280px] p-5 text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-zinc-100 focus:border-zinc-400 focus:outline-none resize-none transition-all shadow-inner leading-relaxed"
            />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-800">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the target job description here..."
            className="w-full h-[280px] p-5 text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-zinc-100 focus:border-zinc-400 focus:outline-none resize-none transition-all shadow-inner leading-relaxed"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleMatch}
          disabled={loading || (!resumeText && !resumePdf) || !jobDescription}
          className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Match...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze Match
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
        <div className="mt-8 space-y-6 pt-8 border-t border-neutral-100 animate-in fade-in duration-700 delay-100">
          <div className="flex flex-col lg:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>
            
            <div className="relative flex flex-col items-center shrink-0">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-zinc-100 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                  ></circle>
                  <circle
                    className={`stroke-current ${
                      result.matchScore >= 80 ? 'text-green-500' : result.matchScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    strokeDasharray={263.89}
                    strokeDashoffset={263.89 - (result.matchScore / 100) * 263.89}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-black tracking-tight ${
                    result.matchScore >= 80 ? 'text-green-600' : result.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.matchScore}
                  </span>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 z-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{result.verdict}</h3>
              <p className="text-zinc-600 leading-relaxed text-lg bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100">
                {result.summary}
              </p>
            </div>
          </div>

          {result.mentorExplanation && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles className="w-24 h-24 text-indigo-500" />
               </div>
               <div className="relative z-10">
                 <h4 className="text-indigo-900 font-bold flex items-center gap-2 mb-3">
                   <Sparkles className="w-5 h-5 text-indigo-600" />
                   Mentor's Feedback
                 </h4>
                 <div className="text-sm text-indigo-800 leading-relaxed font-medium bg-white/60 p-4 rounded-xl border border-indigo-200/50">
                   {result.mentorExplanation}
                 </div>
               </div>
            </div>
          )}

          {result.matchScore >= 70 && result.jobTitle && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-indigo-900 font-bold flex items-center gap-2 mb-2">
                <ExternalLink className="w-5 h-5 text-indigo-600" />
                Apply for Similar Jobs
              </h4>
              <p className="text-sm text-indigo-700 mb-4 font-medium">
                Your resume is a strong match! Click the links below to directly search and apply for "{result.jobTitle}" positions targeting your top skills.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent([result.jobTitle, ...(result.matchedSkills || []).slice(0, 3)].join(' '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.indeed.com/jobs?q=${encodeURIComponent([result.jobTitle, ...(result.matchedSkills || []).slice(0, 3)].join(' '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
                >
                  Indeed
                </a>
                <a
                  href={`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent([result.jobTitle, ...(result.matchedSkills || []).slice(0, 3)].join(' '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
                >
                  Glassdoor
                </a>
              </div>

              <h4 className="text-indigo-900 font-bold flex items-center gap-2 mt-6 mb-2">
                Student or Recent Grad?
              </h4>
              <div className="flex flex-wrap gap-3">
                 <a
                  href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(result.jobTitle + ' Internship')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Search Internships
                </a>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Matched Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Missing Skills (Priority Updates)
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 p-6 rounded-3xl border-2 border-emerald-100 bg-emerald-50/30">
              <h4 className="font-bold text-lg text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Key Strengths
              </h4>
              <ul className="space-y-3">
                {result.strengths?.map((strength, i) => (
                  <li key={i} className="text-sm bg-white text-emerald-800 p-3 rounded-2xl border border-emerald-100/50 shadow-sm flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4 p-6 rounded-3xl border-2 border-rose-100 bg-rose-50/30">
              <h4 className="font-bold text-lg text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" /> Areas for Improvement
              </h4>
              <ul className="space-y-3">
                {result.improvements?.map((imp, i) => (
                  <li key={i} className="text-sm bg-white text-rose-800 p-3 rounded-2xl border border-rose-100/50 shadow-sm flex items-start gap-3">
                    <span className="text-rose-500 mt-0.5 text-lg leading-none">⚠️</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-5 p-6 rounded-3xl border-2 border-amber-200 bg-amber-50">
              <h4 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Gap Analysis & Hard Truths
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-amber-800 opacity-70 mb-2">Critical Gaps</h5>
                  <ul className="space-y-2">
                    {result.gapAnalysis?.criticalGaps?.map((gap, i) => (
                      <li key={i} className="text-sm font-medium text-amber-900 flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-amber-200/50">
                        <span className="text-amber-600 font-bold mt-0.5">✗</span>{gap}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-amber-800 opacity-70 mb-2">Action Plan</h5>
                  <ul className="space-y-2">
                    {result.gapAnalysis?.recommendations?.map((rec, i) => (
                      <li key={i} className="text-sm font-medium text-amber-900 flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-amber-200/50">
                        <span className="text-amber-600 font-bold mt-0.5">✓</span>{rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6 rounded-3xl border-2 border-indigo-200 bg-indigo-50">
              <h4 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                ATS Keyword Optimization
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-indigo-800 opacity-70 mb-2">Suggested Keywords</h5>
                  <div className="flex flex-wrap gap-2">
                    {result.atsOptimization?.suggestedKeywords?.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white text-indigo-700 text-xs font-bold tracking-tight rounded-lg border border-indigo-200 shadow-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest text-indigo-800 opacity-70 mb-2">Revised Bullet Points</h5>
                  <ul className="space-y-2">
                    {result.atsOptimization?.revisedBullets?.map((bullet, i) => (
                      <li key={i} className="text-sm leading-relaxed text-indigo-900 flex items-start gap-2 bg-white p-3 rounded-xl border border-indigo-200/50 shadow-sm">
                         <span className="text-indigo-500 font-bold mt-0.5">•</span>
                         {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-6 bg-slate-900 rounded-2xl">
            <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
              Generated Cover Letter
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-md">Draft</span>
            </h4>
            <div className="text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap font-serif">
              {result.coverLetter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
