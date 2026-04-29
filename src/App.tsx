import React, { useContext, useEffect, useState, lazy, Suspense } from 'react';
import * as Sentry from "@sentry/react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CursorProvider } from '@/lib/CursorContext';
import CookieConsent from '@/components/CookieConsent';
import { AIProvider } from '@/contexts/AIContext';
import { AdminProvider, AdminContext } from '@/contexts/AdminContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import GlobalAIAssistant from '@/components/ai/GlobalAIAssistant';
import ShortcutsOverlay from '@/components/ui/ShortcutsOverlay';
import { AuthContext, AuthProvider } from '@/contexts/AuthContext';
import { GlobalWellnessBar } from '@/components/wellness/GlobalWellnessBar';
import { ClerkSupabaseBridge } from '@/contexts/ClerkSupabaseBridge';
import { courseService } from '@/components/dashboard/courseService';
import MobileNavbar from '@/components/navigation/MobileNavbar';
import GlobalQuickActions from '@/components/navigation/GlobalQuickActions';
// Pages - eagerly loaded (critical path)
import LandingPage from '@/pages/LandingPage';
import Index from "@/pages/Index";
import Dashboard from "@/components/dashboard/Dashboard";
import AIPage from "@/pages/AIPage";
import Upgrade from "@/pages/Upgrade";
import NotFound from "@/pages/NotFound";
import ResetPasswordPage from '@/pages/reset-password';
import AboutUsPage from '@/pages/AboutUsPage';
import ContactUsPage from '@/pages/ContactUsPage';
import HelpPage from '@/pages/HelpPage';
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import CookiePolicy from "@/pages/CookiePolicy";
import GDPRCompliance from "@/pages/GDPRCompliance";
import BlogPage from "@/pages/BlogPage";
import AchievementsPage from "@/pages/Achievements"; // Added Achievements
import AdminMessages from "@/pages/AdminMessages";
import AdminAuthPage from '@/components/auth/AdminAuthPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import SecurityCenter from '@/pages/admin/SecurityCenter';
import ReportsInvestigation from '@/pages/admin/ReportsInvestigation';
import ContentModeration from '@/pages/admin/ContentModeration';
import Analytics from '@/pages/admin/Analytics';
import SupportCenter from '@/pages/admin/SupportCenter';
import AdminSettings from '@/pages/admin/AdminSettings';

// Features - eagerly loaded
import Tasks from "@/components/tasks/Tasks";
import Grades from "@/components/grades/Grades";
import Attendance from "@/components/attendance/Attendance";
import Notes from "@/components/notes/Notes";
import StudyTimer from "@/components/timer/StudyTimer";
import Calculator from "@/components/calculator/Calculator";
import Calendar from "@/components/calendar/CalendarPage";
import Timetable from "@/components/timetable/Timetable";
import CourseManagement from "@/components/courses/CourseManagement";
import Syllabus from "@/components/syllabus/Syllabus";
import Settings from "@/components/settings/Settings";
import ProgressTracker from "@/components/progress/ProgressTracker";
import Wellness from "@/components/wellness/Wellness";

// New AI Features - lazy loaded
const QuizGenerator = lazy(() => import('@/pages/QuizGenerator'));
const EssayHelper = lazy(() => import('@/pages/EssayHelper'));
const StudyPlanner = lazy(() => import('@/pages/StudyPlanner'));
const AIAnalytics = lazy(() => import('@/pages/AIAnalytics'));
const Flashcards = lazy(() => import('@/pages/Flashcards'));
const DoubtSolver = lazy(() => import('@/pages/DoubtSolver'));
const SmartNotes = lazy(() => import('@/pages/SmartNotes'));
const PortfolioBuilder = lazy(() => import('@/pages/PortfolioBuilder'));
const DeadlineTracker = lazy(() => import('@/pages/DeadlineTracker'));
const Docs = lazy(() => import('@/pages/Docs'));
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


import { ProtectedRoute, PremiumRoute, PremiumEliteRoute, AdminProtectedRoute, PageLoader } from '@/components/auth/RouteGuards';
import { BlockedUserOverlay } from '@/components/auth/BlockedUserOverlay';
import { SecurityWarningOverlay } from '@/components/auth/SecurityWarningOverlay';
import { trackActivity } from '@/lib/security/activityTracker';

import SSOCallback from '@/components/auth/SSOCallback';

const AIWidgetWrapper = () => {
  const { session } = useContext(AuthContext);
  if (!session) return null;
  return <GlobalAIAssistant />;
};

import GlobalFooter from '@/components/layout/GlobalFooter';

const GlobalSecurityGuard = ({ children }: { children: React.ReactNode }) => {
  const { isBlocked, blockedReason } = useContext(AuthContext);
  
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

/**
 * AppContent handles the core UI logic and AnimatePresence synchronization.
 * It must be a child of BrowserRouter to use useLocation().
 */
const AppContent = () => {
  const location = useLocation();

  return (
    <ClerkSupabaseBridge>
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
                      <Routes location={location} key={location.pathname}>
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
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                        {/* --- PROTECTED ROUTES (Dashboard) --- */}
                        <Route path="/dashboard" element={<ProtectedRoute><SEO title="Dashboard | MARGDARSHAK" description="Your AI-powered command center." /><Dashboard onNavigate={() => { }} /></ProtectedRoute>} />
                        <Route path="/achievements" element={<ProtectedRoute><SEO title="Achievements | MARGDARSHAK" description="Your progress and badges." /><AchievementsPage /></ProtectedRoute>} />
                        <Route path="/ai-assistant" element={<ProtectedRoute><SEO title="SAARTHI | MARGDARSHAK" description="24/7 AI-powered academic assistance." /><AIPage /></ProtectedRoute>} />
                        <Route path="/upgrade" element={<ProtectedRoute><SEO title="Upgrade to Premium | MARGDARSHAK" description="Unlock advanced AI features and study tools with MARGDARSHAK Premium." /><Upgrade /></ProtectedRoute>} />

                        {/* Core Features */}
                        <Route path="/tasks" element={<ProtectedRoute><SEO title="Task Manager | MARGDARSHAK" description="Organize your academic tasks and deadlines efficiently." /><Tasks /></ProtectedRoute>} />
                        <Route path="/grades" element={<ProtectedRoute><SEO title="Grade Tracker | MARGDARSHAK" description="Track your academic performance and calculate your GPA automatically." /><Grades /></ProtectedRoute>} />
                        <Route path="/attendance" element={<ProtectedRoute><SEO title="Attendance Tracker | MARGDARSHAK" description="Stay on top of your class attendance and requirements." /><Attendance /></ProtectedRoute>} />
                        <Route path="/notes" element={<ProtectedRoute><SEO title="Digital Notes | MARGDARSHAK" description="Create and organize your study notes in one secure place." /><Notes /></ProtectedRoute>} />
                        <Route path="/calendar" element={<ProtectedRoute><SEO title="Academic Calendar | MARGDARSHAK" description="Sync your schedule and never miss an important event." /><Calendar /></ProtectedRoute>} />
                        <Route path="/timetable" element={<ProtectedRoute><SEO title="Timetable Maker | MARGDARSHAK" description="Create a perfect study schedule with our automated timetable generator." /><Timetable /></ProtectedRoute>} />
                        <Route path="/courses" element={<ProtectedRoute><SEO title="Course Management | MARGDARSHAK" description="Manage your subjects and courses with ease." /><CourseManagement /></ProtectedRoute>} />
                        <Route path="/syllabus" element={<ProtectedRoute><SEO title="Syllabus Tracker | MARGDARSHAK" description="Track your progress through your course syllabus." /><Syllabus /></ProtectedRoute>} />

                        <Route path="/progress" element={<ProtectedRoute><SEO title="Progress Tracker | MARGDARSHAK" description="Monitor your academic growth and achievements over time." /><ProgressTracker /></ProtectedRoute>} />
                        <Route path="/wellness" element={<PremiumRoute><SEO title="Student Wellness | MARGDARSHAK" description="Tools for mental well-being and maintaining a healthy study-life balance." /><Wellness /></PremiumRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><SEO title="Settings | MARGDARSHAK" description="Manage your account preferences and security settings." /><Settings /></ProtectedRoute>} />
                        <Route path="/admin/login" element={<AdminAuthPage />} />
                        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
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
                            <Suspense fallback={<PageLoader />}>
                              <QuizGenerator />
                            </Suspense>
                          </PremiumEliteRoute>
                        } />
                        <Route path="/essay-helper" element={
                          <PremiumEliteRoute>
                            <SEO title="Essay Helper | MARGDARSHAK" description="AI writing assistant for essays and academic papers." />
                            <Suspense fallback={<PageLoader />}>
                              <EssayHelper />
                            </Suspense>
                          </PremiumEliteRoute>
                        } />
                        <Route path="/study-planner" element={
                          <PremiumEliteRoute>
                            <SEO title="Smart Study Planner | MARGDARSHAK" description="AI-generated personalized study schedules." />
                            <Suspense fallback={<PageLoader />}>
                              <StudyPlanner />
                            </Suspense>
                          </PremiumEliteRoute>
                        } />
                        <Route path="/ai-analytics" element={
                          <PremiumEliteRoute>
                            <SEO title="AI Analytics | MARGDARSHAK" description="AI-powered insights into your academic performance." />
                            <Suspense fallback={<PageLoader />}>
                              <AIAnalytics />
                            </Suspense>
                          </PremiumEliteRoute>
                        } />
                        <Route path="/flashcards" element={
                          <PremiumEliteRoute>
                            <SEO title="AI Flashcards | MARGDARSHAK" description="AI generated flashcards with Spaced Repetition." />
                            <Suspense fallback={<PageLoader />}>
                              <Flashcards />
                            </Suspense>
                          </PremiumEliteRoute>
                        } />
                        <Route path="/doubt-solver" element={
                          <PremiumEliteRoute>
                            <SEO title="AI Doubt Solver | MARGDARSHAK" description="Step-by-step solutions for complex problems." />
                            <Suspense fallback={<PageLoader />}>
                              <DoubtSolver />
                            </Suspense>
                          </PremiumEliteRoute>
                        } />

                        {/* --- CAREER & PREP ROUTES --- */}
                        <Route path="/smart-notes" element={
                          <PremiumRoute>
                            <SEO title="Smart Notes | MARGDARSHAK" description="Take notes and listen to them with Text-to-Speech." />
                            <Suspense fallback={<PageLoader />}>
                              <SmartNotes />
                            </Suspense>
                          </PremiumRoute>
                        } />
                        <Route path="/portfolio" element={
                          <PremiumRoute>
                            <SEO title="Portfolio Builder | MARGDARSHAK" description="Auto-generate a resume from your real academic data." />
                            <Suspense fallback={<PageLoader />}>
                              <PortfolioBuilder />
                            </Suspense>
                          </PremiumRoute>
                        } />
                        <Route path="/deadlines" element={
                          <PremiumRoute>
                            <SEO title="Exam Deadline Tracker | MARGDARSHAK" description="Track JEE, NEET, SAT and university application deadlines." />
                            <Suspense fallback={<PageLoader />}>
                              <DeadlineTracker />
                            </Suspense>
                          </PremiumRoute>
                        } />
                        <Route path="/docs" element={
                          <ProtectedRoute>
                            <SEO title="Documentation | MARGDARSHAK" description="Official academic and technical knowledge base." />
                            <Suspense fallback={<PageLoader />}>
                              <Docs />
                            </Suspense>
                          </ProtectedRoute>
                        } />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AnimatePresence>
                    <AIWidgetWrapper />
                    <GlobalWellnessBar />
                    <GlobalQuickActions />
                    <MobileNavbar />
                    <ShortcutsOverlay />
                    <GlobalFooter />
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
    </ClerkSupabaseBridge>
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

  return (
    <HelmetProvider>
      <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>} showDialog>
        <QueryClientProvider client={queryClient}>
        <CursorProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </BrowserRouter>
        </CursorProvider>
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
