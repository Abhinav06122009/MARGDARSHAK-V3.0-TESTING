import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, X, BrainCircuit, Activity, Zap, Cpu, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import aiService from '@/lib/aiService';

export default function DoubtSolver() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setSolution(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
      const result = await aiService.solveDoubtFromImage(image);
      setSolution(result);
    } catch (error) {
      console.error(error);
      setSolution("CRITICAL_ERR: Neural analysis failed to converge on a solution vector. Please retry the uplink.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setSolution(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 max-w-5xl mx-auto shadow-[0_60px_100px_-30px_rgba(0,0,0,0.8)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/[0.05] transition-colors duration-700" />
      
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
            <BrainCircuit className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Neural <span className="text-emerald-500">Solver</span></h2>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-3 italic opacity-60">High-fidelity forensic analysis of complex problem vectors.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">
           <Activity className="w-3 h-3 text-emerald-500/40" /> Precision Sector: 0.9997
        </div>
      </div>

      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/5 rounded-[2.5rem] p-24 text-center cursor-pointer hover:border-emerald-500/20 hover:bg-emerald-500/[0.02] transition-all duration-700 group/upload relative overflow-hidden shadow-inner bg-black/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.01] to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
            <UploadCloud className="w-20 h-20 text-zinc-800 group-hover/upload:text-emerald-500 mx-auto mb-8 transition-all duration-700 group-hover/upload:scale-110 group-hover/upload:rotate-6" />
            <h3 className="text-xl font-black text-white mb-3 uppercase italic tracking-tighter">Initialize Problem Uplink</h3>
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-black italic">Supported Formats: JPG, PNG, WEBP (Max Payload 5MB)</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-12"
          >
            {/* Image Preview */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/60 shadow-2xl group/preview h-full min-h-[400px] flex items-center justify-center">
              <img src={image} alt="Forensic Input" className="w-full h-full object-contain p-4 group-hover/preview:scale-[1.02] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <button 
                onClick={clearImage}
                className="absolute top-8 right-8 w-12 h-12 bg-black/60 hover:bg-red-500/80 text-white rounded-2xl backdrop-blur-3xl transition-all duration-700 border border-white/5 shadow-2xl flex items-center justify-center group/close"
              >
                <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform" />
              </button>
              <div className="absolute bottom-8 left-8 flex items-center gap-3 px-4 py-2 bg-black/60 rounded-xl border border-white/5 backdrop-blur-3xl">
                 <Scan className="w-4 h-4 text-emerald-500" />
                 <span className="text-[9px] font-black text-white uppercase tracking-widest italic opacity-60">Visual Data Locked</span>
              </div>
            </div>

            {/* Actions & Solution */}
            <div className="flex flex-col h-full space-y-8">
              {!solution && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-white/5 rounded-[2.5rem] bg-white/[0.01] shadow-inner relative overflow-hidden group/action">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
                  <ImageIcon className="w-16 h-16 text-zinc-800 mb-8 group-hover/action:text-emerald-500 transition-colors duration-700" />
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10 italic">Forensic matrix ready for computation.</p>
                  <button 
                    onClick={handleSolve} 
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-6 text-xs font-black uppercase tracking-[0.3em] italic rounded-[1.5rem] transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group/solve"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> CONVERGING_MATRICES...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 group-hover/solve:scale-125 transition-transform" /> START_FORENSIC_SOLVE</>
                    )}
                  </button>
                </div>
              )}

              {/* Solution Display */}
              {solution && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 bg-white/[0.01] border border-emerald-500/10 rounded-[2.5rem] p-10 overflow-y-auto max-h-[600px] shadow-2xl relative group/solution"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                     <Activity className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">Forensic Output Generated</span>
                  </div>
                  <div className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed font-medium italic prose prose-invert max-w-none prose-p:text-zinc-400 prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:italic">
                    {solution}
                  </div>
                  <div className="mt-10 flex items-center gap-4 opacity-10">
                     <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500 to-transparent" />
                     <Cpu className="w-4 h-4 text-emerald-500" />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-12 flex items-center justify-between opacity-20 group-hover:opacity-40 transition-opacity relative z-10">
         <div className="flex items-center gap-6">
            <Zap className="w-4 h-4 text-emerald-500" />
            <div className="h-[1px] w-24 bg-gradient-to-r from-emerald-500 to-transparent" />
         </div>
         <span className="text-[8px] font-black uppercase tracking-[0.5em] italic">Autonomous Intelligence Unit v3.0.5</span>
      </div>
    </div>
  );
}