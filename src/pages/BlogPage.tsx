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

const BLOG_POSTS = [
  {
    id: 'building-a-second-brain-for-students',
    title: 'Mastering the Digital Mind: How to Build a Second Brain for Students',
    excerpt: 'The modern student is drowning in information. Discover Tiago Forte’s CODE framework and how to build a digital system that remembers everything for you.',
    image: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=1000',
    date: 'April 25, 2026',
    readTime: '12 min read',
    category: 'Productivity',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">We live in an era where we consume more information in a single day than our ancestors did in a lifetime. For a student, this is both a blessing and a curse. You have the world's knowledge at your fingertips, but you're also perpetually overwhelmed.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The Problem: Biological Memory is Fragile</h2><p class="mb-6 text-zinc-300">Think about the last brilliant lecture you attended. How much of it do you remember today? Probably less than 10%. This is the "Forgetting Curve" in action. A Second Brain is an external, digital repository of your knowledge—a system that captures, organizes, and retrieves information so your biological brain can focus on what it does best: creative thinking.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The CODE Framework</h2><p class="mb-6 text-zinc-300">To build an effective Second Brain, we follow the CODE system: Capture, Organize, Distill, and Express. By offloading the "storage" of your academic life to a digital system, you free up the bandwidth to actually *learn*.</p>`
  },
  {
    id: 'ai-powered-learning-future-2026',
    title: 'AI-Powered Learning: The Future of Academic Success in 2026',
    excerpt: 'AI is no longer a cheating tool; it’s a personalized tutor. Learn how to use Large Language Models to simulate Socratic debate and master complex topics.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
    date: 'April 20, 2026',
    readTime: '10 min read',
    category: 'AI & Tech',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">The panic about AI in schools is shifting. We are moving from "How do we stop them from using it?" to "How do we teach them to use it brilliantly?" In 2026, AI is the ultimate equalizer in education.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The Personal Socratic Tutor</h2><p class="mb-6 text-zinc-300">The most effective way to learn is not by reading, but by being questioned. You can now prompt AI to act as a Socratic tutor. Instead of asking for the answer, ask it to "Guide me through solving this Physics problem by asking me one leading question at a time." This forces you to think deeper, not just output faster.</p>`
  },
  {
    id: 'networking-matters-more-than-gpa',
    title: 'Beyond the Grade: Why Networking in College Matters More Than Your GPA',
    excerpt: 'The "lonely scholar" is a myth. Discover why your peers are your most valuable resource and how to build a professional network before you graduate.',
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=1000',
    date: 'April 15, 2026',
    readTime: '8 min read',
    category: 'Career',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">It’s a hard pill to swallow: A 4.0 GPA with zero connections often loses to a 3.2 GPA with a solid network. This isn't unfair—it's how the professional world functions. Trust is the currency of the economy.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Horizontal Networking</h2><p class="mb-6 text-zinc-300">Most students think networking means talking to CEOs. Wrong. Networking is talking to the person sitting next to you in Chemistry. In 10 years, they will be the project managers, engineers, and founders who will hire you or partner with you.</p>`
  },
  {
    id: 'science-of-sleep-midnight-cramming',
    title: 'The Science of Sleep: Why Midnight Cramming is Your Worst Enemy',
    excerpt: 'Pulling an all-nighter? You might be sabotaging your memory. Learn why sleep is the final step of the learning process.',
    image: 'https://images.unsplash.com/photo-1541781777621-af2ea27520ce?auto=format&fit=crop&q=80&w=1000',
    date: 'April 10, 2026',
    readTime: '9 min read',
    category: 'Health',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">The "all-nighter" is a toxic badge of honor. When you stay up all night, you are essentially telling your brain to discard everything you studied that day.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Memory Consolidation</h2><p class="mb-6 text-zinc-300">During sleep, your brain moves information from the hippocampus (temporary storage) to the neocortex (long-term storage). If you don't sleep, that transfer never happens. You might remember enough for the test, but it will be gone 48 hours later.</p>`
  },
  {
    id: 'productivity-paradox-doing-less',
    title: 'Productivity Paradox: Why Doing Less Often Leads to Better Grades',
    excerpt: 'Busyness is not productivity. Learn the art of strategic quitting and how to focus on the 20% of work that yields 80% of your results.',
    image: 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&q=80&w=1000',
    date: 'April 05, 2026',
    readTime: '7 min read',
    category: 'Productivity',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">We are obsessed with "doing more." More clubs, more electives, more study hours. But volume is a poor substitute for intensity. Doing less—but doing it with total focus—is the secret of the elite student.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The Pareto Principle (80/20 Rule)</h2><p class="mb-6 text-zinc-300">80% of your exam marks come from 20% of the material. Identify that 20% early. Master the core concepts before you even look at the edge cases. Say no to distractions and protect your time.</p>`
  },
  {
    id: 'financial-literacy-modern-student',
    title: 'Financial Literacy 101: How to Manage Your Money as a Student',
    excerpt: 'Student debt is a weight, but financial literacy is a superpower. Learn how to budget, save, and understand credit before you graduate.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000',
    date: 'March 30, 2026',
    readTime: '11 min read',
    category: 'Life Skills',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">You can have a 4.0 GPA, but if you graduate with massive debt and no understanding of interest rates, you're starting the race with lead weights on your feet.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The 50/30/20 Rule</h2><p class="mb-6 text-zinc-300">Allocate your income: 50% for Needs, 30% for Wants, and 20% for Savings. Time is your biggest ally—investing early builds the habit of wealth creation and gives you a head start in life.</p>`
  },
  {
    id: 'overcoming-imposter-syndrome',
    title: 'Overcoming Imposter Syndrome: Navigating Academic Pressure',
    excerpt: 'Feeling like a fraud in an elite environment? You aren’t alone. Learn the psychological tools to build authentic confidence.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1000',
    date: 'March 25, 2026',
    readTime: '9 min read',
    category: 'Mental Health',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">You look around the room and think, "They made a mistake. I don't belong here." This is Imposter Syndrome, and it's common among high achievers.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The Comparison Trap</h2><p class="mb-6 text-zinc-300">You are comparing your "behind-the-scenes" with everyone else's "highlight reel." Shift from "I'm not smart enough" to "I haven't mastered this yet." View challenges as data points for improvement.</p>`
  },
  {
    id: 'art-of-the-internship-dream-role',
    title: 'The Art of the Internship: How to Land Your Dream Role',
    excerpt: 'Don’t just apply online. Learn the "backdoor" strategies to get noticed by recruiters at top companies.',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1000',
    date: 'March 20, 2026',
    readTime: '10 min read',
    category: 'Career',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Applying through portals is a lottery. To win, you need to stop acting like a number and start acting like a person.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The Portfolio Project</h2><p class="mb-6 text-zinc-300">Don't tell them what you can do. Show them what you have done. Build a project that solves a real-world problem. This "proof of work" is more valuable than any line on a resume.</p>`
  },
  {
    id: 'digital-detox-reclaiming-focus',
    title: 'Digital Detox: Reclaiming Your Focus in a Distracted World',
    excerpt: 'Your attention is being sold to the highest bidder. Learn how to reclaim your cognitive sovereignty and study with deep focus.',
    image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=1000',
    date: 'March 15, 2026',
    readTime: '8 min read',
    category: 'Productivity',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Every notification is a micro-interruption that costs you 20 minutes of focus. Reclaiming your attention is the most valuable skill you can possess.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">The Phone Jail</h2><p class="mb-6 text-zinc-300">If your phone is in the same room, you are losing IQ points. Put it in another room during study blocks. Aim for 90 minutes of total isolation to achieve deep work and peak cognitive performance.</p>`
  },
  {
    id: 'polymath-approach-diverse-skills',
    title: 'The Polymath Approach: Why Diverse Skills are Your Competitive Advantage',
    excerpt: 'Being "just an engineer" or "just a writer" is a risk. Learn why stacking diverse skills makes you irreplaceable.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000',
    date: 'March 10, 2026',
    readTime: '9 min read',
    category: 'Career',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">In a world where AI can do specialized tasks, the human advantage is synthesis—combining ideas from different fields to solve complex problems.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Skill Stacking</h2><p class="mb-6 text-zinc-300">You don't need to be the #1 in the world at one thing. You can be in the top 25% at three things. If you are good at Math, Writing, and Design, you are a rare asset that is hard to replace.</p>`
  },
  {
    id: 'note-taking-mastery-cornell-to-visual',
    title: 'Note-Taking Mastery: From Cornell Method to Visual Mapping',
    excerpt: 'Stop transcribing lectures. Learn the systems that actually help you retain information and prepare for exams.',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1000',
    date: 'March 05, 2026',
    readTime: '10 min read',
    category: 'Study Hacks',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Notes should be a "thinking tool," not a "recording tool." Linear notes are often useless for complex subjects.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Visual Mapping</h2><p class="mb-6 text-zinc-300">Visual maps show the relationship between ideas. Your brain thinks in networks, so map your knowledge accordingly for better retention. This helps in understanding the big picture and how concepts connect.</p>`
  },
  {
    id: 'stoic-student-philosophy-burnout',
    title: 'The Stoic Student: How Ancient Philosophy Can Solve Modern Burnout',
    excerpt: 'Exam stress is nothing new. Learn how Marcus Aurelius and Epictetus can help you navigate academic pressure.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=1000',
    date: 'February 28, 2026',
    readTime: '11 min read',
    category: 'Wellness',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Stoicism isn't about suppressing emotion; it's about the Dichotomy of Control—knowing what you can and cannot influence.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Internal Focus</h2><p class="mb-6 text-zinc-300">You cannot control the exam paper, but you can control your preparation. Focus on the internal process, and academic anxiety loses its power. Burnout vanishes when you stop worrying about things outside your control.</p>`
  },
  {
    id: 'deep-work-vs-shallow-study',
    title: 'Deep Work: Why 2 Hours of Focus Beats 8 Hours of Multi-tasking',
    excerpt: 'In an age of constant notification, focus is a superpower. Discover strategies for achieving a state of flow.',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1000',
    date: 'February 20, 2026',
    readTime: '14 min read',
    category: 'Productivity',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Deep work is the ability to focus without distraction on a cognitively demanding task. Most students spend hours in "shallow" work.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Intensity Matters</h2><p class="mb-6 text-zinc-300">By eliminating distractions, you can achieve more in two hours than others do in a day. Your brain needs time to ramp up to peak performance—don't reset that timer by checking your phone or emails.</p>`
  },
  {
    id: 'side-hustle-academic-balance',
    title: 'The Art of the Side Hustle: Balancing Academics with Ambition',
    excerpt: 'Can you build a business while getting a degree? Exploring the reality of student entrepreneurship.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000',
    date: 'February 15, 2026',
    readTime: '13 min read',
    category: 'Career',
    author: 'Abhinav Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">The most successful graduates are often those who built something while in school. It's about ruthless prioritization, not hustle culture.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Real-World Experience</h2><p class="mb-6 text-zinc-300">Use your academic projects as testing grounds for your business ideas. Real-world experience is the best supplement to any degree. It shows initiative and practical skill that employers highly value.</p>`
  },
  {
    id: 'curiosity-led-learning-advantage',
    title: 'Beyond the Textbook: Why Curiosity is Your Unfair Advantage',
    excerpt: 'True innovation is built on curiosity. Learn why following your interests leads to original ideas.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000',
    date: 'February 10, 2026',
    readTime: '10 min read',
    category: 'Learning',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Standardized education is built for compliance, but true innovation is built on curiosity. Learning stops being a chore when it becomes an adventure.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Follow the Rabbit Hole</h2><p class="mb-6 text-zinc-300">Don't just read what's assigned; follow your interests. A student who understands multiple fields is 10x more valuable than one who only knows the syllabus. Curiosity is the compass that points toward original ideas.</p>`
  },
  {
    id: 'mental-health-machine-age',
    title: 'Mental Health in the Machine Age: Protecting Your Mind',
    excerpt: 'As we integrate AI into our lives, how do we protect our well-being? Tips for staying grounded.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000',
    date: 'February 05, 2026',
    readTime: '12 min read',
    category: 'Wellness',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">AI can plan your week, but it can't feel your stress. We must not outsource our humanity to our tools.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Human Connection</h2><p class="mb-6 text-zinc-300">Set boundaries with technology and practice Digital Sabbaths. Your worth is not defined by productivity. Use AI for mundane tasks to free up time for human connection and nature, which are essential for well-being.</p>`
  },
  {
    id: 'goal-setting-vs-system-building-restored',
    title: 'Systems Over Goals: Why Resolutions Always Fail',
    excerpt: 'Goals are about results; systems are about processes. Learn why systems are the secret to consistency.',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000',
    date: 'February 01, 2026',
    readTime: '9 min read',
    category: 'Productivity',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Goals are temporary states, while systems are repeatable processes. If you want to win repeatedly, focus on the system.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Consistency is Key</h2><p class="mb-6 text-zinc-300">Don't rely on willpower; design your environment to make good habits easy. A goal is winning once; a system is being a winner every day. Transition your focus from outcomes to habits for lasting success.</p>`
  },
  {
    id: 'group-project-leadership-success',
    title: 'Collaborative Learning: Succeeding in Group Projects',
    excerpt: 'Group projects are simulations of the corporate world. Learn frameworks to turn teams into high-performing units.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000',
    date: 'January 25, 2026',
    readTime: '9 min read',
    category: 'Life Skills',
    author: 'Vaibhavi Jha',
    content: `<p class="lead text-xl text-zinc-300 mb-8">Technical parts of a project are easy; the "people part" is where projects fail. Group work is a vital life skill.</p><h2 class="text-2xl font-bold text-white mt-10 mb-6">Accountability</h2><p class="mb-6 text-zinc-300">Establish clear ownership and norms early. Setting expectations prevents resentment and ensures everyone knows their responsibility. High-performing teams are built on communication and accountability.</p>`
  }
];

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

      <footer className="relative bg-black border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MARGDARSHAK</span>
                </h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] mt-1">by VSAV GYANTAPA</p>
              </motion.div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                Empowering students with AI-driven scheduling and intelligent academic orchestration. Built for the next generation of learners.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
                  { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
                  { icon: LinkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
                ].map((social, i) => (
                  <motion.a
                    key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -4 }} whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  { name: "Scheduler", href: "/timetable" },
                  { name: "AI Assistant", href: "/ai-assistant" },
                  { name: "Quiz Gen", href: "/quiz" },
                  { name: "Wellness", href: "/wellness" }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Cookie Policy", href: "/cookies" },
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Contact Us", href: "/contact" }
                ]
              }
            ].map((section, i) => (
              <div key={i} className="space-y-8">
                <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold flex items-center group">
                        <motion.span whileHover={{ x: 4 }} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                          {link.name.toUpperCase()}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 <span className="text-white font-bold">VSAV GYANTAPA</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6">

              <p className="text-zinc-600 text-[10px] font-black tracking-widest">Version 3.0</p>
            </div>
          </div>
        </div>
      </footer>
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

      {/* Shared Premium Footer */}
      <footer className="relative bg-black border-t border-white/5 mt-32">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MARGDARSHAK</span>
                </h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.3em] mt-1">by VSAV GYANTAPA</p>
              </motion.div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                Empowering students with AI-driven scheduling and intelligent academic orchestration. Built for the next generation of learners.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
                  { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
                  { icon: LinkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
                ].map((social, i) => (
                  <motion.a
                    key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -4 }} whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-zinc-400 hover:text-white"
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Platform",
                links: [
                  { name: "Scheduler", href: "/timetable" },
                  { name: "AI Assistant", href: "/ai-assistant" },
                  { name: "Quiz Gen", href: "/quiz" },
                  { name: "Wellness", href: "/wellness" }
                ]
              },
              {
                title: "Legal",
                links: [
                  { name: "Terms of Service", href: "/terms" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Cookie Policy", href: "/cookies" },
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Contact Us", href: "/contact" }
                ]
              }
            ].map((section, i) => (
              <div key={i} className="space-y-8">
                <h4 className="text-white font-black text-xs uppercase tracking-[0.3em]">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.href} className="text-zinc-500 hover:text-white transition-colors text-xs font-bold flex items-center group">
                        <motion.span whileHover={{ x: 4 }} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                          {link.name.toUpperCase()}
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 <span className="text-white font-bold">VSAV GYANTAPA</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6">

              <p className="text-zinc-600 text-[10px] font-black tracking-widest">Version 3.0</p>
            </div>
          </div>
        </div>
      </footer>
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
