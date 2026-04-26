import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * A wrapper for landing page sections that triggers entrance animations
 * when the section scrolls into view.
 */
export const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, id, className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94], 
            staggerChildren: 0.1 
          } 
        }
      }}
      className={`py-20 md:py-28 px-6 relative z-20 ${className}`}
    >
      {children}
    </motion.section>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * A standardized header for landing page sections with gradient text and a pulse underline.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }}
    className="text-center mb-16"
  >
    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
      <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        {title}
      </span>
    </h2>
    {subtitle && <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
    <motion.div
      className="w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto mt-4 rounded-full"
      style={{
        boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
      }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
      viewport={{ once: true }}
    />
  </motion.div>
);
