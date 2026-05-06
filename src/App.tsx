import React, { useContext, useEffect, useState, Suspense, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { safeLazy as lazy } from '@/lib/lazy-load';
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
import { DockProvider } from '@/contexts/DockContext';
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
const AppRoutes = () => {
  const { user, isVerified, loading } = useContext(AuthContext);
  const location = useLocation();
  
  // Determine if the user is an "Officer" (Admin/CEO/etc)
  const isOfficer = user?.profile?.user_type?.toLowerCase().match(/admin|ceo|manager|moderator|official|hr/);

  // If loading, show the global loader
  if (loading) return <PageLoader />;

  // IDENTITY GATE: For officers, hide the main app content until verified via the RankEntryOverlay
  const showContent = !isOfficer || isVerified;

  return (
    <>
      <div className="bg-[#050505] min-h-screen text-white w-full overflow-x-hidden relative">
        {/* PERSISTENT UI OVERLAYS */}
        {showContent && (
          <>
            <AmbientSoundPlayer />
            <GlobalQuickActions />
            
            <div className="fixed bottom-0 left-0 z-[999998] pointer-events-none">
              <div className="pointer-events-auto">
                <AIWidgetWrapper />
                <MobileNavbar />
              </div>
            </div>
          </>
        )}

        <GlobalSecurityGuard>
          <NavigationTracker />
          <SecurityWarningOverlay />
          
          <div className={showContent ? 'opacity-100' : 'opacity-0 pointer-events-none scale-95 transition-all duration-1000'}>
            <AnimatePresence mode="wait">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* --- PUBLIC ROUTES --- */}
                  <Route path="/" element={<><SEO title="MARGDARSHAK | Best AI Student Platform & Study Management" description="MARGDARSHAK is the top-rated AI-powered student platform." /><LandingPage /></>} />
                  <Route path="/auth" element={<Index />} />
                  <Route path="/sso-callback" element={<SSOCallback />} />
                  <Route path="/calculator" element={<Calculator onBack={() => window.history.back()} />} />
                  <Route path="/timer" element={<StudyTimer />} />
                  <Route path="/blog/*" element={<BlogPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/gdpr" element={<GDPRCompliance />} />
                  <Route path="/download" element={<DownloadPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* --- PROTECTED ROUTES --- */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardRouteWrapper /></ProtectedRoute>} />
                  <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                  <Route path="/ai-assistant" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
                  <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute><Tasks onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/grades" element={<ProtectedRoute><Grades onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/notes" element={<ProtectedRoute><Notes onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><Calendar onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/timetable" element={<ProtectedRoute><Timetable onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/courses" element={<ProtectedRoute><CourseManagement onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/syllabus" element={<ProtectedRoute><Syllabus onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/progress" element={<ProtectedRoute><ProgressTracker onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/wellness" element={<ProtectedRoute><Wellness onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/status" element={<OfficerRoute><Status onBack={() => window.history.back()} /></OfficerRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings onBack={() => window.history.back()} /></ProtectedRoute>} />
                  <Route path="/admin/login" element={<AdminAuthPage />} />
                  
                  <Route path="/support" element={<ClassCRoute><SupportHub /></ClassCRoute>} />
                  <Route path="/support-nexus" element={<NexusRoute><SupportNexus /></NexusRoute>} />
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

                  <Route path="/quiz" element={<PremiumEliteRoute><QuizGenerator /></PremiumEliteRoute>} />
                  <Route path="/essay-helper" element={<PremiumEliteRoute><EssayHelper /></PremiumEliteRoute>} />
                  <Route path="/study-planner" element={<PremiumEliteRoute><StudyPlanner /></PremiumEliteRoute>} />
                  <Route path="/ai-analytics" element={<PremiumEliteRoute><AIAnalytics /></PremiumEliteRoute>} />
                  <Route path="/flashcards" element={<PremiumEliteRoute><Flashcards /></PremiumEliteRoute>} />
                  <Route path="/doubt-solver" element={<PremiumEliteRoute><DoubtSolver /></PremiumEliteRoute>} />
                  <Route path="/smart-notes" element={<PremiumRoute><SmartNotes /></PremiumRoute>} />
                  <Route path="/portfolio" element={<PremiumRoute><PortfolioBuilder /></PremiumRoute>} />
                  <Route path="/deadlines" element={<PremiumRoute><DeadlineTracker /></PremiumRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </div>

          <DevVerificationGuard />
          <CursorProvider>
            {showContent && (
               <GlobalFooter />
            )}
          </CursorProvider>
          <ShortcutsOverlay />
          <Toaster />
          <Sonner />
          <CookieConsent />

        </GlobalSecurityGuard>
      </div>

      {isOfficer && !isVerified && (
        <div className="fixed inset-0 z-[20000000]"><RankEntryOverlay /></div>
      )}
    </>
  );
};

const AppContent = () => {
  return (
    <TooltipProvider>
      <AuthProvider>
        <AdminProvider>
          <SecurityProvider>
            <AIProvider>
              <DockProvider>
                <AppRoutes />
              </DockProvider>
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
