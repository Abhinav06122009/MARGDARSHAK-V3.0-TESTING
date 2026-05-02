import React from 'react';
import { motion } from 'framer-motion';

import supabaseLogo from '@/components/logo/landingpage/supabase.svg';
import clerkLogo from '@/components/logo/landingpage/clerk.svg';
import framerLogo from '@/components/logo/landingpage/framer.svg';
import viteLogo from '@/components/logo/landingpage/vitejs.svg';
import reactLogo from '@/components/logo/landingpage/react.svg';

const techLogos = [
  { name: 'Supabase', logo: supabaseLogo },
  { name: 'Clerk', logo: clerkLogo },
  { name: 'Framer Motion', logo: framerLogo },
  { name: 'Vite', logo: viteLogo },
  { name: 'React', logo: reactLogo },
  { name: 'Tailwind', logo: 'https://seeklogo.com/images/T/tailwind-css-logo-5AD4175897-seeklogo.com.png' }
];

export const TechStack: React.FC = () => {
  return (
    <div className="py-20 border-y border-white/5 bg-zinc-950/30 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <p className="text-center text-zinc-500 text-xs font-black uppercase tracking-[0.4em] mb-12">
          Engineered with Cutting-Edge Technology
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 hover:opacity-100 transition-opacity duration-700">
          {techLogos.map((tech) => (
            <motion.div
              key={tech.name}
              whileHover={{ scale: 1.1, y: -5 }}
              className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-500"
            >
              <img 
                src={tech.logo} 
                alt={tech.name} 
                className="h-8 md:h-10 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
              />
              <span className="text-white/50 font-bold text-sm tracking-tight">{tech.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};
