import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Routes, Route, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Clock, Calendar, ChevronRight,
  Tag, Share2, Heart, MessageSquare,
  Search, Filter, Sparkles, TrendingUp,
  BookOpen, Target, Brain, Zap, Shield, Globe,
  Database,
  Lock
} from 'lucide-react';
import logo from "@/components/logo/logo.png";
import { Helmet } from "react-helmet-async";
import { ALL_BLOG_POSTS as BLOG_POSTS } from "@/data/blogPosts";

const sanitizeBlogHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'base', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[#/]|(?:\.\.?\/))/i,
  });

const BlogList = () => {
  const [filter, setFilter] = React.useState('All');
  const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(p => p.category)))];

  const filteredPosts = filter === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      <Helmet>
        <title>Insights | MARGDARSHAK Elite Blog</title>
        <meta name="description" content="Deep dives into academic orchestration, cognitive science, and career acceleration for the modern scholar." />
      </Helmet>

      {/* Zenith Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />

        {/* Neural Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Header */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="p-2 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-all duration-500">
              <img src={logo} alt="Logo" className="h-6 w-6 object-contain" />
            </div>
            <span className="font-black text-xl tracking-tighter text-white uppercase italic">
              Margdarshak <span className="text-emerald-500 not-italic font-light">Insights</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1 bg-white/[0.02] p-1 rounded-2xl border border-white/10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Link to="/auth">
            <Button className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] tracking-widest uppercase h-10 px-6">
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
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Sparkles size={12} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Margdarshak Saarthi Activated</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] uppercase italic">
            <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">Margdarshak Insights</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 uppercase tracking-widest">
            ENGINEERING ACADEMIC EXCELLENCE THROUGH <span className="text-white italic">MARGDARSHAK INSIGHTS</span>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <Link to={`/blog/${post.id}`} className="block h-full">
                  <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.8rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-700 flex flex-col h-full group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                    {/* Image Container */}
                    <div className="h-64 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 opacity-60" />
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                      <div className="absolute top-6 left-6 z-20">
                        <span className="px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-[9px] text-white font-black uppercase tracking-widest">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-grow relative">
                      <div className="flex items-center gap-4 text-[9px] font-black tracking-widest text-zinc-600 mb-6 uppercase">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {post.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> {post.readTime}</span>
                      </div>

                      <h2 className="text-2xl font-black mb-4 text-white group-hover:text-emerald-400 transition-colors leading-tight uppercase italic tracking-tighter">
                        {post.title}
                      </h2>

                      <p className="text-zinc-500 text-sm font-medium mb-8 line-clamp-3 leading-relaxed flex-grow">
                        {post.excerpt}
                      </p>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-emerald-500/20">
                            {post.author.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{post.author}</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
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
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans">
      <h1 className="text-8xl font-black mb-4 text-emerald-500 tracking-tighter">404</h1>
      <p className="text-xl text-zinc-500 font-black uppercase tracking-[0.5em] mb-12">Transmission Lost</p>
      <Link to="/blog">
        <Button className="bg-white text-black font-black uppercase text-[10px] tracking-widest px-8 h-14 rounded-2xl hover:bg-zinc-200 transition-all">Return to Library</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      <Helmet>
        <title>{post.title} | MARGDARSHAK</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      {/* Reading Progress */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-emerald-500 z-[100] shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        initial={{ scaleX: 0 }}
        style={{ transformOrigin: "0%" }}
      />

      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/blog" className="flex items-center gap-3 text-zinc-500 hover:text-white transition-all group font-black text-[10px] tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
            Library Index
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 transition-all"><Share2 className="w-4 h-4 text-zinc-500 hover:text-emerald-400" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5 transition-all"><Heart className="w-4 h-4 text-zinc-500 hover:text-red-400" /></Button>
          </div>
        </div>
      </nav>

      {/* Zenith Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,20,15,1)_0%,rgba(5,5,5,1)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <article className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.4em] mb-10 uppercase"
          >
            <span className="text-emerald-400">{post.category}</span>
            <span className="text-zinc-800">/</span>
            <span className="text-zinc-500">{post.date}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-7xl font-black mb-12 leading-[1] tracking-tighter uppercase italic"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-8"
          >
            <div className="flex items-center gap-4 py-2.5 px-6 rounded-[1.5rem] bg-white/[0.03] border border-white/10 shadow-2xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-[10px] font-black shadow-lg shadow-emerald-500/20">
                {post.author.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-white uppercase tracking-widest">{post.author}</div>
                <div className="text-[8px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-0.5">Architectural Suite Dev</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-500" /> {post.readTime}
            </div>
          </motion.div>
        </header>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1 }}
          className="mb-20 rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl relative group"
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto transform group-hover:scale-105 transition-transform duration-[3s] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent pointer-events-none" />
        </motion.div>

        {/* Article Body */}
        <div
          className="prose prose-invert prose-zinc prose-2xl max-w-none 
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white prose-headings:uppercase prose-headings:italic
            prose-p:text-zinc-400 prose-p:font-medium prose-p:leading-[1.8]
            prose-strong:text-white prose-strong:font-black
            prose-ul:marker:text-emerald-500
            prose-blockquote:border-emerald-500 prose-blockquote:bg-white/[0.02] prose-blockquote:p-10 prose-blockquote:rounded-[2.5rem] prose-blockquote:not-italic prose-blockquote:border-l-4"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Newsletter / CTA */}
        <div className="mt-32 pt-20 border-t border-white/5">
          <div className="relative p-12 bg-white/[0.02] backdrop-blur-3xl rounded-[3.5rem] border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <Database size={10} className="text-emerald-400" />
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Global Intelligence Network</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Accelerate Your Intelligence</h3>
                <p className="text-zinc-500 font-medium text-lg leading-relaxed">Join the world's most ambitious scholars receiving cognitive optimization insights weekly.</p>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <Button className="h-16 px-12 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 active:scale-95">
                  INITIALIZE ENROLLMENT
                </Button>
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <Lock size={10} className="text-zinc-500" />
                  <p className="text-[8px] text-zinc-500 font-black tracking-widest uppercase">Secure Protocol • Zero Latency</p>
                </div>
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
