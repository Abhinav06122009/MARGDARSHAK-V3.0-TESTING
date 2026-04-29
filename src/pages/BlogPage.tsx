import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Routes, Route, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Clock, Calendar, ChevronRight,
  Tag, Share2, Heart, MessageSquare,
  Search, Filter, Sparkles, TrendingUp,
  BookOpen, Target, Brain, Zap, Shield, Globe
} from 'lucide-react';
import logo from "@/components/logo/logo.png";
import { Helmet } from "react-helmet-async";
import { ALL_BLOG_POSTS as BLOG_POSTS } from "@/data/blogPosts";


// --- Social Icons ---
const LinkedinLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);

const sanitizeBlogHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'base', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[#/]|(?:\.\.?\/))/i,
  });

// ==================================================================================
// 18 FRESH, HUMAN-CENTRIC LONG-FORM BLOG POSTS
// ==================================================================================

// Data imported from @/data/blogPosts


// ==================================================================================
// COMPONENT CODE
// ==================================================================================

const BlogList = () => {
  const [filter, setFilter] = React.useState('All');
  const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(p => p.category)))];

  const filteredPosts = filter === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30">
      <Helmet>
        <title>Insights | MARGDARSHAK Elite Blog</title>
        <meta name="description" content="Deep dives into academic orchestration, cognitive science, and career acceleration for the modern scholar." />
      </Helmet>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
      </div>

      {/* Header */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-transform group-hover:scale-110" />
            <span className="font-black text-xl tracking-tighter text-white">MARGDARSHAK <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-light">Insights</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === cat ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                  }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <Link to="/auth">
            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs">
              MEMBER ACCESS
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative py-32 px-6 text-center overflow-hidden z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-zinc-500 bg-clip-text text-transparent">Margdarshak Insights</span>
          </h1>
          <p className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Insights By Vsav Gyantapa Developer Team
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <main className="container mx-auto px-6 pb-32 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => (
              <motion.div
                layout
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative"
              >
                <Link to={`/blog/${post.id}`} className="block h-full">
                  <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 flex flex-col h-full group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                    {/* Image Container */}
                    <div className="h-64 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                      <div className="absolute top-6 left-6 z-20">
                        <span className="px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[10px] text-white font-black uppercase tracking-widest">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-grow relative">
                      <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-zinc-600 mb-6 uppercase">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> {post.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-purple-500" /> {post.readTime}</span>
                      </div>

                      <h2 className="text-2xl font-black mb-4 text-white group-hover:text-indigo-400 transition-colors leading-tight">
                        {post.title}
                      </h2>

                      <p className="text-zinc-500 text-sm font-medium mb-8 line-clamp-3 leading-relaxed flex-grow">
                        {post.excerpt}
                      </p>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg">
                            {post.author.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{post.author}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500">
                          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.id === slug);
  const sanitizedContent = React.useMemo(() => sanitizeBlogHtml(post?.content || ''), [post?.content]);

  if (!post) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center text-white font-sans">
      <h1 className="text-8xl font-black mb-4 text-indigo-500 tracking-tighter">404</h1>
      <p className="text-xl text-zinc-500 font-bold uppercase tracking-widest mb-12">Transmission Lost</p>
      <Link to="/blog">
        <Button className="bg-white text-black font-black uppercase text-xs tracking-widest px-8 h-14 rounded-2xl">Return to Insights</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30">
      <Helmet>
        <title>{post.title} | MARGDARSHAK</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      {/* Reading Progress */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-indigo-500 z-[100] shadow-[0_0_15px_#6366f1]"
        style={{ scaleX: 0, transformOrigin: "0%" }}
        whileInView={{ scaleX: 1 }}
      />

      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/blog" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-all group font-black text-[10px] tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Back to Library
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5"><Share2 className="w-4 h-4 text-zinc-500" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5"><Heart className="w-4 h-4 text-zinc-500" /></Button>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.4em] mb-10 uppercase"
          >
            <span className="text-indigo-400">{post.category}</span>
            <span className="text-zinc-800">/</span>
            <span className="text-zinc-500">{post.date}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-12 leading-[1.1] tracking-tighter"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-6"
          >
            <div className="flex items-center gap-3 py-2 px-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black">
                {post.author.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-white uppercase tracking-widest">{post.author}</div>
                <div className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">VSAV GYANTAPA DEV TEAM</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </div>
          </motion.div>
        </header>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="mb-20 rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl relative group"
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto transform group-hover:scale-105 transition-transform"
            style={{ transitionDuration: '2000ms' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </motion.div>

        {/* Article Body */}
        <div
          className="prose prose-invert prose-zinc prose-2xl max-w-none 
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
            prose-p:text-zinc-400 prose-p:font-medium prose-p:leading-[1.8]
            prose-strong:text-white prose-strong:font-black
            prose-ul:marker:text-indigo-500
            prose-blockquote:border-indigo-500 prose-blockquote:bg-white/5 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:not-italic"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Sidebar/Floating Elements */}
        <div className="mt-32 pt-20 border-t border-white/5">
          <div className="relative p-12 bg-zinc-950 rounded-[3rem] border border-white/10 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Accelerate Your Intelligence</h3>
                <p className="text-zinc-500 font-medium">Join 50,000+ modern scholars receiving modern academic insights every week.</p>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <Button className="h-16 px-10 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                  ENROLL NOW
                </Button>
                <p className="text-[8px] text-zinc-700 text-center font-bold tracking-widest uppercase italic">Secure • Encrypted • No Spam</p>
              </div>
            </div>
          </div>
        </div>
      </article>

    </div>
  );
};

const BlogPage = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route path="/:slug" element={<BlogPost />} />
    </Routes>
  );
};

export default BlogPage;
