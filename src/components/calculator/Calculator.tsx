import React, { useState, useEffect, useRef, useMemo, useReducer, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, ResponsiveContainer
} from 'recharts';
import {
  History, Settings, RotateCcw, ArrowLeft,
  Zap, Shield, Target, Users, Sparkles,
  Command, Cpu, Globe, Info, LineChart as ChartIcon,
  BarChart3, Binary, Hash, ChevronRight,
  TrendingUp, Activity
} from 'lucide-react';
import logo from "@/components/logo/logo.png";

// --- THEMES ---
const THEMES = {
  premium: {
    bg: 'bg-[#030303]',
    accent: 'purple-500',
    display: 'from-purple-500/5 to-blue-500/5',
    btn: {
      num: 'bg-white/[0.03] border-white/5 text-zinc-100 hover:bg-white/[0.08]',
      op: 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      fn: 'bg-white/[0.01] border-white/5 text-purple-400 hover:bg-purple-500/10'
    }
  }
};

// --- LOGIC ---
const SCIENTIFIC_OPS = {
  sin: (x, d) => Math.sin(d ? x * Math.PI / 180 : x),
  cos: (x, d) => Math.cos(d ? x * Math.PI / 180 : x),
  tan: (x, d) => Math.tan(d ? x * Math.PI / 180 : x),
  ln: Math.log,
  log: Math.log10,
  '√': Math.sqrt,
  'x²': x => x * x,
  'x³': x => x ** 3,
  'e': () => Math.E,
  'π': () => Math.PI,
  '|x|': Math.abs,
  '1/x': x => 1 / x,
  'x!': n => {
    if (n < 0) return NaN;
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  }
};

const isPrime = (num) => {
  const n = Math.abs(num);
  if (n <= 1) return false;
  for (let i = 2, s = Math.sqrt(n); i <= s; i++) if (n % i === 0) return false;
  return true;
};

const getFactors = (num) => {
  const n = Math.abs(num);
  const factors = [];
  for (let i = 1; i <= Math.min(n, 1000); i++) if (n % i === 0) factors.push(i);
  return factors.slice(0, 12);
};

const initialState = {
  display: '0',
  prev: null,
  op: null,
  waiting: false,
  history: [],
  memory: 0,
  error: '',
  lastPressed: ''
};

function calcReducer(state, action) {
  const { type, payload } = action;
  const current = parseFloat(state.display.replace(/,/g, ''));

  switch (type) {
    case 'DIGIT':
      if (state.display.length >= 20) return state;
      const newVal = state.waiting || state.display === '0' ? payload : state.display + payload;
      return { ...state, display: newVal, waiting: false, error: '', lastPressed: payload };

    case 'OP':
      if (state.op && !state.waiting && state.prev !== null) {
        const result = calculate(state.prev, current, state.op);
        return {
          ...state,
          display: String(result),
          prev: result,
          op: payload,
          waiting: true,
          history: addToHistory(state.history, state.prev, state.op, current, result),
          lastPressed: payload
        };
      }
      return { ...state, prev: current, op: payload, waiting: true, lastPressed: payload };

    case 'EQUALS':
      if (!state.op || state.prev === null) return state;
      const res = calculate(state.prev, current, state.op);
      return {
        ...state,
        display: String(res),
        prev: null,
        op: null,
        waiting: true,
        history: addToHistory(state.history, state.prev, state.op, current, res),
        lastPressed: '='
      };

    case 'CLEAR':
      return { ...initialState, history: state.history, memory: state.memory, lastPressed: 'C' };

    case 'SCI':
      const sciRes = typeof SCIENTIFIC_OPS[payload] === 'function'
        ? SCIENTIFIC_OPS[payload](current, action.isDeg)
        : SCIENTIFIC_OPS[payload];
      return { ...state, display: String(sciRes), waiting: true, lastPressed: payload };

    case 'MEM':
      let mem = state.memory;
      if (payload === 'MC') mem = 0;
      if (payload === 'M+') mem += current;
      if (payload === 'M-') mem -= current;
      if (payload === 'MS') mem = current;
      if (payload === 'MR') return { ...state, display: String(mem), waiting: true };
      return { ...state, memory: mem };

    case 'SET_DISPLAY':
      return { ...state, display: payload };

    case 'RESTORE':
      return { ...state, ...payload };

    default: return state;
  }
}

const calculate = (a, b, op) => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    case '%': return a % b;
    case '^': return Math.pow(a, b);
    default: return b;
  }
};

const addToHistory = (hist, a, op, b, res) => [
  { id: Date.now().toString(), expression: `${a} ${op} ${b}`, result: String(res) },
  ...hist
].slice(0, 19);

// --- UI COMPONENTS ---
const ParticleBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/40 rounded-full"
        initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
        animate={{ y: ['-10%', '110%'], opacity: [0, 0.5, 0] }}
        transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
      />
    ))}
  </div>
);

const Calculator = () => {
  const [state, dispatch] = useReducer(calcReducer, initialState);
  const [mode, setMode] = useState('scientific');
  const [activeTab, setActiveTab] = useState('core');
  const [graphFunc, setGraphFunc] = useState('sin(x) * 10');
  const [settings, setSettings] = useState({ angle: 'deg', prec: 8, sciNot: false, sound: true, haptic: true });

  const [ui, setUi] = useState({ showSettings: false });

  // --- Graph Plotting Logic ---
  const graphData = useMemo(() => {
    const data = [];
    try {
      const funcBody = graphFunc
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/\^/g, '**')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      for (let x = -10; x <= 10; x += 0.2) {
        // eslint-disable-next-line no-new-func
        const y = new Function('x', `return ${funcBody}`)(x);
        if (!isNaN(y) && isFinite(y)) data.push({ x: x.toFixed(1), y });
      }
    } catch (e) { return []; }
    return data;
  }, [graphFunc]);

  const handleInput = (btn) => {
    if (btn.type === 'number') dispatch({ type: 'DIGIT', payload: btn.label });
    else if (btn.type === 'operation') dispatch({ type: 'OP', payload: btn.label });
    else if (btn.type === 'equals') dispatch({ type: 'EQUALS' });
    else if (btn.type === 'clear') dispatch({ type: 'CLEAR' });
    else if (btn.type === 'scientific') dispatch({ type: 'SCI', payload: btn.label, isDeg: settings.angle === 'deg' });
    else if (btn.type === 'memory') dispatch({ type: 'MEM', payload: btn.label });
    else if (btn.type === 'decimal') { if (!state.display.includes('.')) dispatch({ type: 'DIGIT', payload: '.' }); }
    else if (btn.type === 'function') {
      if (btn.label === '±') dispatch({ type: 'SET_DISPLAY', payload: String(parseFloat(state.display) * -1) });
      if (btn.label === '%') dispatch({ type: 'SET_DISPLAY', payload: String(parseFloat(state.display) / 100) });
    }
  };

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in the Graph Input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;

      // Number keys
      if (/[0-9]/.test(key)) {
        handleInput({ type: 'number', label: key });
        return;
      }

      // Operation keys
      const opMap: Record<string, string> = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷',
        'x': '×',
        '^': '^'
      };
      if (opMap[key]) {
        handleInput({ type: 'operation', label: opMap[key] });
        return;
      }

      // Special keys
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleInput({ type: 'equals' });
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        handleInput({ type: 'clear' });
      } else if (key === '.') {
        handleInput({ type: 'decimal' });
      } else if (key === 'Backspace') {
        const current = state.display;
        if (current.length > 1) {
          dispatch({ type: 'SET_DISPLAY', payload: current.slice(0, -1) });
        } else {
          dispatch({ type: 'SET_DISPLAY', payload: '0' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.display, handleInput]);

  const buttons = useMemo(() => {
    const sci = [
      ['2nd', 'fn'], [settings.angle.toUpperCase(), 'fn'], ['sin', 'sci'], ['cos', 'sci'], ['tan', 'sci'],
      ['ln', 'sci'], ['log', 'sci'], ['x!', 'sci'], ['(', 'fn'], [')', 'fn'],
      ['MC', 'mem'], ['MR', 'mem'], ['M+', 'mem'], ['M-', 'mem'], ['MS', 'mem'],
      ['C', 'clear'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'],
      ['x²', 'sci'], ['7', 'num'], ['8', 'num'], ['9', 'num'], ['×', 'op'],
      ['√', 'sci'], ['4', 'num'], ['5', 'num'], ['6', 'num'], ['-', 'op'],
      ['π', 'sci'], ['1', 'num'], ['2', 'num'], ['3', 'num'], ['+', 'op'],
      ['e', 'sci'], ['0', 'num', 2], ['.', 'dec'], ['=', 'equals']
    ];
    const std = [
      ['C', 'clear'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'],
      ['7', 'num'], ['8', 'num'], ['9', 'num'], ['×', 'op'],
      ['4', 'num'], ['5', 'num'], ['6', 'num'], ['-', 'op'],
      ['1', 'num'], ['2', 'num'], ['3', 'num'], ['+', 'op'],
      ['0', 'num', 2], ['.', 'dec'], ['=', 'equals']
    ];
    return (mode === 'scientific' ? sci : std).map(([label, type, span]) => ({
      label, type: type === 'num' ? 'number' : type === 'dec' ? 'decimal' : type === 'fn' ? 'function' : type === 'sci' ? 'scientific' : type === 'mem' ? 'memory' : type === 'op' ? 'operation' : type,
      span
    }));
  }, [mode, settings.angle]);

  const currentVal = parseFloat(state.display) || 0;

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col relative overflow-hidden font-sans">
      <ParticleBackground />

      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
            <span className="font-black tracking-tighter text-xl text-white">MARGDARSHAK</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setUi(p => ({ ...p, showSettings: !p.showSettings }))}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full max-w-7xl grid lg:grid-cols-12 gap-8 items-start">

          {/* Main Calculator Unit */}
          <div className="lg:col-span-7">
            <Card className="bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
              <div className="p-12 text-right bg-gradient-to-b from-purple-500/10 to-transparent border-b border-white/5 min-h-[240px] flex flex-col justify-end">
                <AnimatePresence>
                  {state.op && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl text-purple-400/40 font-mono mb-4">
                      {state.prev} <span className="text-white">{state.op}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter break-all text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  {state.display}
                </div>

                <div className="flex justify-between mt-8">
                  <div className="flex gap-3">

                    <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[10px] font-black tracking-widest text-purple-400 uppercase">{mode}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 relative">
                {/* Settings Overlay */}
                <AnimatePresence>
                  {ui.showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-0 z-20 bg-[#0A0A0A] p-10 flex flex-col rounded-b-[3rem]"
                    >
                      <div className="flex justify-between items-center mb-10">
                        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-400">Settings</h3>
                        <Button variant="ghost" size="icon" onClick={() => setUi(p => ({ ...p, showSettings: false }))}><RotateCcw className="w-5 h-5" /></Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { label: 'Calculator Mode', value: mode.toUpperCase(), action: () => setMode(m => m === 'scientific' ? 'standard' : 'scientific'), icon: Activity },
                          { label: 'Angle', value: settings.angle.toUpperCase(), action: () => setSettings(s => ({ ...s, angle: s.angle === 'deg' ? 'rad' : 'deg' })), icon: Globe },
                          { label: 'Feedback', value: settings.haptic ? 'ENABLED' : 'DISABLED', action: () => setSettings(s => ({ ...s, haptic: !s.haptic })), icon: Zap },
                          { label: 'Signals', value: settings.sound ? 'ENABLED' : 'DISABLED', action: () => setSettings(s => ({ ...s, sound: !s.sound })), icon: Command },
                        ].map((opt, i) => (
                          <button
                            key={i}
                            onClick={opt.action}
                            className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] flex items-center justify-between hover:bg-white/[0.06] transition-all group"
                          >
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <opt.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{opt.label}</p>
                                <p className="font-bold text-white tracking-tight">{opt.value}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="grid grid-cols-5 gap-3">
                  {buttons.map((btn, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInput(btn)}
                      className={`
                        ${btn.span === 2 ? 'col-span-2' : ''} 
                        ${btn.type === 'number' ? 'bg-white/[0.04] border-white/5 text-zinc-100 hover:bg-white/[0.08]' : btn.type === 'operation' || btn.type === 'equals' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'bg-white/[0.01] border-white/5 text-purple-400'}
                        h-16 md:h-20 rounded-3xl text-xl font-bold flex items-center justify-center border transition-all
                      `}
                    >
                      {btn.label}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Utility Panel (Tabs) */}
          <div className="lg:col-span-5 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-zinc-900/50 p-1.5 rounded-3xl border border-white/10 h-16">
                <TabsTrigger value="core" className="flex-1 rounded-2xl data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all font-bold">
                  <BarChart3 className="w-4 h-4 mr-2" /> ANALYTICS
                </TabsTrigger>
                <TabsTrigger value="graph" className="flex-1 rounded-2xl data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all font-bold">
                  <ChartIcon className="w-4 h-4 mr-2" /> PLOTTER
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="core">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <Card className="bg-zinc-900/40 border-white/10 p-8 rounded-[2.5rem]">
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 flex items-center gap-3">
                        <Activity className="w-4 h-4" /> MATHS MANAGER
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'PRIME', value: isPrime(currentVal) ? 'TRUE' : 'FALSE', icon: Hash, color: 'text-purple-400' },
                          { label: 'HEX', value: currentVal.toString(16).toUpperCase(), icon: Binary, color: 'text-blue-400' },
                          { label: 'LOG', value: currentVal % 2 === 0 ? 'EVEN' : 'ODD', icon: Zap, color: 'text-amber-400' },
                          { label: 'VECTOR', value: Math.abs(currentVal).toFixed(2), icon: TrendingUp, color: 'text-emerald-400' }
                        ].map((stat, i) => (
                          <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-white/20 transition-all">
                            <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="font-mono font-bold text-white truncate">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className="bg-zinc-900/40 border-white/10 p-8 rounded-[2.5rem]">
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-6">FACTOR</h3>
                      <div className="flex flex-wrap gap-2">
                        {getFactors(currentVal).map(f => (
                          <span key={f} className="px-4 py-2 bg-purple-500/5 border border-purple-500/10 text-purple-400 rounded-2xl text-sm font-bold font-mono">
                            {f}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="graph">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <Card className="bg-zinc-900/40 border-white/10 p-8 rounded-[2.5rem]">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Function Input [f(x)]</label>
                          <div className="flex gap-3">
                            <Input
                              value={graphFunc}
                              onChange={(e) => setGraphFunc(e.target.value)}
                              className="bg-black/50 border-white/10 rounded-2xl font-mono text-purple-400 h-12"
                              placeholder="e.g. sin(x) * 5"
                            />
                            <Button className="rounded-2xl bg-purple-600 aspect-square h-12 w-12 p-0"><RotateCcw className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="h-[300px] w-full bg-black/20 rounded-[2rem] p-6 border border-white/5">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData}>
                              <defs>
                                <linearGradient id="plotGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="x" stroke="#525252" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis stroke="#525252" fontSize={10} axisLine={false} tickLine={false} />
                              <ChartTooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                              <Area type="monotone" dataKey="y" stroke="#A855F7" fill="url(#plotGrad)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="relative bg-black border-t border-white/5 py-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-8 h-8 rounded" />
              <span className="font-black text-2xl tracking-tighter">MARGDARSHAK</span>
            </div>
            <p className="text-zinc-500 text-xs font-black tracking-[0.4em] uppercase">BY VSAV GYANTAPA</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calculator;