import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
const Upgrade = lazy(() => import('./Upgrade'));
const Profile = lazy(() => import('./Profile'));
const Status = lazy(() => import('./Status'));
const Sitemap = lazy(() => import('./Sitemap'));

const Index = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { notifications, removeNotification } = useNotifications();

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) return <PageLoader />;
  if (session) return null; 


  return (
    <div className="min-h-screen bg-[#050505]">
      <AuthPageWrapper onLogin={() => {}} />
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default Index;