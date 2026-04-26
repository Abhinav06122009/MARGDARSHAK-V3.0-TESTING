import React from 'react';
import { CheckSquare, Rocket } from 'lucide-react';
import { SectionWrapper, SectionHeader } from './Section';
import { TiltCard } from './TiltCard';
import { MagneticButton } from './MagneticButton';

interface PricingProps {
  onPlanClick?: (planName: string) => void;
}

/**
 * Pricing component displaying subscription tiers.
 * Uses TiltCards for a dynamic selection experience.
 */
export const Pricing: React.FC<PricingProps> = ({ onPlanClick }) => {
  const plans = [
    {
      name: 'Explorer',
      price: '$0',
      desc: 'For casual learners getting started.',
      features: ['Basic AI Assistant', '1 Course Integration', 'Habit Tracker', 'Community Support'],
      popular: false,
    },
    {
      name: 'Premium',
      price: 'RS 750',
      desc: 'The most popular choice for dedicated students.',
      features: [
        'AI Briefing',
        'Productivity Flow',
        'Burnout Predictor',
        'Margdarshak Saarthi BYOK',
        'Wellness Centre',
        'Portfolio Builder',
        'Exam Deadlines',
        'Smart Notes (TTS)',
      ],
      popular: false,
    },
    {
      name: 'Premium + Elite',
      price: 'RS 1200',
      desc: 'For high-achievers who want every advantage.',
      features: [
        'Everything In Premium',
        'Margdarshak Saarthi (AI Companion)',
        'AI Doubt Solver',
        'Predictive Grade Analytics',
        'Automatic Timetable Gen',
        'Dedicated 24/7 Smart Tutor',
      ],
      popular: true,
    }
  ];

  return (
    <SectionWrapper id="pricing" className="bg-gray-950/50">
      <div className="container mx-auto">
        <SectionHeader
          title="Flexible Plans"
          subtitle="Choose the right plan to accelerate your learning journey. Cancel anytime."
        />
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <TiltCard
              key={index}
              className={`p-8 rounded-3xl border ${
                plan.popular 
                  ? 'bg-gray-900 border-blue-500 shadow-2xl shadow-blue-500/30' 
                  : 'bg-gray-900/60 border-blue-600/30'
              } relative overflow-hidden backdrop-blur-sm`}
            >
              {plan.popular && (
                <div className="absolute top-0 -right-1/4 w-1/2 text-center py-1.5 bg-blue-500 text-white font-semibold text-sm transform rotate-45 translate-y-6">
                  POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">{plan.name}</h3>
              <p className="text-4xl font-extrabold text-white mb-4">
                {plan.price}
                <span className="text-base font-medium text-gray-400">
                  {plan.price !== '$0' && ' / mo'}
                </span>
              </p>
              <p className="text-gray-400 mb-6 h-10">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-gray-300">
                    <CheckSquare className="w-5 h-5 text-emerald-400 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <MagneticButton className="w-full">
                <a
                  href="/auth"
                  onClick={() => onPlanClick?.(plan.name)}
                  className={`w-full inline-block text-center font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-300'
                  }`}
                >
                  Get Started
                </a>
              </MagneticButton>
            </TiltCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

/**
 * Final Call to Action section.
 */
export const CTA: React.FC = () => (
  <SectionWrapper id="cta" className="bg-gradient-to-br from-gray-950 to-blue-900/10 border-t border-blue-600/30">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-5xl font-bold mb-4 text-white">
        Ready to Achieve Your Best?
      </h2>
      <p className="text-xl text-gray-300 mb-10">
        Join thousands of students who are using MARGDARSHAK to master their studies.
      </p>
      <MagneticButton>
        <a 
          href="/auth" 
          className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-2xl shadow-blue-500/40 transition-all duration-300 group"
        >
          Get Started for Free 
          <Rocket className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </a>
      </MagneticButton>
    </div>
  </SectionWrapper>
);
