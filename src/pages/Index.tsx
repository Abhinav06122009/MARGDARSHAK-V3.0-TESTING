import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPageWrapper from '@/components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import Settings from '@/components/settings/Settings';
import Timetable from '@/components/timetable/Timetable';
import Tasks from '@/components/tasks/Tasks';
import StudyTimer from '@/components/timer/StudyTimer';
import Calculator from '@/components/calculator/Calculator';
import Notes from '@/components/notes/Notes';
import Grades from '@/components/grades/Grades';
import Syllabus from '@/components/syllabus/Syllabus';
import Attendance from '@/components/attendance/Attendance';
import CourseManagement from '@/components/courses/CourseManagement';
import ProgressTracker from '@/components/progress/ProgressTracker'; // ✅ Add Progress Tracker import
import { FloatingNav } from '@/components/ui/floating-nav';
import { NotificationSystem, useNotifications } from '@/components/ui/notification-system';
import { motion, AnimatePresence } from 'framer-motion';

// Import Legal Pages
import PrivacyPolicy from '@/components/legal/PrivacyPolicy';
import TermsAndConditions from '@/components/legal/TermsAndConditions';
import UpgradePage from './UpgradePage';

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
    // Auth state is managed by AuthProvider (useAuth). The sign-in welcome
    // notification is handled by the session-tracking useEffect above.
  };

  const handleNavigation = (page: string) => {
    if (page === currentPage) return;
    console.log('Navigating to:', page);
    setCurrentPage(page);
    
    // ✅ Add notification for Progress Tracker navigation
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

  // Loading state with timeout protection
  if (loading || !authChecked) return null;

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
          {renderPage()}
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