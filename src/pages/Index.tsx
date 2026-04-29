import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPageWrapper from '@/components/auth/AuthPage';
import { FloatingNav } from '@/components/ui/floating-nav';
import { NotificationSystem, useNotifications } from '@/components/ui/notification-system';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader } from '@/components/auth/RouteGuards';

// Lazy load feature components to keep initial bundle small
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const Settings = lazy(() => import('@/components/settings/Settings'));
const Timetable = lazy(() => import('@/components/timetable/Timetable'));
const Tasks = lazy(() => import('@/components/tasks/Tasks'));
const StudyTimer = lazy(() => import('@/components/timer/StudyTimer'));
const Calculator = lazy(() => import('@/components/calculator/Calculator'));
const Notes = lazy(() => import('@/components/notes/Notes'));
const Grades = lazy(() => import('@/components/grades/Grades'));
const Syllabus = lazy(() => import('@/components/syllabus/Syllabus'));
const Attendance = lazy(() => import('@/components/attendance/Attendance'));
const CourseManagement = lazy(() => import('@/components/courses/CourseManagement'));
const ProgressTracker = lazy(() => import('@/components/progress/ProgressTracker'));
const PrivacyPolicy = lazy(() => import('@/components/legal/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('@/components/legal/TermsAndConditions'));
const UpgradePage = lazy(() => import('./UpgradePage'));

const Index = () => {
  const { session, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { notifications, addNotification, removeNotification } = useNotifications();

  const isAuthenticated = !!session;
  const authChecked = !loading;

  // Show a welcome notification the first time a session appears (sign-in).
  const prevSessionRef = useRef<boolean>(false);
  useEffect(() => {
    if (session && !prevSessionRef.current) {
      addNotification({
        type: 'success',
        title: 'Welcome!',
        message: 'Successfully logged in',
        duration: 3000
      });
    }
    prevSessionRef.current = !!session;
  }, [session, addNotification]);

  const handleLogin = () => {
    // Auth state is managed by AuthProvider (useAuth).
  };

  const handleNavigation = (page: string) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    
    if (page === 'progress') {
      addNotification({
        type: 'info',
        title: 'Progress Tracker',
        message: 'Track your goals and achievements',
        duration: 2000
      });
    }
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // Initial loading state
  if (loading) return <PageLoader />;

  // Auth page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <AuthPageWrapper onLogin={handleLogin} />
        <NotificationSystem
          notifications={notifications}
          onRemove={removeNotification}
        />
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransitions = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'courses':
          return <CourseManagement />;
        case 'timetable':
          return <Timetable onBack={handleBackToDashboard} />;
        case 'tasks':
          return <Tasks onBack={handleBackToDashboard} />;
        case 'timer':
          return <StudyTimer onBack={handleBackToDashboard} />;
        case 'calculator':
          return <Calculator onBack={handleBackToDashboard} />;
        case 'notes':
          return <Notes onBack={handleBackToDashboard} />;
        case 'grades':
          return <Grades onBack={handleBackToDashboard} />;
        case 'attendance':
          return <Attendance onBack={handleBackToDashboard} />;
        case 'progress': // ✅ Add Progress Tracker case
          return <ProgressTracker onBack={handleBackToDashboard} />;
        case 'syllabus':
          return <Syllabus onBack={handleBackToDashboard} />;
        case 'privacy':
          return <PrivacyPolicy onBack={handleBackToDashboard} />;
        case 'terms':
          return <TermsAndConditions onBack={handleBackToDashboard} />;
        case 'settings':
          return <Settings onBack={handleBackToDashboard} />;
        case 'upgrade':
          return <UpgradePage onBack={handleBackToDashboard} />;
        default:
          return <Dashboard onNavigate={handleNavigation} />;
      }
    } catch (error) {
      console.error('Page render error:', error);
      return (
        <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center p-6">
          <div className="glass-morphism rounded-lg p-8 shadow-lg max-w-md w-full text-center">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Page Error</h1>
            <p className="text-white/80 mb-6">Something went wrong loading this page</p>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="bg-gradient-button-primary text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-cosmic"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransitions}
          className="relative z-10"
        >
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      <FloatingNav
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />

      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </motion.div>
  );
};

export default Index;