import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Gig, Job, Application } from '../types';
import { motion } from 'motion/react';
import { PlusCircle, Briefcase, Search, MessageSquare, Star, Clock, CheckCircle2, AlertCircle, TrendingUp, Users, DollarSign, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
      <Icon size={24} />
    </div>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const FreelancerDashboard = ({ user }: { user: User }) => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const gigsQuery = query(collection(db, 'gigs'), where('freelancerId', '==', user.uid));
      const appsQuery = query(collection(db, 'applications'), where('freelancerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
      
      const [gigsSnap, appsSnap] = await Promise.all([getDocs(gigsQuery), getDocs(appsQuery)]);
      
      setGigs(gigsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gig)));
      setApplications(appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.displayName}!</h1>
          <p className="text-gray-500">Here's what's happening with your freelance career.</p>
        </div>
        <Link
          to="/gigs/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <PlusCircle size={20} />
          Create New Gig
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="Active Gigs" value={gigs.length} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={FileText} label="Applications" value={applications.length} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Star} label="Rating" value="4.9" color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={DollarSign} label="Total Earnings" value="$12,450" color="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
            <Link to="/applications" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          <div className="space-y-4">
            {applications.length > 0 ? (
              applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-gray-100">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Job Application</p>
                      <p className="text-xs text-gray-500">{formatDistanceToNow(app.createdAt?.toDate() || new Date())} ago</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No applications yet. Start applying to jobs!</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Gigs</h2>
            <Link to="/gigs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Manage Gigs</Link>
          </div>
          <div className="space-y-4">
            {gigs.length > 0 ? (
              gigs.map((gig) => (
                <div key={gig.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-gray-100">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 truncate max-w-[200px]">{gig.title}</p>
                      <p className="text-xs text-gray-500">${gig.price}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <TrendingUp size={20} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No gigs created yet. Create one to start earning!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientDashboard = ({ user }: { user: User }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const jobsQuery = query(collection(db, 'jobs'), where('clientId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
      const jobsSnap = await getDocs(jobsQuery);
      setJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.displayName}!</h1>
          <p className="text-gray-500">Find the best talent for your projects.</p>
        </div>
        <Link
          to="/jobs/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <PlusCircle size={20} />
          Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="Active Jobs" value={jobs.length} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Users} label="Freelancers Hired" value="12" color="bg-blue-50 text-blue-600" />
        <StatCard icon={Star} label="Client Rating" value="5.0" color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={DollarSign} label="Total Spent" value="$45,200" color="bg-green-50 text-green-600" />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Recent Job Postings</h2>
          <Link to="/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
        </div>
        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-6 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-gray-100 shadow-sm">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <DollarSign size={14} /> Budget: ${job.budget}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} /> {formatDistanceToNow(job.createdAt?.toDate() || new Date())} ago
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status}
                  </span>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-12">No jobs posted yet. Hire your first freelancer today!</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {user.role === 'freelancer' ? (
        <FreelancerDashboard user={user} />
      ) : (
        <ClientDashboard user={user} />
      )}
    </div>
  );
};

export default Dashboard;
