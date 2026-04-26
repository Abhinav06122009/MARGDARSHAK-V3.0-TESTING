import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, X } from 'lucide-react';
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
      // Call the newly added aiService method
      const result = await aiService.solveDoubtFromImage(image);
      setSolution(result);
    } catch (error) {
      console.error(error);
      setSolution("An error occurred while analyzing the image. Please try again.");
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
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Doubt Solver</h2>
          <p className="text-gray-400 text-sm">Upload a math or science problem, get a step-by-step breakdown.</p>
        </div>
      </div>

      {/* Upload Area */}
      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
        >
          <UploadCloud className="w-12 h-12 text-gray-500 group-hover:text-emerald-400 mx-auto mb-4 transition-colors" />
          <h3 className="text-lg font-semibold text-white mb-2">Click to Upload Problem</h3>
          <p className="text-gray-400 text-sm">Supports JPG, PNG, WEBP (Max 5MB)</p>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50">
            <img src={image} alt="Uploaded Problem" className="w-full h-auto object-contain max-h-[400px]" />
            <button 
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions & Solution */}
          <div className="flex flex-col h-full">
            {!solution && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-white/5 rounded-2xl bg-white/5">
                <ImageIcon className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-gray-300 mb-6">Image ready for analysis.</p>
                <Button 
                  onClick={handleSolve} 
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 text-lg rounded-xl shadow-lg shadow-emerald-900/20"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Physics & Math...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" /> Solve Step-by-Step</>
                  )}
                </Button>
              </div>
            )}

            {/* Solution Display */}
            {solution && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 rounded-2xl p-6 overflow-y-auto max-h-[400px] prose prose-invert"
              >
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">{solution}</div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}