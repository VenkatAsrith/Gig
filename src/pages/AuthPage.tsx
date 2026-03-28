import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { User, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, User as UserIcon, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const AuthPage = ({ user }: { user: User | null }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          role: role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        // Create initial profile
        await setDoc(doc(db, 'profiles', firebaseUser.uid), {
          uid: firebaseUser.uid,
          bio: '',
          skills: [],
          portfolio: [],
          experience: [],
          rating: 0,
          reviewCount: 0
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-100 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100"
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-6">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join GigNest</h2>
          <p className="mt-2 text-sm text-gray-500">Choose your role to get started</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8">
          <button
            onClick={() => setRole('freelancer')}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
              role === 'freelancer' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-3 rounded-xl ${role === 'freelancer' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                <Briefcase size={24} />
              </div>
              {role === 'freelancer' && <CheckCircle2 className="text-indigo-600" size={24} />}
            </div>
            <h3 className={`text-lg font-bold ${role === 'freelancer' ? 'text-indigo-900' : 'text-gray-900'}`}>I'm a Freelancer</h3>
            <p className="text-sm text-gray-500">I want to offer my services and find projects to work on.</p>
          </button>

          <button
            onClick={() => setRole('client')}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
              role === 'client' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-3 rounded-xl ${role === 'client' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                <UserIcon size={24} />
              </div>
              {role === 'client' && <CheckCircle2 className="text-indigo-600" size={24} />}
            </div>
            <h3 className={`text-lg font-bold ${role === 'client' ? 'text-indigo-900' : 'text-gray-900'}`}>I'm a Client</h3>
            <p className="text-sm text-gray-500">I want to post jobs and hire top talent for my projects.</p>
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={!role || loading}
            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              !role || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-black shadow-xl shadow-gray-200'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-6 h-6" />
                Continue with Google
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to GigNest's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
