import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  Lock, 
  ChevronRight, 
  Map, 
  Flag,
  Award,
  Star,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  progress: number;
  icon: React.ReactNode;
  color: string;
}

const ProgressTracer: React.FC = () => {
  const { user, loading } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activeTab, setActiveTab] = useState<'academic' | 'skills' | 'career'>('academic');

  // Check subscription access
  // Check subscription access using robust metadata check
  const realSubscriptionTier = (user?.publicMetadata?.subscription as any)?.tier || 
                             (user?.unsafeMetadata?.subscription as any)?.tier || 
                             (user as any)?.profile?.subscription_tier || 
                             'free';
                             
  const hasAccess = realSubscriptionTier === 'premium' || 
                    realSubscriptionTier === 'premium_elite' || 
                    realSubscriptionTier === 'premium_wlite' ||
                    (user as any)?.profile?.role === 'admin' ||
                    (user as any)?.profile?.role === 'ceo' ||
                    (user as any)?.profile?.role === 'superadmin';

  useEffect(() => {
    if (hasAccess) {
      // Mock milestones for now - these would come from Supabase in a real implementation
      setMilestones([
        {
          id: '1',
          title: 'Foundation Phase',
          description: 'Core concepts and fundamental principles mastered.',
          status: 'completed',
          progress: 100,
          icon: <BrainCircuit className="w-6 h-6" />,
          color: 'from-emerald-400 to-teal-500'
        },
        {
          id: '2',
          title: 'Advanced Mastery',
          description: 'Deep diving into complex problem solving and analysis.',
          status: 'current',
          progress: 65,
          icon: <Zap className="w-6 h-6" />,
          color: 'from-blue-400 to-indigo-600'
        },
        {
          id: '3',
          title: 'Competitive Readiness',
          description: 'Ready for mock tests and real-world applications.',
          status: 'locked',
          progress: 0,
          icon: <Trophy className="w-6 h-6" />,
          color: 'from-purple-400 to-pink-600'
        },
        {
          id: '4',
          title: 'Zenith Achievement',
          description: 'Platform certification and final review phase.',
          status: 'locked',
          progress: 0,
          icon: <Award className="w-6 h-6" />,
          color: 'from-amber-400 to-orange-600'
        }
      ]);
    }
  }, [hasAccess]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="relative p-8 rounded-3xl overflow-hidden glass-morphism border border-white/20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 -z-10" />
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Progress Tracer Locked
        </h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          The high-fidelity Academic Journey Tracer is exclusively available for our Premium and Elite members. Upgrade now to visualize your path to success.
        </p>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl px-8 py-6 h-auto text-lg font-semibold shadow-xl shadow-purple-500/20 group transition-all duration-300"
          onClick={() => toast.info("Upgrade to access Premium features!")}
        >
          Upgrade to Premium
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Zenith Progress Tracer
          </h2>
          <p className="text-white/60 text-lg mt-2">
            Visualizing your personalized path to academic excellence.
          </p>
        </div>
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          {(['academic', 'skills', 'career'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity opacity-0" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-wider">Overall Completion</p>
                  <p className="text-2xl font-bold text-white">42.5%</p>
                </div>
              </div>
              <Progress value={42.5} className="h-2 bg-white/5" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:opacity-100 transition-opacity opacity-0" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <Star className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-wider">Skill Score</p>
                  <p className="text-2xl font-bold text-white">840/1000</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                Top 5% in your category
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Rocket className="w-24 h-24" />
            </div>
            <h3 className="text-xl font-bold mb-2">Next Milestone</h3>
            <p className="text-white/80 mb-4 text-sm">Complete "Quantum Physics 101" to unlock the next level.</p>
            <Button className="w-full bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md rounded-xl transition-all">
              Resume Journey
            </Button>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-transparent opacity-20" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div 
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-24"
                >
                  {/* Timeline Point */}
                  <div className={`absolute left-[30px] top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-lg ${
                    milestone.status === 'completed' ? 'bg-emerald-500 shadow-emerald-500/20' :
                    milestone.status === 'current' ? 'bg-blue-500 shadow-blue-500/20 animate-pulse' :
                    'bg-white/5 border border-white/10'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <Flag className="w-5 h-5 text-white" />
                    ) : milestone.status === 'current' ? (
                      <Map className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-white/40" />
                    )}
                  </div>

                  <Card className={`overflow-hidden backdrop-blur-lg border transition-all duration-500 ${
                    milestone.status === 'current' 
                      ? 'bg-white/10 border-blue-500/50 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/20 scale-[1.02]' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className={`p-6 flex items-center justify-center bg-gradient-to-br ${milestone.color} md:w-24 shrink-0`}>
                          <div className="text-white">
                            {milestone.icon}
                          </div>
                        </div>
                        <div className="p-6 flex-grow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                {milestone.title}
                                {milestone.status === 'completed' && <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Completed</Badge>}
                                {milestone.status === 'current' && <Badge className="bg-blue-500/20 text-blue-400 border-none animate-pulse">In Progress</Badge>}
                              </h3>
                              <p className="text-white/60 mt-1">{milestone.description}</p>
                            </div>
                            {milestone.status !== 'locked' && (
                              <div className="text-right">
                                <span className="text-2xl font-black text-white/20">{milestone.progress}%</span>
                              </div>
                            )}
                          </div>
                          
                          {milestone.status !== 'locked' ? (
                            <div className="space-y-3">
                              <Progress value={milestone.progress} className="h-1.5 bg-white/5" />
                              <div className="flex justify-end">
                                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-0 h-auto">
                                  View Details <ArrowRight className="ml-1 w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-white/30 text-sm">
                              <Lock className="w-4 h-4" />
                              Unlocks at {milestones[index-1]?.title} completion
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracer;
