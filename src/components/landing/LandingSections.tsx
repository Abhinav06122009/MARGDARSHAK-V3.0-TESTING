import React from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, BarChart, Calendar, Shield, BookOpen, CheckSquare, 
  Star, Target, Eye, Sparkles 
} from 'lucide-react';
import { SectionWrapper, SectionHeader } from './Section';
import { TiltCard } from './TiltCard';

/**
 * Features section showcasing core capabilities.
 */
export const Features: React.FC = () => {
  const featureList = [
    { icon: BrainCircuit, title: 'AI Study Assistant', desc: 'Generate summaries, outlines, and flashcards instantly.' },
    { icon: BarChart, title: 'Grade Prediction Engine', desc: 'Predict final outcomes based on current performance data.' },
    { icon: Calendar, title: 'Dynamic Scheduling', desc: 'Automatically optimize your study time around fixed commitments.' },
    { icon: Shield, title: 'Data Security', desc: 'Your academic data is secured with enterprise-grade encryption.' },
    { icon: BookOpen, title: 'Knowledge Base', desc: 'Centralized access to all course materials and notes.' },
    { icon: CheckSquare, title: 'Habit Tracker', desc: 'Build consistent study habits with gamified progress tracking.' },
  ];

  return (
    <SectionWrapper id="features" className="container mx-auto">
      <SectionHeader
        title="Core Capabilities"
        subtitle="Designed to streamline every aspect of your academic life with cutting-edge AI."
      />
      <div className="grid md:grid-cols-3 gap-8">
        {featureList.map((feature, index) => (
          <TiltCard
            key={index}
            className="p-8 border border-blue-600/30 bg-gray-900/50 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="p-3 w-fit mb-4 rounded-full bg-blue-600/20 text-blue-400 border border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </TiltCard>
        ))}
      </div>
    </SectionWrapper>
  );
};

/**
 * Testimonials section highlighting student success.
 */
export const Testimonials: React.FC = () => {
  const reviews = [
    { 
      name: 'Sarah K.', 
      role: 'Med Student', 
      stars: 5, 
      quote: "MARGDARSHAK's scheduler is a lifesaver. It found study time I didn't know I had.", 
      image: 'https://placehold.co/100x100/313131/FFFFFF?text=SK' 
    },
    { 
      name: 'David L.', 
      role: 'Engineering', 
      stars: 5, 
      quote: "The AI summaries for complex research papers are spot on. It saves me hours of reading.", 
      image: 'https://placehold.co/100x100/313131/FFFFFF?text=DL' 
    },
    { 
      name: 'Priya S.', 
      role: 'Comp. Sci.', 
      stars: 5, 
      quote: "I was skeptical about the grade predictor, but it was scarily accurate.", 
      image: 'https://placehold.co/100x100/313131/FFFFFF?text=PS' 
    },
  ];

  return (
    <SectionWrapper id="testimonials" className="bg-gray-950/50">
      <div className="container mx-auto">
        <SectionHeader
          title="Student Success Stories"
          subtitle="See how MARGDARSHAK is helping students achieve their academic goals."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((testimonial, index) => (
            <TiltCard
              key={index}
              className="p-8 bg-gray-900 border border-blue-600/20 rounded-2xl shadow-lg backdrop-blur-sm"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-emerald-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4 border-2 border-blue-400" />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

/**
 * About section describing the mission.
 */
export const About: React.FC = () => {
  const values = [
    { icon: Target, title: 'Precision', desc: 'Focusing on accurate data and achievable goals.' },
    { icon: Eye, title: 'Foresight', desc: 'Using predictive analytics to guide future success.' },
    { icon: Sparkles, title: 'Innovation', desc: 'Constantly evolving our AI to meet student needs.' },
  ];

  return (
    <SectionWrapper id="about" className="container mx-auto">
      <SectionHeader
        title="Our Mission"
        subtitle="We are building the future of personalized education, one student at a time."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h3 className="text-3xl font-bold text-white mb-6">The Guide to Academic Excellence</h3>
          <p className="text-lg text-gray-300 mb-4">
            MARGDARSHAK, meaning 'The Guide', was born from a simple idea: that every student deserves a personalized roadmap to success.
          </p>
          <p className="text-lg text-gray-300">
            Our team of educators, data scientists, and engineers is dedicated to creating a platform that adapt to you.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              className="flex items-start p-6 bg-gray-900 border border-blue-600/20 rounded-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <div className="p-3 w-fit h-fit rounded-full bg-blue-600/20 text-blue-400 mr-4">
                <value.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white mb-1">{value.title}</h4>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
