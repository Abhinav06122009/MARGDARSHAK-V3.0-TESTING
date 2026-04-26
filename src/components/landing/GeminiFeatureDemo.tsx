import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { aiService } from '@/lib/aiService';
import { useSound } from './SoundContext';

/**
 * A demo component showcasing the AI capabilities of Margdarshak.
 * Allows users to input a concept and get an AI-generated explanation.
 */
export const GeminiFeatureDemo: React.FC = () => {
  const [topic, setTopic] = useState("Quantum Entanglement");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playSound } = useSound();

  const handleGenerate = async () => {
    playSound('click');
    if (!topic || isLoading) return;

    setIsLoading(true);
    setError(null);
    setExplanation("");

    try {
      const result = await aiService.explainConcept(topic);
      if (result) {
        setExplanation(result);
      } else {
        throw new Error("No response received from the AI.");
      }
    } catch (err) {
      setError("Sorry, I couldn't fetch an explanation. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 border border-blue-600/30 bg-gray-900/50 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a concept (e.g., Photosynthesis)"
          className="flex-grow bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          onMouseEnter={() => !isLoading && playSound('hover')}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Sparkles className="w-5 h-5 transition-transform group-hover:scale-125" />
          )}
          <span>{isLoading ? "Generating..." : "Explain"}</span>
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center"
        >
          {error}
        </motion.div>
      )}

      {explanation && (
        <motion.div
          className="mt-6 p-6 bg-gray-900/70 border border-gray-700/50 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-xl font-bold text-emerald-400 mb-3">Explanation:</h4>
          <p className="text-gray-300 text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
};
