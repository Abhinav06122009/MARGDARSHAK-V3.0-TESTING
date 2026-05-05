import React, { useContext, useEffect, useState, lazy, Suspense, useCallback } from 'react';
import * as Sentry from "@sentry/react";
import { BrowserRouter, HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CursorProvider } from '@/lib/CursorContext';
import CookieConsent from '@/components/CookieConsent';
import { AIProvider } from '@/contexts/AIContext';
import { AdminProvider, AdminContext } from '@/contexts/AdminContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import ShortcutsOverlay from '@/components/ui/ShortcutsOverlay';
import { AuthContext, AuthProvider } from '@/contexts/AuthContext';
import { ClerkSupabaseBridge } from '@/contexts/ClerkSupabaseBridge';
import { courseService } from '@/components/dashboard/courseService';
import MobileNavbar from '@/components/navigation/MobileNavbar';
import GlobalQuickActions from '@/components/navigation/GlobalQuickActions';
// Pages - eagerly loaded (critical path)
import LandingPage from '@/pages/LandingPage';
import Index from "@/pages/Index";
const Dashboard = lazy(() => import("@/components/dashboard/Dashboard"));
// Features - lazy loaded
const Tasks = lazy(() => import("@/components/tasks/Tasks"));
const Grades = lazy(() => import("@/components/grades/Grades"));
const Notes = lazy(() => import("@/components/notes/Notes"));
const StudyTimer = lazy(() => import("@/components/timer/StudyTimer"));
const Calculator = lazy(() => import("@/components/calculator/Calculator"));
const Calendar = lazy(() => import("@/components/calendar/CalendarPage"));
const Timetable = lazy(() => import("@/components/timetable/Timetable"));
const CourseManagement = lazy(() => import("@/components/courses/CourseManagement"));
const Syllabus = lazy(() => import("@/components/syllabus/Syllabus"));
const Settings = lazy(() => import("@/components/settings/Settings"));
const ProgressTracker = lazy(() => import("@/components/progress/ProgressTracker"));
const Wellness = lazy(() => import("@/components/wellness/Wellness"));
const Profile = lazy(() => import("@/pages/Profile"));
const Status = lazy(() => import("@/pages/Status"));
const Sitemap = lazy(() => import("@/pages/Sitemap"));
const AIPage = lazy(() => import("@/pages/AIPage"));
const Upgrade = lazy(() => import("@/pages/Upgrade"));
const AboutUsPage = lazy(() => import("@/pages/AboutUsPage"));
const ContactUsPage = lazy(() => import("@/pages/ContactUsPage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const GDPRCompliance = lazy(() => import("@/pages/GDPRCompliance"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const AchievementsPage = lazy(() => import("@/pages/Achievements"));
const AdminMessages = lazy(() => import("@/pages/AdminMessages"));
const DownloadPage = lazy(() => import("@/pages/DownloadPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const AdminAuthPage = lazy(() => import("@/components/auth/AdminAuthPage"));
// Lazy load heavy global components
const GlobalAIAssistant = lazy(() => import('@/components/ai/GlobalAIAssistant'));
const GlobalWellnessBar = lazy(() => import('@/components/wellness/GlobalWellnessBar'));



// New AI Features - lazy loaded
const QuizGenerator = lazy(() => import('@/pages/QuizGenerator'));
const EssayHelper = lazy(() => import('@/pages/EssayHelper'));
const StudyPlanner = lazy(() => import('@/pages/StudyPlanner'));
const AIAnalytics = lazy(() => import('@/pages/AIAnalytics'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SupportHub = lazy(() => import('./pages/admin/SupportHub'));
const SupportNexus = lazy(() => import('./pages/admin/SupportNexus'));
const CommandCenter = lazy(() => import('./pages/admin/CommandCenter'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SecurityCenter = lazy(() => import('./pages/admin/SecurityCenter'));
const ReportsInvestigation = lazy(() => import('./pages/admin/ReportsInvestigation'));
const ContentModeration = lazy(() => import('./pages/admin/ContentModeration'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const SupportCenter = lazy(() => import('./pages/admin/SupportCenter'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const Flashcards = lazy(() => import('@/pages/Flashcards'));
const DoubtSolver = lazy(() => import('@/pages/DoubtSolver'));
const SmartNotes = lazy(() => import('@/pages/SmartNotes'));
const PortfolioBuilder = lazy(() => import('@/pages/PortfolioBuilder'));
const DeadlineTracker = lazy(() => import('@/pages/DeadlineTracker'));

const Community = lazy(() => import('@/pages/Community'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: false } },
});

const SEO = ({ title, description }: { title: string, description: string }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);


import { 
  ProtectedRoute, 
  PremiumRoute, 
  PremiumEliteRoute, 
  AdminProtectedRoute, 
  OfficerRoute, 
  PageLoader,
  ClassCRoute,
  NexusRoute
} from '@/components/auth/RouteGuards';
import { BlockedUserOverlay } from '@/components/auth/BlockedUserOverlay';
import { SecurityWarningOverlay } from '@/components/auth/SecurityWarningOverlay';
import { trackActivity } from '@/lib/security/activityTracker';

import SSOCallback from '@/components/auth/SSOCallback';
import RankEntryOverlay from '@/components/auth/RankEntryOverlay';
import DevVerificationGuard from './components/security/DevVerificationGuard';
import { AmbientSoundPlayer } from '@/components/ui/AmbientSoundPlayer';

const AIWidgetWrapper = () => {
  const { session } = useContext(AuthContext);
  if (!session) return null;
  return (
    <Suspense fallback={null}>
      <GlobalAIAssistant />
    </Suspense>
  );
};


import GlobalFooter from '@/components/layout/GlobalFooter';

const GlobalSecurityGuard = ({ children }: { children: React.ReactNode }) => {
  const { isBlocked, blockedReason } = useContext(AuthContext);
  const [isPermanentlyBanned, setIsPermanentlyBanned] = useState(false);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    const handleBan = (e: any) => {
      setIsPermanentlyBanned(true);
      setBanReason(e.detail?.type || 'Security Policy Violation');
      // Force immediate session storage lock
      sessionStorage.setItem('mg_session_locked', 'true');
    };

    if (sessionStorage.getItem('mg_session_locked') === 'true') {
      setIsPermanentlyBanned(true);
    }

    window.addEventListener('security-ban', handleBan);
    return () => window.removeEventListener('security-ban', handleBan);
  }, []);
  
  // WHITE-LIST GOOGLE BOTS FROM GLOBAL BLOCK
  const isGoogleBot = () => {
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes('googlebot') || 
      ua.includes('mediapartners-google') || 
      ua.includes('adsbot-google') ||
      ua.includes('google-adwords') ||
      ua.includes('adsense')
    );
  };

  if (isPermanentlyBanned && !isGoogleBot()) {
    return (
      <div className="fixed inset-0 z-[99999999] bg-black flex flex-center items-center justify-center p-12 text-center">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-black text-red-600 italic uppercase mb-6">Access Terminated</h1>
          <p className="text-zinc-500 font-bold tracking-widest mb-8">VIOLATION DETECTED: {banReason}</p>
          <div className="h-px w-full bg-red-900/50 mb-8" />
          <p className="text-zinc-400 text-sm mb-12">Your IP address and hardware fingerprint have been blacklisted. Any further attempts to access this platform will be reported to network authorities.</p>
          <div className="inline-block p-4 border border-red-600/30 rounded-xl bg-red-600/5">
             <p className="text-red-500 font-black text-xs uppercase tracking-widest">Protocol: BRAND_VSAV_GYANTAPA_LOCKDOWN</p>
          </div>
        </div>
      </div>
    );
  }

  if (isBlocked && !isGoogleBot()) {
    return (
      <>
        <BlockedUserOverlay reason={blockedReason} />
        <div className="blur-xl pointer-events-none select-none">
          {children}
        </div>
      </>
    );
  }
  
   return <>{children}</>;
 };
 
const NavigationTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackActivity('page_view', { path: location.pathname });
  }, [location]);

  return null;
};

const DashboardRouteWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = useCallback((page: string) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'progress') navigate('/progress');
    else if (page === 'settings') navigate('/settings');
    else if (page === 'profile') navigate('/profile');
    else navigate(`/${page}`);
  }, [navigate]);

  return (
    <>
      <SEO title="Dashboard | MARGDARSHAK" description="Your AI-powered command center." />
      <Dashboard onNavigate={handleNavigate} />
    </>
  );
};

/**
 * AppContent handles the core UI logic and AnimatePresence synchronization.
 */
const AppContent = () => {
  const location = useLocation();

  // Initialize security and tracking only once
  useEffect(() => {
    import('@/components/auth/AuthSecurity').then(({ securityFeatures }) => {
      securityFeatures.initZeroThreatShield();
    });
    
    // Performance monitor for high-traffic sessions
    const checkPerformance = () => {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize > 500 * 1024 * 1024) { // 500MB
        console.warn('🛡️ HIGH MEMORY USAGE DETECTED. OPTIMIZING...');
      }
    };
    const perfInterval = setInterval(checkPerformance, 30000);
    
    return () => clearInterval(perfInterval);
  }, []);

  return (
    <TooltipProvider>
      <AuthProvider>
        <AdminProvider>
          <SecurityProvider>
            <AIProvider>
                <div className="bg-[#050505] min-h-screen text-white">
                  <GlobalSecurityGuard>
                    <NavigationTracker />
                    <SecurityWarningOverlay />
                    <AnimatePresence mode="wait">
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                        {/* --- PUBLIC ROUTES (AdSense & SEO Optimized) --- */}
                        <Route path="/" element={<><SEO title="MARGDARSHAK | Best AI Student Platform & Study Management" description="MARGDARSHAK is the top-rated AI-powered student platform. Use our smart tutoring, quiz generator, study planner, and grade tracker for academic excellence." /><LandingPage /></>} />
                        <Route path="/auth" element={<Index />} />
                        <Route path="/sso-callback" element={<SSOCallback />} />

                        {/* Free Tools (Public Access for AdSense) */}
                        <Route path="/calculator" element={<><SEO title="Scientific Calculator Online | MARGDARSHAK" description="Free online scientific calculator for students. Solve complex math and physics problems easily." /><Calculator onBack={() => window.history.back()} /></>} />
                        <Route path="/timer" element={<><SEO title="Pomodoro Study Timer | MARGDARSHAK" description="Boost your focus with our customizable Pomodoro study timer. Track your study sessions and stay productive." /><StudyTimer /></>} />
                        <Route path="/blog/*" element={<><SEO title="Student Success Blog | MARGDARSHAK" description="Expert advice on study techniques, exam preparation, and academic productivity." /><BlogPage /></>} />

                        {/* Legal & Info */}
                        <Route path="/about" element={<><SEO title="About Us | The MARGDARSHAK Mission" description="Learn about the vision behind MARGDARSHAK and how we are empowering students worldwide with AI." /><AboutUsPage /></>} />
                        <Route path="/contact" element={<><SEO title="Contact Support | MARGDARSHAK" description="Need help? Contact the MARGDARSHAK support team for any queries or feedback." /><ContactUsPage /></>} />
                        <Route path="/help" element={<><SEO title="Help Center | MARGDARSHAK Knowledge Base" description="Find answers to common questions and learn how to use MARGDARSHAK tools effectively." /><HelpPage /></>} />
                        <Route path="/privacy" element={<><SEO title="Privacy Policy | MARGDARSHAK" description="How we protect your data and maintain your privacy at MARGDARSHAK." /><PrivacyPolicy /></>} />
                        <Route path="/terms" element={<><SEO title="Terms & Conditions | MARGDARSHAK" description="The legal agreement for using the MARGDARSHAK platform." /><TermsAndConditions /></>} />
                        <Route path="/cookies" element={<><SEO title="Cookie Policy | MARGDARSHAK" description="Information about how we use cookies to improve your experience." /><CookiePolicy /></>} />
                        <Route path="/gdpr" element={<><SEO title="GDPR Compliance | MARGDARSHAK" description="Our commitment to GDPR and data protection standards." /><GDPRCompliance /></>} />
                        <Route path="/download" element={<><SEO title="Download MARGDARSHAK | Desktop & Mobile Apps" description="Get the official MARGDARSHAK application for Windows and Android. Premium AI-powered educational tools on all your devices." /><DownloadPage /></>} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />



                        {/* --- PROTECTED ROUTES (Dashboard) --- */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <DashboardRouteWrapper />
                          </ProtectedRoute>
                        } />
                        <Route path="/achievements" element={<ProtectedRoute><SEO title="Achievements | MARGDARSHAK" description="Your progress and badges." /><AchievementsPage /></ProtectedRoute>} />
                        <Route path="/ai-assistant" element={<ProtectedRoute><SEO title="SAARTHI | MARGDARSHAK" description="24/7 AI-powered academic assistance." /><AIPage /></ProtectedRoute>} />
                        <Route path="/upgrade" element={<ProtectedRoute><SEO title="Upgrade to Premium | MARGDARSHAK" description="Unlock advanced AI features and study tools with MARGDARSHAK Premium." /><Upgrade /></ProtectedRoute>} />

                        {/* Core Features */}
                        <Route path="/tasks" element={<ProtectedRoute><SEO title="Task Manager | MARGDARSHAK" description="Organize your academic tasks and deadlines efficiently." /><Tasks onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/grades" element={<ProtectedRoute><SEO title="Grade Tracker | MARGDARSHAK" description="Track your academic performance and calculate your GPA automatically." /><Grades onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/notes" element={<ProtectedRoute><SEO title="Digital Notes | MARGDARSHAK" description="Create and organize your study notes in one secure place." /><Notes onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/calendar" element={<ProtectedRoute><SEO title="Academic Calendar | MARGDARSHAK" description="Sync your schedule and never miss an important event." /><Calendar onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/timetable" element={<ProtectedRoute><SEO title="Timetable Maker | MARGDARSHAK" description="Create a perfect study schedule with our automated timetable generator." /><Timetable onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/courses" element={<ProtectedRoute><SEO title="Course Management | MARGDARSHAK" description="Manage your subjects and courses with ease." /><CourseManagement onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/syllabus" element={<ProtectedRoute><SEO title="Syllabus Tracker | MARGDARSHAK" description="Track your progress through your course syllabus." /><Syllabus onBack={() => window.history.back()} /></ProtectedRoute>} />


                        <Route path="/progress" element={<ProtectedRoute><SEO title="Progress Tracker | MARGDARSHAK" description="Monitor your academic growth and achievements over time." /><ProgressTracker onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><SEO title="Identity Hub | MARGDARSHAK" description="Manage your universal holographic ID." /><Profile onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/identity-node" element={<ProtectedRoute><SEO title="Identity Hub | MARGDARSHAK" description="Manage your universal holographic ID." /><Profile onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/status" element={<OfficerRoute><SEO title="System Status | MARGDARSHAK" description="Real-time matrix health monitoring." /><Status onBack={() => window.history.back()} /></OfficerRoute>} />
                        <Route path="/sitemap" element={<><SEO title="Sitemap Index | MARGDARSHAK" description="Architectural matrix of the ecosystem." /><Sitemap onBack={() => window.history.back()} /></>} />
                        <Route path="/wellness" element={<PremiumRoute><SEO title="Student Wellness | MARGDARSHAK" description="Tools for mental well-being and maintaining a healthy study-life balance." /><Wellness onBack={() => window.history.back()} /></PremiumRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><SEO title="Settings | MARGDARSHAK" description="Manage your account preferences and security settings." /><Settings onBack={() => window.history.back()} /></ProtectedRoute>} />
                        <Route path="/admin/login" element={<AdminAuthPage />} />
                        
                        {/* Operational Support Hub (Class C) */}
                        <Route path="/support" element={<ClassCRoute><SupportHub /></ClassCRoute>} />

                        {/* Tactical Support Nexus (A+ to B) */}
                        <Route path="/support-nexus" element={<NexusRoute><SupportNexus /></NexusRoute>} />

                        {/* High-Command Admin (A+ to B) */}
                        <Route path="/admin" element={<AdminProtectedRoute><CommandCenter /></AdminProtectedRoute>} />
                        <Route path="/admin/command-center" element={<AdminProtectedRoute><CommandCenter /></AdminProtectedRoute>} />
                        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                        <Route path="/admin/users" element={<AdminProtectedRoute><UserManagement /></AdminProtectedRoute>} />
                        <Route path="/admin/security" element={<AdminProtectedRoute><SecurityCenter /></AdminProtectedRoute>} />
                        <Route path="/admin/reports" element={<AdminProtectedRoute><ReportsInvestigation /></AdminProtectedRoute>} />
                        <Route path="/admin/content" element={<AdminProtectedRoute><ContentModeration /></AdminProtectedRoute>} />
                        <Route path="/admin/analytics" element={<AdminProtectedRoute><Analytics /></AdminProtectedRoute>} />
                        <Route path="/admin/support" element={<AdminProtectedRoute><SupportCenter /></AdminProtectedRoute>} />
                        <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />

                        {/* --- NEW AI FEATURES --- */}
                        <Route path="/quiz" element={
                          <PremiumEliteRoute>
                            <SEO title="Quiz Generator | MARGDARSHAK" description="AI-powered quiz generator for any subject." />
                            <QuizGenerator />
                          </PremiumEliteRoute>
                        } />
                        <Route path="/essay-helper" element={
                          <PremiumEliteRoute>
                            <SEO title="Essay Helper | MARGDARSHAK" description="AI writing assistant for essays and academic papers." />
                            <EssayHelper />
                          </PremiumEliteRoute>
                        } />
                        <Route path="/study-planner" element={
                          <PremiumEliteRoute>
                            <SEO title="Smart Study Planner | MARGDARSHAK" description="AI-generated personalized study schedules." />
                            <StudyPlanner />
                          </PremiumEliteRoute>
                        } />
                        <Route path="/ai-analytics" element={
                          <PremiumEliteRoute>
                            <SEO title="AI Analytics | MARGDARSHAK" description="AI-powered insights into your academic performance." />
                            <AIAnalytics />
                          </PremiumEliteRoute>
                        } />
                        <Route path="/flashcards" element={
                          <PremiumEliteRoute>
                            <SEO title="AI Flashcards | MARGDARSHAK" description="AI generated flashcards with Spaced Repetition." />
                            <Flashcards />
                          </PremiumEliteRoute>
                        } />
                        <Route path="/doubt-solver" element={
                          <PremiumEliteRoute>
                            <SEO title="AI Doubt Solver | MARGDARSHAK" description="Step-by-step solutions for complex problems." />
                            <DoubtSolver />
                          </PremiumEliteRoute>
                        } />

                        {/* --- CAREER & PREP ROUTES --- */}
                        <Route path="/smart-notes" element={
                          <PremiumRoute>
                            <SEO title="Smart Notes | MARGDARSHAK" description="Take notes and listen to them with Text-to-Speech." />
                            <SmartNotes />
                          </PremiumRoute>
                        } />
                        <Route path="/portfolio" element={
                          <PremiumRoute>
                            <SEO title="Portfolio Builder | MARGDARSHAK" description="Auto-generate a resume from your real academic data." />
                            <PortfolioBuilder />
                          </PremiumRoute>
                        } />
                        <Route path="/deadlines" element={
                          <PremiumRoute>
                            <SEO title="Exam Deadline Tracker | MARGDARSHAK" description="Track JEE, NEET, SAT and university application deadlines." />
                            <DeadlineTracker />
                          </PremiumRoute>
                        } />


                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </AnimatePresence>
                    

                    <RankEntryOverlay />
                    <DevVerificationGuard />
             {/* Global persistent layers - Memoized for stability */}
      <CursorProvider>
        <AIWidgetWrapper />
        <GlobalQuickActions />
        <MobileNavbar />
        <Suspense fallback={null}>
          <GlobalWellnessBar />
        </Suspense>
        <GlobalFooter />
      </CursorProvider>
             <ShortcutsOverlay />

                    <Toaster />
                    <Sonner />
                    <CookieConsent />
                  </GlobalSecurityGuard>
                </div>
              </AIProvider>
            </SecurityProvider>
          </AdminProvider>
        </AuthProvider>
      </TooltipProvider>

  );
};

 // Main App Structure
const App = () => {
  useEffect(() => {
    if (localStorage.getItem('dyslexiaMode') === 'true') {
      document.body.classList.add('dyslexia-mode');
    }

    // --- SSO HASH REDIRECT FIX ---
    // If Clerk sends a callback with a hash (e.g. /auth#/sso-callback), 
    // we redirect to the actual path to prevent routing crashes.
    if (window.location.hash.includes('sso-callback')) {
      const cleanPath = window.location.hash.replace('#', '');
      console.log('🔄 SSO Hash Detected. Redirecting to:', cleanPath);
      window.location.href = window.location.origin + cleanPath;
    }
  }, []);

  const Router = (window as any).Capacitor ? HashRouter : BrowserRouter;

  return (
    <HelmetProvider>
      <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>} showDialog>
        <QueryClientProvider client={queryClient}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ClerkSupabaseBridge>
              <AppContent />
            </ClerkSupabaseBridge>
          </Router>
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
