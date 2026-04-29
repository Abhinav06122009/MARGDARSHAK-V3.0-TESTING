import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Users, Globe, TrendingUp, Search, Plus, ThumbsUp, MessageCircle, MoreVertical, Flame, Sparkles, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from "@/components/logo/logo.png";

const CATEGORIES = [
  { id: 'all', label: 'Global Feed', icon: Globe },
  { id: 'study', label: 'Study Groups', icon: Users },
  { id: 'qa', label: 'Q & A', icon: MessageSquare },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

const DISCUSSIONS = [
  {
    id: 1,
    author: { name: 'Alex M.', avatar: 'https://i.pravatar.cc/150?u=alex' },
    title: 'Tips for mastering Advanced React Patterns?',
    preview: 'Hey everyone, I am struggling with higher order components and render props. Does anyone have a good mental model for these?',
    category: 'Q & A',
    upvotes: 142,
    replies: 28,
    time: '2h ago',
    tags: ['React', 'Frontend', 'Advanced']
  },
  {
    id: 2,
    author: { name: 'Sarah K.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    title: 'Looking for study partners: Machine Learning CS229',
    preview: 'Starting the Stanford ML course next week. Would love to form a small group of 3-4 people to tackle the problem sets together.',
    category: 'Study Groups',
    upvotes: 89,
    replies: 15,
    time: '5h ago',
    tags: ['Machine Learning', 'Study Group']
  },
  {
    id: 3,
    author: { name: 'David R.', avatar: 'https://i.pravatar.cc/150?u=david' },
    title: 'My experience using the new AI Tutor for Exam Prep',
    preview: 'Just wanted to share how I used the burnout prevention system to pace my finals week. It completely changed my workflow...',
    category: 'Global Feed',
    upvotes: 356,
    replies: 42,
    time: '1d ago',
    tags: ['Margdarshak', 'Workflow', 'Productivity']
  }
];

const Community = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-emerald-500/30 relative">
      
      {/* Zenith Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Animated Neural Orbs */}
        <motion.div 
          animate={{ opacity: [0.08, 0.12, 0.08], scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.08, 0.05], scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[10%] right-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
        />
        
        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col min-h-screen">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16"
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="p-3 bg-white/[0.02] border border-white/10 hover:bg-white/5 rounded-2xl transition-all shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <img src={logo} alt="Margdarshak" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase italic text-white leading-none">
                    Margdarshak <span className="text-emerald-500 not-italic font-light">Hub</span>
                  </h1>
                  <p className="text-emerald-500 text-[10px] uppercase tracking-[0.3em] font-black mt-2 ml-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    Global Intelligence Network
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-80 group">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3.5 backdrop-blur-3xl shadow-2xl">
                  <Search className="w-4 h-4 text-zinc-500 mr-3" />
                  <input 
                    type="text" 
                    placeholder="SCAN DISCUSSIONS..." 
                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-white focus:outline-none w-full placeholder-zinc-700"
                  />
                </div>
              </div>
              <button className="flex items-center gap-3 px-8 py-3.5 bg-emerald-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 flex-shrink-0 active:scale-95">
                <Plus className="w-4 h-4" /> Initialize Post
              </button>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 flex-1 mb-24">
            
            {/* Left Sidebar - Categories */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
              className="w-full lg:w-72 flex-shrink-0 space-y-3"
            >
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-6 px-2">Knowledge Streams</h3>
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 italic' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02] border border-transparent'}`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}

              <div className="mt-12 pt-8 border-t border-white/5">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-6 px-2 italic">Active Nodes</h3>
                <div className="space-y-4 px-2">
                  {['CS229 Study Group', 'React Developers', 'Physics 101 Help'].map((group, i) => (
                    <div key={i} className="flex items-center gap-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest hover:text-white cursor-pointer transition-colors group">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover:bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      {group}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main Feed */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="flex-1 space-y-8"
            >
              {DISCUSSIONS.map((discussion, i) => (
                <motion.div 
                  key={discussion.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-[2.8rem] p-8 hover:bg-white/[0.03] hover:border-emerald-500/20 transition-all duration-700 group cursor-pointer shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 flex items-start gap-6">
                    {/* Upvote Column */}
                    <div className="flex flex-col items-center gap-2 bg-white/[0.03] rounded-2xl p-3 border border-white/5 group-hover:border-emerald-500/20 transition-all shadow-xl">
                      <button className="p-1 hover:text-emerald-400 transition-colors text-zinc-600"><ChevronUpIcon /></button>
                      <span className="text-[11px] font-black text-white">{discussion.upvotes}</span>
                      <button className="p-1 hover:text-emerald-400 transition-colors text-zinc-600"><ChevronDownIcon /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-0.5 rounded-full border border-emerald-500/30">
                            <img src={discussion.author.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{discussion.author.name}</span>
                            <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">{discussion.time}</span>
                          </div>
                          <span className="text-zinc-800 font-black">•</span>
                          <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-black px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 italic">{discussion.category}</span>
                        </div>
                        <button className="text-zinc-700 hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
                      </div>

                      <h2 className="text-2xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors leading-tight uppercase italic tracking-tighter">{discussion.title}</h2>
                      <p className="text-sm text-zinc-500 mb-6 leading-relaxed line-clamp-2 font-medium">{discussion.preview}</p>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                        <div className="flex gap-3">
                          {discussion.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-black tracking-widest text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase group-hover:border-emerald-500/20 transition-all">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-400 transition-all">
                          <MessageCircle className="w-4 h-4 text-emerald-500" />
                          {discussion.replies} Transmissions
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="text-center py-12">
                <button className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500 border border-emerald-500/20 bg-emerald-500/5 px-10 py-4 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-2xl shadow-emerald-500/10 active:scale-95">
                  Expand Neural Feed
                </button>
              </div>
            </motion.div>

            {/* Right Sidebar - Trending */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
              className="hidden xl:block w-80 flex-shrink-0"
            >
              <div className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 sticky top-8 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
                
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-8 flex items-center gap-3">
                  <Flame className="w-4 h-4 text-emerald-500 animate-pulse" /> Global Trends
                </h3>
                <div className="space-y-8">
                  {[
                    { tag: 'FinalsPrep', posts: 1.2 },
                    { tag: 'Reactjs', posts: 0.8 },
                    { tag: 'AI_Tools', posts: 2.4 },
                    { tag: 'MathHelp', posts: 0.5 },
                  ].map((topic, i) => (
                    <div key={i} className="flex items-center justify-between group/topic cursor-pointer">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-white group-hover/topic:text-emerald-400 transition-all uppercase italic tracking-tighter">#{topic.tag}</p>
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">{topic.posts}K SIGNALS</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover/topic:border-emerald-500/30 transition-all shadow-xl">
                        <TrendingUp className="w-3.5 h-3.5 text-zinc-500 group-hover/topic:text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center text-center">
                  <Database size={24} className="text-zinc-800 mb-4" />
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">
                    Margdarshak Real-Time Network Sync Active
                  </p>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </ScrollArea>
    </div>
  );
};

const ChevronUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
)

export default Community;
