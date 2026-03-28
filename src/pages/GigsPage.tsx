import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Gig, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Sparkles, DollarSign, Tag, Clock, Briefcase, X, Wand2 } from 'lucide-react';
import { generateGigDescription, suggestPricingAndTags } from '../services/geminiService';

const GigsPage = ({ user }: { user: User | null }) => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [newGig, setNewGig] = useState({ title: '', description: '', price: '', tags: '' });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchGigs = async () => {
      const q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setGigs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gig)));
      setLoading(false);
    };
    fetchGigs();
  }, []);

  const handleCreateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'gigs'), {
        freelancerId: user.uid,
        title: newGig.title,
        description: newGig.description,
        price: parseFloat(newGig.price),
        tags: newGig.tags.split(',').map(t => t.trim()),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowCreateModal(false);
      setNewGig({ title: '', description: '', price: '', tags: '' });
      // Refresh gigs
      const q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setGigs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gig)));
    } catch (error) {
      console.error('Error creating gig:', error);
    }
  };

  const handleAiGenerate = async () => {
    if (!newGig.title) return;
    setAiLoading(true);
    try {
      const description = await generateGigDescription(newGig.title, newGig.tags.split(','));
      setNewGig(prev => ({ ...prev, description }));
      
      const suggestions = await suggestPricingAndTags(newGig.title, description);
      setNewGig(prev => ({ 
        ...prev, 
        price: suggestions.minPrice.toString(),
        tags: suggestions.suggestedTags.join(', ')
      }));
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredGigs = gigs.filter(gig => 
    gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gig.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Explore Gigs</h1>
          <p className="text-gray-500 mt-2">Find professional services for your next big project.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search gigs or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none shadow-sm"
            />
          </div>
          {user?.role === 'freelancer' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Post a Gig
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGigs.map((gig) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${gig.id}/600/400`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-indigo-600 font-bold text-sm shadow-sm border border-white/20">
                  ${gig.price}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{gig.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{gig.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {gig.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <span className="text-xs font-medium text-gray-500">Freelancer</span>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Gig Modal */}
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
                <h2 className="text-2xl font-bold text-gray-900">Create a New Gig</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <form onSubmit={handleCreateGig} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gig Title</label>
                    <input
                      type="text"
                      required
                      value={newGig.title}
                      onChange={(e) => setNewGig({ ...newGig, title: e.target.value })}
                      placeholder="e.g. I will design a modern logo for your startup"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={!newGig.title || aiLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                      {aiLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" /> : <Wand2 size={16} />}
                      AI Generate Description & Pricing
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={newGig.description}
                      onChange={(e) => setNewGig({ ...newGig, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                      <input
                        type="number"
                        required
                        value={newGig.price}
                        onChange={(e) => setNewGig({ ...newGig, price: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={newGig.tags}
                        onChange={(e) => setNewGig({ ...newGig, tags: e.target.value })}
                        placeholder="logo, design, branding"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all mt-4"
                  >
                    Publish Gig
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

export default GigsPage;
