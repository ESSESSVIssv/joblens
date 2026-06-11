import React, { useState } from 'react';
import { useTrackedJobs } from '../hooks/useTrackedJobs';
import { TrackedJob } from '../types';
import { ExternalLink, Trash2, Plus, Briefcase, Calendar, MapPin, Building2, LayoutList, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const parseSalary = (salaryStr: string = '') => {
  const match = salaryStr.match(/\d+(?:,\d+)*(?:\.\d+)?/);
  if (!match) return 0;
  let num = parseFloat(match[0].replace(/,/g, ''));
  if (salaryStr.toLowerCase().includes('k') && num < 1000) {
    num = num * 1000;
  }
  return num;
};

export default function JobTracker() {
  const { trackedJobs, addJob, updateJobStatus, removeJob } = useTrackedJobs();
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', link: '', salary: '', status: 'Saved' as TrackedJob['status'] });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company) return;
    
    addJob({
      id: `${newJob.title}-${newJob.company}-${Date.now()}`,
      jobTitle: newJob.title,
      company: newJob.company,
      location: newJob.location,
      link: newJob.link,
      salary: newJob.salary,
      status: newJob.status,
      dateAdded: new Date().toISOString()
    });
    setNewJob({ title: '', company: '', location: '', link: '', salary: '', status: 'Saved' });
    setIsAdding(false);
  };

  const statusColors = {
    'Saved': 'bg-zinc-100 text-zinc-800 border-zinc-200',
    'Applied': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Interviewing': 'bg-purple-100 text-purple-800 border-purple-200',
    'Offer': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
  };

  const salaryData = React.useMemo(() => {
    return trackedJobs
      .filter(j => j.salary && parseSalary(j.salary) > 0)
      .map(j => ({
        name: j.company || j.jobTitle,
        jobTitle: j.jobTitle,
        salary: parseSalary(j.salary),
        original: j.salary
      }))
      .sort((a, b) => b.salary - a.salary)
      .slice(0, 10); // Show top 10 to keep chart tidy
  }, [trackedJobs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-zinc-200 shadow-lg rounded-xl">
          <p className="font-bold text-sm text-zinc-900">{label}</p>
          <p className="text-xs text-zinc-500 mb-1">{payload[0].payload.jobTitle}</p>
          <p className="text-sm font-semibold text-indigo-600">
            {payload[0].payload.original}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-indigo-600" />
            Job Tracker
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Easily follow and track your job applications over time.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Job Manually
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            New Application
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 block">Job Title *</label>
              <input required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-4 py-3 text-sm transition-all" placeholder="e.g. Product Manager" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 block">Company *</label>
              <input required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-4 py-3 text-sm transition-all" placeholder="e.g. Tech Solutions Inc." />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 block">Location</label>
              <input value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-4 py-3 text-sm transition-all" placeholder="e.g. Remote, San Francisco" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 block">Salary</label>
              <input value={newJob.salary || ''} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-4 py-3 text-sm transition-all" placeholder="e.g. $120,000" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 block">Job Posting Link</label>
              <input value={newJob.link} onChange={e => setNewJob({...newJob, link: e.target.value})} className="w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-4 py-3 text-sm transition-all" placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 block">Current Status</label>
              <select value={newJob.status} onChange={e => setNewJob({...newJob, status: e.target.value as TrackedJob['status']})} className="w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 px-4 py-3 text-sm font-medium transition-all">
                <option value="Saved">📌 Saved for Later</option>
                <option value="Applied">📝 Applied</option>
                <option value="Interviewing">💬 Interviewing</option>
                <option value="Offer">🎉 Offer Received</option>
                <option value="Rejected">🛑 Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-3 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-full transition-colors shadow-md">Save Application</button>
          </div>
        </form>
      )}

      {trackedJobs.length === 0 ? (
        <div className="text-center py-20 px-6 bg-zinc-50 border-2 border-zinc-200 border-dashed rounded-3xl">
          <div className="bg-white p-4 rounded-full inline-flex shadow-sm mb-4">
            <LayoutList className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No jobs tracked yet</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">Discover jobs using the Career Discovery tab or add them manually to start tracking your applications.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {salaryData.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm col-span-full">
              <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Salary Insights
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#71717A' }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#71717A' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F4F5' }} />
                    <Bar dataKey="salary" radius={[6, 6, 0, 0]}>
                      {salaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
          {trackedJobs.slice().reverse().map(job => (
            <div key={job.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-lg transition-all duration-300 relative group flex flex-col h-full">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                    {job.jobTitle}
                  </h3>
                  <div className="flex flex-col gap-1.5 mt-2 text-sm text-zinc-600 font-medium">
                    <span className="flex items-center gap-2 text-zinc-800"><Building2 className="w-4 h-4 text-zinc-400" /> {job.company}</span>
                    {job.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-zinc-400" /> {job.location}</span>}
                  </div>
                </div>
                {job.link && (
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-zinc-50 p-2 rounded-full border border-zinc-200 text-zinc-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors" title="View Job Description">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              <div className="mt-auto pt-5 border-t border-zinc-100 flex justify-between items-end gap-2">
                <div className="flex-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Status</span>
                  <select
                    value={job.status}
                    onChange={(e) => updateJobStatus(job.id, e.target.value as TrackedJob['status'])}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border appearance-none cursor-pointer outline-none focus:ring-4 focus:ring-indigo-100 transition-colors shadow-sm ${statusColors[job.status]}`}
                  >
                    <option value="Saved">📌 Saved</option>
                    <option value="Applied">📝 Applied</option>
                    <option value="Interviewing">💬 Interviewing</option>
                    <option value="Offer">🎉 Offer</option>
                    <option value="Rejected">🛑 Rejected</option>
                  </select>
                </div>

                <div className="flex items-end gap-3">
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1 hidden sm:flex">
                    <Calendar className="w-3.5 h-3.5" /> 
                    {new Date(job.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                  </span>
                  <button 
                    onClick={() => removeJob(job.id)} 
                    className="text-zinc-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 bg-zinc-50 border border-zinc-100 opacity-60 hover:opacity-100 block"
                    aria-label="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
