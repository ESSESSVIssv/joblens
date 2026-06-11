import { useState, useEffect } from 'react';
import { TrackedJob } from '../types';

export function useTrackedJobs() {
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>(() => {
    try {
      const saved = localStorage.getItem('joblens-tracked-jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('joblens-tracked-jobs', JSON.stringify(trackedJobs));
  }, [trackedJobs]);

  const addJob = (job: TrackedJob) => {
    setTrackedJobs(prev => {
      if (!prev.find(j => j.id === job.id)) {
        return [...prev, job];
      }
      return prev;
    });
  };

  const updateJobStatus = (id: string, status: TrackedJob['status']) => {
    setTrackedJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const removeJob = (id: string) => {
    setTrackedJobs(prev => prev.filter(j => j.id !== id));
  };

  return { trackedJobs, addJob, updateJobStatus, removeJob };
}
