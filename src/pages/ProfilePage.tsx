import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Profile, Review } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Briefcase, Star, MapPin, Mail, Globe, Github, Linkedin, Twitter, Edit3, Save, X, Plus, Trash2, Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { analyzeProfile } from '../services/geminiService';

const ProfilePage = ({ user: currentUser }: { user: User | null }) => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const profileUid = uid || currentUser?.uid;
  const isOwnProfile = profileUid === currentUser?.uid;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!profileUid) {
      navigate('/auth');
      return;
    }

    const fetchData = async () => {
      const [userDoc, profileDoc, reviewsSnap] = await Promise.all([
        getDoc(doc(db, 'users', profileUid)),
        getDoc(doc(db, 'profiles', profileUid)),
        getDocs(query(collection(db, 'reviews'), where('revieweeId', '==', profileUid)))
      ]);

      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
        setProfile(profileDoc.data() as Profile);
        setEditData(profileDoc.data() as Profile);
        setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      }
      setLoading(false);
    };

    fetchData();
  }, [profileUid, navigate]);

  const handleSave = async () => {
    if (!profileUid) return;
    try {
      await updateDoc(doc(db, 'profiles', profileUid), editData);
      setProfile({ ...profile, ...editData } as Profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAiAnalyze = async () => {
    if (!profile) return;
    setAiLoading(true);
    try {
      const analysis = await analyzeProfile(
        profile.bio || '',
        profile.skills || [],
        profile.experience || []
      );
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return <div className="text-center py-20">User not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-600 to-violet-600 -z-10" />
            <div className="relative mt-8">
              <img src={user.photoURL} alt="" className="w-32 h-32 rounded-full border-4 border-white shadow-xl mx-auto" />
              {user.role === 'freelancer' && (
                <div className="absolute bottom-0 right-1/2 translate-x-16 bg-green-500 text-white p-1.5 rounded-full border-4 border-white">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-6">{user.displayName}</h2>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">{user.role}</p>
            
            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-500">
                <Mail size={18} className="text-indigo-600" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <MapPin size={18} className="text-indigo-600" />
                <span className="text-sm">Remote / Worldwide</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <Star size={18} className="text-yellow-500" />
                <span className="text-sm font-bold text-gray-900">{profile?.rating || 0} / 5.0</span>
                <span className="text-xs text-gray-400">({profile?.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center gap-4">
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Globe size={20} /></button>
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Github size={20} /></button>
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><Linkedin size={20} /></button>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {isEditing ? <X size={20} /> : <Edit3 size={20} />}
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            )}
            {!isOwnProfile && (
              <button
                onClick={() => navigate(`/messages/${[currentUser?.uid, user.uid].sort().join('_')}`)}
                className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Send Message
              </button>
            )}
          </div>

          {/* AI Analysis Card */}
          {isOwnProfile && user.role === 'freelancer' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={80} className="text-indigo-600" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <Wand2 size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Profile Coach</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Let our AI analyze your profile and suggest improvements to attract high-paying clients.
              </p>
              <button
                onClick={handleAiAnalyze}
                disabled={aiLoading}
                className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {aiLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" /> : <Sparkles size={18} />}
                Analyze My Profile
              </button>

              <AnimatePresence>
                {aiAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-gray-50"
                  >
                    <div className="bg-indigo-50/50 p-4 rounded-2xl text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
                      {aiAnalysis}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">About Me</h3>
              {isEditing && (
                <button onClick={handleSave} className="flex items-center gap-2 text-green-600 font-bold text-sm hover:text-green-700">
                  <Save size={18} /> Save Changes
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[150px]"
                placeholder="Tell clients about your expertise and what you can offer..."
              />
            ) : (
              <p className="text-gray-600 leading-relaxed text-lg">
                {profile?.bio || "No bio added yet."}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <div className="w-full space-y-4">
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !editData.skills?.includes(val)) {
                          setEditData({ ...editData, skills: [...(editData.skills || []), val] });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <div className="flex flex-wrap gap-2">
                    {editData.skills?.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl flex items-center gap-2">
                        {skill}
                        <button onClick={() => setEditData({ ...editData, skills: editData.skills?.filter((_, idx) => idx !== i) })}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                profile?.skills?.map((skill, i) => (
                  <span key={i} className="px-6 py-3 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-2xl border border-indigo-100 uppercase tracking-wider">
                    {skill}
                  </span>
                )) || <p className="text-gray-400 italic">No skills listed.</p>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
              {isEditing && (
                <button
                  onClick={() => setEditData({ ...editData, experience: [...(editData.experience || []), { company: '', role: '', duration: '', description: '' }] })}
                  className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-700"
                >
                  <Plus size={18} /> Add Experience
                </button>
              )}
            </div>
            <div className="space-y-8">
              {(isEditing ? editData.experience : profile?.experience)?.map((exp, i) => (
                <div key={i} className="relative pl-8 border-l-2 border-indigo-100 pb-8 last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm" />
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl">
                      <input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...(editData.experience || [])];
                          newExp[i].company = e.target.value;
                          setEditData({ ...editData, experience: newExp });
                        }}
                        className="p-3 border border-gray-200 rounded-xl"
                      />
                      <input
                        placeholder="Role"
                        value={exp.role}
                        onChange={(e) => {
                          const newExp = [...(editData.experience || [])];
                          newExp[i].role = e.target.value;
                          setEditData({ ...editData, experience: newExp });
                        }}
                        className="p-3 border border-gray-200 rounded-xl"
                      />
                      <input
                        placeholder="Duration"
                        value={exp.duration}
                        onChange={(e) => {
                          const newExp = [...(editData.experience || [])];
                          newExp[i].duration = e.target.value;
                          setEditData({ ...editData, experience: newExp });
                        }}
                        className="p-3 border border-gray-200 rounded-xl"
                      />
                      <button
                        onClick={() => setEditData({ ...editData, experience: editData.experience?.filter((_, idx) => idx !== i) })}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 font-bold"
                      >
                        <Trash2 size={18} /> Remove
                      </button>
                      <textarea
                        placeholder="Description"
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...(editData.experience || [])];
                          newExp[i].description = e.target.value;
                          setEditData({ ...editData, experience: newExp });
                        }}
                        className="col-span-1 md:col-span-2 p-3 border border-gray-200 rounded-xl"
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{exp.role}</h4>
                      <p className="text-indigo-600 font-bold text-sm mb-2">{exp.company} • {exp.duration}</p>
                      <p className="text-gray-500 leading-relaxed">{exp.description}</p>
                    </div>
                  )}
                </div>
              ))}
              {(!isEditing && (!profile?.experience || profile.experience.length === 0)) && (
                <p className="text-gray-400 italic">No experience listed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
