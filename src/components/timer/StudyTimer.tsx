import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Play, Pause, RotateCcw, Brain, Target, Zap, Shield, Sparkles, Rocket,
  Coffee, Timer as TimerIcon, Bell, Settings, ChevronRight, MessageSquare,
  Twitter, Facebook, Linkedin, ArrowLeft, Mail, MapPin, Headphones, Globe,
  BrainCircuit, CheckCircle2, Activity, Info, Command, Home
} from 'lucide-react';

import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/components/logo/logo.png";

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

// --- Types ---
type Mode = "focus" | "short" | "long";

type Settings = {
  focusMin: number;
  shortMin: number;
  longMin: number;
  longEvery: number;
};

const DEFAULTS: Settings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
};

// --- Helpers ---
function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatClock(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function getModeConfig(mode: Mode) {
  switch (mode) {
    case 'focus': return { color: '#8b5cf6', label: 'DEEP_FOCUS', icon: BrainCircuit, desc: 'Focus Timer' };
    case 'short': return { color: '#10b981', label: 'SHORT_BREAK', icon: Coffee, desc: 'Refreshing For New Session' };
    case 'long': return { color: '#3b82f6', label: 'LONG_BREAK', icon: Target, desc: 'Strategic Long Break' };
  }
}

// --- Sub-Components ---

const Stepper = ({ label, value, unit = "min", onChange }: { label: string; value: number; unit?: string; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</span>
      <span className="text-white font-bold tracking-tight">
        {value} <span className="text-zinc-500 text-xs font-normal">{unit}</span>
      </span>
    </div>
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(value - 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
      >
        –
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
      >
        +
      </motion.button>
    </div>
  </div>
);

// --- Main Component ---

export default function StudyTimer({ initial, size = 320 }: { initial?: Partial<Settings>; size?: number }) {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS, ...initial });
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalSeconds = useMemo(() => {
    if (mode === "focus") return settings.focusMin * 60;
    if (mode === "short") return settings.shortMin * 60;
    return settings.longMin * 60;
  }, [mode, settings]);

  const [remaining, setRemaining] = useState(totalSeconds);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = running
      ? `(${formatClock(remaining)}) ${mode.toUpperCase()}`
      : "MARGDARSHAK | Timer";
  }, [remaining, running, mode]);

  const prevTotalRef = useRef(totalSeconds);
  const prevModeRef = useRef(mode);

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      setRemaining(totalSeconds);
      setRunning(false);
      prevModeRef.current = mode;
      prevTotalRef.current = totalSeconds;
      return;
    }
    if (prevTotalRef.current !== totalSeconds) {
      setRemaining(totalSeconds);
      setRunning(false);
      prevTotalRef.current = totalSeconds;
    }
  }, [totalSeconds, mode]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const playAlert = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } catch (e) { console.error("Audio play failed", e); }
  };

  useEffect(() => {
    if (running) {
      timerRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            playAlert();
            if (mode === "focus") {
              const nextCount = completedFocus + 1;
              setCompletedFocus(nextCount);
              const isLongBreak = nextCount % settings.longEvery === 0;
              if (isLongBreak) {
                setMode("long");
                toast.success("Focus cycle complete. Commencing Long Break.");
              } else {
                setMode("short");
                toast.success("Focus block complete. Rapid recovery initiated.");
              }
            } else {
              setMode("focus");
              toast.info("Recovery complete. Ready For Next Focus Session.");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, mode, settings, completedFocus]);

  // Keyboard Support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setRunning(!running);
      }
      if (e.code === "KeyR") {
        setRunning(false);
        setRemaining(totalSeconds);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running, totalSeconds]);

  const progress = Math.max(0, Math.min(1, 1 - remaining / totalSeconds));
  const modeConfig = getModeConfig(mode);
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden font-sans">

      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px]"
          style={{ backgroundColor: modeConfig.color }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
      </div>

      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.4)]" />
            <span className="font-black tracking-tighter text-xl text-white">MARGDARSHAK</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Blocks: {completedFocus}</span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 hover:bg-white/10" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-6 py-12 flex flex-col items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          {/* Main Timer Display */}
          <Card className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] p-12 relative">
            {/* Header */}
            <div className="flex flex-col items-center mb-16 text-center">
              <motion.div
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl mb-4"
              >
                <modeConfig.icon className="w-4 h-4" style={{ color: modeConfig.color }} />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">{modeConfig.label}</span>
              </motion.div>
              <h2 className="text-zinc-500 text-sm font-medium tracking-tight uppercase">{modeConfig.desc}</h2>
            </div>

            {/* The Clock Core */}
            <div className="relative flex items-center justify-center mb-16">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 scale-110">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={stroke} />
                <motion.circle
                  cx={size / 2} cy={size / 2} r={radius} fill="none"
                  stroke={modeConfig.color} strokeWidth={stroke}
                  strokeLinecap="round" strokeDasharray={circumference}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1, ease: "linear" }}
                  style={{ filter: `drop-shadow(0 0 15px ${modeConfig.color})` }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  key={remaining}
                  className="text-[100px] font-black font-mono tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {formatClock(remaining)}
                </motion.div>

                {/* Status Dots */}
                <div className="flex gap-2.5 mt-4">
                  {Array.from({ length: settings.longEvery }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: i < (completedFocus % settings.longEvery) ? 1.2 : 1,
                        opacity: i < (completedFocus % settings.longEvery) ? 1 : 0.2,
                        backgroundColor: i < (completedFocus % settings.longEvery) ? modeConfig.color : '#ffffff'
                      }}
                      className="w-2.5 h-1 rounded-full shadow-lg transition-colors"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRunning(!running)}
                className={`flex-1 h-20 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl ${running ? 'bg-zinc-900 text-white border border-white/10' : 'bg-white text-black'
                  }`}
              >
                {running ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {running ? "Pause" : "Start"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, rotate: -20 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setRunning(false); setRemaining(totalSeconds); }}
                className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all group"
              >
                <RotateCcw className="w-6 h-6 group-hover:rotate-[-45deg] transition-transform" />
              </motion.button>
            </div>
          </Card>

          {/* Tips Section */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
              <Activity className="w-5 h-5 text-purple-400 mb-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tip</h4>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">Stay hydrated during focus blocks to maintain synaptic efficiency.</p>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
              <Shield className="w-5 h-5 text-emerald-400 mb-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Protocol</h4>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed">Notifications are suppressed to ensure No Distraction focus.</p>
            </div>
          </div>
        </motion.div>
      </main>



      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Timer Setting</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <Stepper label="DEEP_FOCUS" value={settings.focusMin} onChange={(v) => setSettings(s => ({ ...s, focusMin: clampInt(v, 1, 120) }))} />
                <Stepper label="SHORT_BREAK" value={settings.shortMin} onChange={(v) => setSettings(s => ({ ...s, shortMin: clampInt(v, 1, 30) }))} />
                <Stepper label="LONG_BREAK" value={settings.longMin} onChange={(v) => setSettings(s => ({ ...s, longMin: clampInt(v, 1, 60) }))} />
                <Stepper label="CYCLE_COUNT" value={settings.longEvery} unit="" onChange={(v) => setSettings(s => ({ ...s, longEvery: clampInt(v, 1, 10) }))} />
              </div>

              <div className="mt-10">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="w-full h-16 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-colors"
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
}
