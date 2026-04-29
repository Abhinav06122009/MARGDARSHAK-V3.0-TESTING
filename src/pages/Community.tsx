import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Users, Globe, TrendingUp, Search, Plus, ThumbsUp, MessageCircle, MoreVertical, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

// Social Icons for Footer
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/>
  </svg>
);

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
    <div className="min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden font-sans selection:bg-purple-500/30 relative">
      
      {/* Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,10,25,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <motion.div 
          animate={{ opacity: [0.08, 0.12, 0.08], scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.08, 0.05], scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[10%] right-[-10%] w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-[150px]"
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <ScrollArea className="h-screen w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col min-h-screen">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12"
          >
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/dashboard')} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all shadow-lg shadow-black/20">
                <ArrowLeft className="w-5 h-5 text-zinc-300" />
              </button>
              <div>
                <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase italic text-white">
                  Margdarshak Hub
                </h1>
                <p className="text-purple-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-1 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Global Student Network
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-72 group">
                <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md">
                  <Search className="w-4 h-4 text-zinc-500 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Search discussions..." 
                    className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-zinc-600 font-medium"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex-shrink-0">
                <Plus className="w-4 h-4" /> New Post
              </button>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1 mb-20">
            
            {/* Left Sidebar - Categories */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
              className="w-full lg:w-64 flex-shrink-0 space-y-2"
            >
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 px-2">Discover</h3>
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${activeCategory === cat.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}

              <div className="mt-12">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 px-2">Your Groups</h3>
                <div className="space-y-2 px-2">
                  {['CS229 Study Group', 'React Developers', 'Physics 101 Help'].map((group, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-400 font-medium hover:text-white cursor-pointer py-1">
                      <div className="w-2 h-2 rounded-full bg-pink-500/50" />
                      {group}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main Feed */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="flex-1 space-y-6"
            >
              {DISCUSSIONS.map((discussion, i) => (
                <motion.div 
                  key={discussion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2rem] p-6 hover:bg-white/[0.04] transition-all group cursor-pointer shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative z-10 flex items-start gap-4">
                    {/* Upvote Column */}
                    <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-2 border border-white/5 group-hover:border-purple-500/30 transition-colors">
                      <button className="p-1 hover:text-purple-400 transition-colors text-zinc-500"><ChevronUpIcon /></button>
                      <span className="text-sm font-black text-white">{discussion.upvotes}</span>
                      <button className="p-1 hover:text-purple-400 transition-colors text-zinc-500"><ChevronDownIcon /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src={discussion.author.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-white/10" />
                          <span className="text-xs font-bold text-zinc-300">{discussion.author.name}</span>
                          <span className="text-zinc-600 text-xs">•</span>
                          <span className="text-xs text-zinc-500 font-medium">{discussion.time}</span>
                          <span className="text-zinc-600 text-xs">•</span>
                          <span className="text-[10px] uppercase tracking-widest text-purple-400 font-black px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">{discussion.category}</span>
                        </div>
                        <button className="text-zinc-600 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                      </div>

                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{discussion.title}</h2>
                      <p className="text-sm text-zinc-400 mb-4 leading-relaxed line-clamp-2">{discussion.preview}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {discussion.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-bold tracking-wide text-zinc-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium hover:text-purple-400 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {discussion.replies} Replies
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="text-center py-8">
                <button className="text-xs font-black uppercase tracking-widest text-purple-400 border border-purple-500/30 bg-purple-500/10 px-6 py-3 rounded-xl hover:bg-purple-500/20 transition-colors">
                  Load More Discussions
                </button>
              </div>
            </motion.div>

            {/* Right Sidebar - Trending */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
              className="hidden xl:block w-72 flex-shrink-0"
            >
              <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2rem] p-6 sticky top-8 shadow-xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-pink-500" /> Trending Topics
                </h3>
                <div className="space-y-4">
                  {[
                    { tag: 'FinalsPrep', posts: 1.2 },
                    { tag: 'Reactjs', posts: 0.8 },
                    { tag: 'AI_Tools', posts: 2.4 },
                    { tag: 'MathHelp', posts: 0.5 },
                  ].map((topic, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div>
                        <p className="text-sm font-bold text-zinc-300 group-hover:text-pink-400 transition-colors">#{topic.tag}</p>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">{topic.posts}k discussions</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-pink-500/30 transition-colors">
                        <TrendingUp className="w-3 h-3 text-zinc-500 group-hover:text-pink-400" />
                      </div>
                    </div>
                  ))}
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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
)


export default Community;
