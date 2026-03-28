import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Briefcase, Search, Shield, Zap, Star, Users, ArrowRight, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group"
  >
    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-violet-100/50 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-8 border border-indigo-100">
              <Sparkles size={16} />
              AI-Powered Freelance Marketplace
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Where Top Talent Meets <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">
                Extraordinary Projects
              </span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              GigNest is the hybrid marketplace for the modern workforce. Hire elite freelancers or find your next big project with AI-powered matching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
              >
                Get Started
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/gigs"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
              >
                Browse Gigs
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <img
                src="https://picsum.photos/seed/gig-hero/1200/600"
                alt="Dashboard Preview"
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden lg:block animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle2 size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Project Completed</p>
                  <p className="text-xs text-gray-500">Payment Released</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden lg:block animate-pulse-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Star size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Top Rated Plus</p>
                  <p className="text-xs text-gray-500">99% Job Success</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Freelancers', value: '50k+' },
              { label: 'Projects Done', value: '120k+' },
              { label: 'Total Payout', value: '$45M+' },
              { label: 'Success Rate', value: '98%' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              We've built the ultimate platform for both freelancers and clients, powered by the latest AI technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="AI Smart Matching"
              description="Our advanced algorithms match the perfect freelancer for your project based on skills, experience, and budget."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Secure Payments"
              description="Funds are held in escrow and only released when you're 100% satisfied with the delivered work."
              delay={0.2}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Real-time Collaboration"
              description="Communicate seamlessly with built-in chat, file sharing, and project management tools."
              delay={0.3}
            />
            <FeatureCard
              icon={Briefcase}
              title="Gig Marketplace"
              description="Browse thousands of pre-defined services and hire instantly for quick turnaround projects."
              delay={0.4}
            />
            <FeatureCard
              icon={Users}
              title="Verified Talent"
              description="Every freelancer goes through a verification process to ensure high-quality results for every job."
              delay={0.5}
            />
            <FeatureCard
              icon={Star}
              title="Review System"
              description="Build trust with our transparent rating and review system for both clients and freelancers."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8">Ready to start your next big thing?</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                Join thousands of freelancers and businesses already growing on GigNest.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all shadow-xl"
                >
                  Join as Freelancer
                </Link>
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-10 py-5 bg-indigo-500 text-white rounded-2xl font-bold text-xl hover:bg-indigo-400 transition-all border border-indigo-400"
                >
                  Hire Talent
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
