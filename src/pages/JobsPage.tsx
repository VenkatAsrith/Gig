import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp, where, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Job, User, Profile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Sparkles, DollarSign, Tag, Clock, Briefcase, X, Wand2, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { matchFreelancers } from '../services/geminiService';
import { formatDistanceToNow } from 'date-fns';

const JobsPage = ({ user }: { user: User | null }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  // Form state
  const [newJob, setNewJob] = useState({ title: '', description: '', budget: '', tags: '' });

  useEffect(() => {
    const fetchJobs = async () => {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'jobs'), {
        clientId: user.uid,
        title: newJob.title,
        description: newJob.description,
        budget: parseFloat(newJob.budget),
        tags: newJob.tags.split(',').map(t => t.trim()),
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowCreateModal(false);
      setNewJob({ title: '', description: '', budget: '', tags: '' });
      // Refresh jobs
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleGetRecommendations = async (job: Job) => {
    setSelectedJob(job);
    setRecLoading(true);
    try {
      // Fetch some freelancers to match
      const freelancersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'freelancer'), limit(10)));
      const freelancers = freelancersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      
      const matches = await matchFreelancers(job.description, freelancers);
      
      // Fetch full user details for matches
      const matchedFreelancers = await Promise.all(matches.map(async (match: any) => {
        const userDoc = await getDoc(doc(db, 'users', match.freelancerId));
        return { ...match, user: userDoc.data() };
      }));
      
      setRecommendations(matchedFreelancers);
    } catch (error) {
      console.error('Matching error:', error);
    } finally {
      setRecLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Find Jobs</h1>
          <p className="text-gray-500 mt-2">Discover exciting projects and grow your freelance business.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none shadow-sm"
            />
          </div>
          {user?.role === 'client' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Post a Job
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-48 animate-pulse border border-gray-100 shadow-sm" />
            ))
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white p-8 rounded-[2rem] border transition-all duration-300 group cursor-pointer ${
                  selectedJob?.id === job.id ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-gray-100 shadow-sm hover:shadow-md'
                }`}
                onClick={() => handleGetRecommendations(job)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock size={14} /> {formatDistanceToNow(job.createdAt?.toDate() || new Date())} ago
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${job.budget}</p>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">Budget</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">{job.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg uppercase tracking-wider border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all">
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">AI Smart Match</h2>
            </div>
            
            {!selectedJob ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <Users size={32} />
                </div>
                <p className="text-gray-500 text-sm">Select a job to see recommended freelancers matched by AI.</p>
              </div>
            ) : recLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
                ))}
                <p className="text-center text-xs text-gray-400 animate-pulse">Analyzing skills and requirements...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={rec.user?.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{rec.user?.displayName}</p>
                        <div className="flex items-center gap-1 text-indigo-600">
                          <CheckCircle2 size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{rec.matchScore}% Match</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed italic">"{rec.reason}"</p>
                    <button className="w-full mt-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                      View Profile
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <form onSubmit={handleCreateJob} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      required
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="e.g. Full-stack Developer for E-commerce App"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      required
                      rows={6}
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Describe the project requirements, scope, and deliverables..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Budget ($)</label>
                      <input
                        type="number"
                        required
                        value={newJob.budget}
                        onChange={(e) => setNewJob({ ...newJob, budget: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Required Skills (comma separated)</label>
                      <input
                        type="text"
                        value={newJob.tags}
                        onChange={(e) => setNewJob({ ...newJob, tags: e.target.value })}
                        placeholder="react, nodejs, typescript"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all mt-4"
                  >
                    Post Job
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobsPage;
