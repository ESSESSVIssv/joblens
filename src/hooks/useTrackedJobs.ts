import { useState, useEffect } from 'react';
import { TrackedJob } from '../types';

// Global hooks synchronization via listener mechanism
const listeners = new Set<(jobs: TrackedJob[]) => void>();

function notify(jobs: TrackedJob[]) {
  listeners.forEach(listener => listener(jobs));
}

let globalTrackedJobs: TrackedJob[] = [];
try {
  const saved = localStorage.getItem('joblens-tracked-jobs');
  globalTrackedJobs = saved ? JSON.parse(saved) : [];
} catch {
  globalTrackedJobs = [];
}

export function useTrackedJobs() {
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>(globalTrackedJobs);

  useEffect(() => {
    listeners.add(setTrackedJobs);
    return () => {
      listeners.delete(setTrackedJobs);
    };
  }, []);

  const saveJobs = (newJobs: TrackedJob[]) => {
    globalTrackedJobs = newJobs;
    try {
      localStorage.setItem('joblens-tracked-jobs', JSON.stringify(newJobs));
    } catch {}
    notify(newJobs);
  };

  const addJob = (job: TrackedJob) => {
    if (!globalTrackedJobs.some(j => j.id === job.id)) {
      saveJobs([...globalTrackedJobs, job]);
    }
  };

  const updateJobStatus = (id: string, status: TrackedJob['status']) => {
    saveJobs(globalTrackedJobs.map(j => j.id === id ? { ...j, status } : j));
  };

  const removeJob = (id: string) => {
    saveJobs(globalTrackedJobs.filter(j => j.id !== id));
  };

  return { trackedJobs, addJob, updateJobStatus, removeJob };
}

