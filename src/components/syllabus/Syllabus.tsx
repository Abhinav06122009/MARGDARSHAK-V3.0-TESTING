import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, Plus, FileText, Calendar, Clock, Users, Download, Edit, Trash2,
  Search, Filter, Shield, Eye, BookOpen, GraduationCap, Building, Star,
  AlertCircle, History, Share, MessageCircle, BarChart3, Copy, Archive, LayoutGrid, List, TrendingUp, Palette, CheckCircle
} from 'lucide-react';
import { X } from 'lucide-react';
import logo from "@/components/logo/logo.png";
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/contexts/AuthContext';

// Social Icons
const linkedinLogo = () => (
  <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const TwitterLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
  </svg>
);




interface SyllabusItem {
  id: string;
  user_id: string;
  course_name: string;
  course_code: string;
  semester: string;
  academic_year: string;
  instructor_name: string;
  instructor_email?: string;
  department?: string;
  credits?: number;
  course_type?: string;
  description: string;
  prerequisites?: string[];
  objectives: string[];
  topics: string[];
  assignments: string[];
  grading_criteria: string;
  textbooks: string[];
  supplementary_materials?: string[];
  schedule?: any;
  office_hours?: string;
  contact_info?: any;
  course_policies?: string;
  attendance_policy?: string;
  file_url?: string;
  file_name?: string;
  version: number;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  is_public: boolean;
  approval_status: string;
  tags?: string[];
  language: string;
  difficulty_level: string;
  estimated_workload_hours?: number;
  created_at: string;
  updated_at: string;
}

interface SyllabusStats {
  total_syllabi: number;
  published_syllabi: number;
  draft_syllabi: number;
  archived_syllabi: number;
  public_syllabi: number;
  departments: string[];
  semesters: string[];
  academic_years: string[];
  popular_tags: string[];
}

interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
    department?: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  is_active: boolean;
}

// Enhanced schema - removed enum restrictions for flexible input
const syllabusSchema = z.object({
  course_name: z.string().min(1, 'Course name is required'),
  course_code: z.string().min(1, 'Course code is required'),
  semester: z.string().min(1, 'Semester is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  instructor_name: z.string().min(1, 'Instructor name is required'),
  instructor_email: z.string().email().optional().or(z.literal('')),
  department: z.string().min(1, 'Department is required'),
  credits: z.number().min(1).max(10).optional(),
  course_type: z.string().min(1, 'Course type is required'),
  description: z.string().min(1, 'Description is required'),
  prerequisites: z.string().optional(),
  objectives: z.string().optional(),
  topics: z.string().optional(),
  assignments: z.string().optional(),
  grading_criteria: z.string().optional(),
  textbooks: z.string().optional(),
  supplementary_materials: z.string().optional(),
  office_hours: z.string().optional(),
  course_policies: z.string().optional(),
  attendance_policy: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived', 'under_review']).default('draft'),
  is_public: z.boolean().default(false),
  tags: z.string().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
  estimated_workload_hours: z.number().min(1).max(168).optional(),
});

type SyllabusFormData = z.infer<typeof syllabusSchema>;

interface SyllabusProps {
  onBack: () => void;
}

// Enhanced helper functions
const syllabusHelpers = {
  getCurrentUser: async (): Promise<SecureUser | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        profile: {
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Scholar',
          user_type: profile?.user_type || 'student',
          student_id: profile?.student_id,
          department: profile?.department
        }
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchUserSyllabi: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user syllabi:', error);
      return [];
    }
  },

  getSyllabusStatistics: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_syllabus_statistics');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching syllabus statistics:', error);
      return null;
    }
  },

  searchSyllabi: async (query: string, semester?: string, academicYear?: string) => {
    try {
      const { data, error } = await supabase
        .rpc('search_syllabi', {
          p_query: query || null,
          p_semester: semester || null,
          p_academic_year: academicYear || null,
          p_limit: 50
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching syllabi:', error);
      return [];
    }
  },

  createSyllabus: async (syllabusData: any, userId: string) => {
    try {
      const cleanData = {
        user_id: userId,
        course_name: syllabusData.course_name,
        course_code: syllabusData.course_code,
        semester: syllabusData.semester,
        academic_year: syllabusData.academic_year,
        instructor_name: syllabusData.instructor_name,
        instructor_email: syllabusData.instructor_email || null,
        department: syllabusData.department,
        credits: syllabusData.credits || 3,
        course_type: syllabusData.course_type,
        description: syllabusData.description,
        prerequisites: syllabusData.prerequisites ? syllabusData.prerequisites.split('\n').filter((p: string) => p.trim()) : [],
        objectives: syllabusData.objectives ? syllabusData.objectives.split('\n').filter((obj: string) => obj.trim()) : [],
        topics: syllabusData.topics ? syllabusData.topics.split('\n').filter((topic: string) => topic.trim()) : [],
        assignments: syllabusData.assignments ? syllabusData.assignments.split('\n').filter((assign: string) => assign.trim()) : [],
        grading_criteria: syllabusData.grading_criteria || '',
        textbooks: syllabusData.textbooks ? syllabusData.textbooks.split('\n').filter((book: string) => book.trim()) : [],
        supplementary_materials: syllabusData.supplementary_materials ? syllabusData.supplementary_materials.split('\n').filter((mat: string) => mat.trim()) : [],
        office_hours: syllabusData.office_hours || null,
        course_policies: syllabusData.course_policies || null,
        attendance_policy: syllabusData.attendance_policy || null,
        status: syllabusData.status,
        is_public: syllabusData.is_public || false,
        tags: syllabusData.tags ? syllabusData.tags.split(',').map((tag: string) => tag.trim()) : [],
        language: 'en',
        difficulty_level: syllabusData.difficulty_level || 'intermediate',
        estimated_workload_hours: syllabusData.estimated_workload_hours || null
      };

      const { data, error } = await supabase
        .from('syllabi')
        .insert([cleanData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating syllabus:', error);
      throw error;
    }
  },

  updateSyllabus: async (syllabusId: string, syllabusData: any, userId: string) => {
    try {
      // Create revision before updating
      await supabase.rpc('create_syllabus_revision', {
        p_syllabus_id: syllabusId,
        p_changes_summary: 'Updated syllabus content'
      });

      const cleanData = {
        course_name: syllabusData.course_name,
        course_code: syllabusData.course_code,
        semester: syllabusData.semester,
        academic_year: syllabusData.academic_year,
        instructor_name: syllabusData.instructor_name,
        instructor_email: syllabusData.instructor_email || null,
        department: syllabusData.department,
        credits: syllabusData.credits || 3,
        course_type: syllabusData.course_type,
        description: syllabusData.description,
        prerequisites: syllabusData.prerequisites ? syllabusData.prerequisites.split('\n').filter((p: string) => p.trim()) : [],
        objectives: syllabusData.objectives ? syllabusData.objectives.split('\n').filter((obj: string) => obj.trim()) : [],
        topics: syllabusData.topics ? syllabusData.topics.split('\n').filter((topic: string) => topic.trim()) : [],
        assignments: syllabusData.assignments ? syllabusData.assignments.split('\n').filter((assign: string) => assign.trim()) : [],
        grading_criteria: syllabusData.grading_criteria || '',
        textbooks: syllabusData.textbooks ? syllabusData.textbooks.split('\n').filter((book: string) => book.trim()) : [],
        supplementary_materials: syllabusData.supplementary_materials ? syllabusData.supplementary_materials.split('\n').filter((mat: string) => mat.trim()) : [],
        office_hours: syllabusData.office_hours || null,
        course_policies: syllabusData.course_policies || null,
        attendance_policy: syllabusData.attendance_policy || null,
        status: syllabusData.status,
        is_public: syllabusData.is_public || false,
        tags: syllabusData.tags ? syllabusData.tags.split(',').map((tag: string) => tag.trim()) : [],
        difficulty_level: syllabusData.difficulty_level || 'intermediate',
        estimated_workload_hours: syllabusData.estimated_workload_hours || null
      };

      const { data, error } = await supabase
        .from('syllabi')
        .update(cleanData)
        .eq('id', syllabusId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating syllabus:', error);
      throw error;
    }
  },

  deleteSyllabus: async (syllabusId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('syllabi')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', syllabusId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      throw error;
    }
  },

  // Get unique values for suggestions
  getUniqueSemesters: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('semester')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.semester).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return [];
    }
  },

  getUniqueDepartments: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('department')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.department).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  getUniqueCourseTypes: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabi')
        .select('course_type')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.course_type).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching course types:', error);
      return [];
    }
  }
};

const Syllabus: React.FC<SyllabusProps> = ({ onBack }) => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [syllabusStats, setSyllabusStats] = useState<SyllabusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusItem | null>(null);

  // Suggestion states for autocomplete
  const [semesterSuggestions, setSemesterSuggestions] = useState<string[]>([]);
  const [departmentSuggestions, setDepartmentSuggestions] = useState<string[]>([]);
  const [courseTypeSuggestions, setCourseTypeSuggestions] = useState<string[]>([]);

  const { toast } = useToast();

  const form = useForm<SyllabusFormData>({
    resolver: zodResolver(syllabusSchema),
    defaultValues: {
      course_name: '',
      course_code: '',
      semester: '',
      academic_year: new Date().getFullYear().toString(),
      instructor_name: '',
      instructor_email: '',
      department: '',
      credits: 3,
      course_type: '',
      description: '',
      prerequisites: '',
      objectives: '',
      topics: '',
      assignments: '',
      grading_criteria: '',
      textbooks: '',
      supplementary_materials: '',
      office_hours: '',
      course_policies: '',
      attendance_policy: '',
      status: 'draft',
      is_public: false,
      tags: '',
      difficulty_level: 'intermediate',
      estimated_workload_hours: undefined,
    },
  });

  const { user: authUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      initializeSecureSyllabus();
    }
  }, [authLoading, authUser]);

  const initializeSecureSyllabus = async () => {
    try {
      if (authLoading) return;
      setLoading(true);

      if (!authUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your syllabi.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      const user = {
        id: authUser.id,
        email: authUser.primaryEmailAddress?.emailAddress || '',
        profile: {
          full_name: authUser.fullName || 'Scholar',
          user_type: authUser.profile?.role || 'student',
          student_id: authUser.id.substring(0, 8),
          department: authUser.profile?.department
        }
      } as any;

      setCurrentUser(user);
      setSecurityVerified(true);

      // Set default instructor name from profile
      if (user.profile?.full_name) {
        form.setValue('instructor_name', user.profile.full_name);
      }

      // Set default department from profile
      if (user.profile?.department) {
        form.setValue('department', user.profile.department);
      }

      // Fetch user's syllabi and statistics
      const [userSyllabi, stats] = await Promise.all([
        syllabusHelpers.fetchUserSyllabi(user.id),
        syllabusHelpers.getSyllabusStatistics()
      ]);

      setSyllabi(userSyllabi);
      setSyllabusStats(stats);

      // Load suggestions from user's existing data
      const [semesters, departments, courseTypes] = await Promise.all([
        syllabusHelpers.getUniqueSemesters(user.id),
        syllabusHelpers.getUniqueDepartments(user.id),
        syllabusHelpers.getUniqueCourseTypes(user.id)
      ]);

      setSemesterSuggestions(semesters);
      setDepartmentSuggestions(departments);
      setCourseTypeSuggestions(courseTypes);

      toast({
        title: (
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
            Secure Access Verified
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Welcome {user.profile?.full_name || 'User'}! Your syllabi are here.
          </span>
        ),
        icon: <Shield className="text-emerald-400" />,
        className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
        action: (
          <button
            onClick={() => toast.dismiss()}
            aria-label="Close"
            className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
          >
            <X className="w-5 h-5" />
          </button>
        ),
      });


    } catch (error) {
      console.error('Error initializing secure syllabus:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize secure syllabus system.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SyllabusFormData) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to manage syllabi.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSyllabus) {
        await syllabusHelpers.updateSyllabus(editingSyllabus.id, data, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Syllabus Updated Successfully!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              &quot;<em>{data.course_name}</em>&quot; has been updated in your secure syllabus collection.
            </span>
          ),
          icon: <Edit className="text-emerald-400" />,
          className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
          action: (
            <button
              onClick={() => toast.dismiss()}
              aria-label="Close"
              className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
            >
              <X className="w-5 h-5" />
            </button>
          ),
        });

      } else {
        await syllabusHelpers.createSyllabus(data, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Syllabus Created Successfully!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              &quot;<em>{data.course_name}</em>&quot; has been added to your syllabus collection.
            </span>
          ),
          icon: <Plus className="text-emerald-400" />,
          className: "relative bg-black border border-emerald-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
          action: (
            <button
              onClick={() => toast.dismiss()}
              aria-label="Close"
              className="
        absolute top-2 right-2 p-1 rounded-full 
        text-emerald-400 hover:text-emerald-200 
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
            >
              <X className="w-5 h-5" />
            </button>
          ),
        });

      }

      form.reset();
      setIsDialogOpen(false);
      setEditingSyllabus(null);

      // Refresh syllabi and suggestions
      const userSyllabi = await syllabusHelpers.fetchUserSyllabi(currentUser.id);
      setSyllabi(userSyllabi);

      // Update suggestions
      const [semesters, departments, courseTypes] = await Promise.all([
        syllabusHelpers.getUniqueSemesters(currentUser.id),
        syllabusHelpers.getUniqueDepartments(currentUser.id),
        syllabusHelpers.getUniqueCourseTypes(currentUser.id)
      ]);

      setSemesterSuggestions(semesters);
      setDepartmentSuggestions(departments);
      setCourseTypeSuggestions(courseTypes);

    } catch (error: any) {
      console.error('Error saving syllabus:', error);
      toast({
        title: 'Error Saving Syllabus',
        description: `Failed to save syllabus: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (syllabus: SyllabusItem) => {
    setEditingSyllabus(syllabus);
    form.reset({
      course_name: syllabus.course_name,
      course_code: syllabus.course_code,
      semester: syllabus.semester,
      academic_year: syllabus.academic_year,
      instructor_name: syllabus.instructor_name,
      instructor_email: syllabus.instructor_email || '',
      department: syllabus.department || '',
      credits: syllabus.credits || 3,
      course_type: syllabus.course_type || '',
      description: syllabus.description,
      prerequisites: syllabus.prerequisites?.join('\n') || '',
      objectives: syllabus.objectives?.join('\n') || '',
      topics: syllabus.topics?.join('\n') || '',
      assignments: syllabus.assignments?.join('\n') || '',
      grading_criteria: syllabus.grading_criteria || '',
      textbooks: syllabus.textbooks?.join('\n') || '',
      supplementary_materials: syllabus.supplementary_materials?.join('\n') || '',
      office_hours: syllabus.office_hours || '',
      course_policies: syllabus.course_policies || '',
      attendance_policy: syllabus.attendance_policy || '',
      status: syllabus.status,
      is_public: syllabus.is_public,
      tags: syllabus.tags?.join(', ') || '',
      difficulty_level: (syllabus.difficulty_level as any) || 'intermediate',
      estimated_workload_hours: syllabus.estimated_workload_hours || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) return;
    if (!currentUser) return;

    try {
      await syllabusHelpers.deleteSyllabus(id, currentUser.id);

      toast({
        title: (
          <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
            Syllabus Deleted Successfully
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            &quot;<em>{courseName}</em>&quot; has been moved to trash.
          </span>
        ),
        icon: <Trash2 className="text-red-500" />,
        className: "relative bg-black border border-red-500/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
        action: (
          <button
            onClick={() => toast.dismiss()}
            aria-label="Close"
            className="
        absolute top-2 right-2 p-1 rounded-full 
        text-red-500 hover:text-red-300 
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
          >
            <X className="w-5 h-5" />
          </button>
        ),
      });


      // Refresh syllabi
      const userSyllabi = await syllabusHelpers.fetchUserSyllabi(currentUser.id);
      setSyllabi(userSyllabi);

    } catch (error: any) {
      console.error('Error deleting syllabus:', error);
      toast({
        title: "Error Deleting Syllabus",
        description: `Failed to delete syllabus: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = (syllabus: SyllabusItem) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(63, 81, 181); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(syllabus.course_name.toUpperCase(), 15, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${syllabus.course_code} | ${syllabus.semester} | ${syllabus.academic_year}`, 15, 33);

    // Content
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COURSE DETAILS', 15, 55);

    const detailsData = [
      ['Instructor', syllabus.instructor_name],
      ['Department', syllabus.department || 'N/A'],
      ['Credits', syllabus.credits?.toString() || '3'],
      ['Archive Type', syllabus.course_type || 'N/A'],
      ['Difficulty', syllabus.difficulty_level.toUpperCase()],
      ['Status', syllabus.status.toUpperCase()]
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Field', 'Information']],
      body: detailsData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // Overview
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OVERVIEW', 15, finalY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitDesc = doc.splitTextToSize(syllabus.description, pageWidth - 30);
    doc.text(splitDesc, 15, finalY + 7);
    finalY += (splitDesc.length * 5) + 15;

    // Sections
    const sections = [
      { title: 'LEARNING OBJECTIVES', data: syllabus.objectives },
      { title: 'TOPICS COVERED', data: syllabus.topics },
      { title: 'GRADING CRITERIA', data: [syllabus.grading_criteria] }
    ];

    sections.forEach(section => {
      if (section.data && section.data.length > 0 && section.data[0] !== '') {
        if (finalY > 250) { doc.addPage(); finalY = 20; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 15, finalY);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        section.data.forEach((item, idx) => {
          const splitItem = doc.splitTextToSize(`• ${item}`, pageWidth - 35);
          doc.text(splitItem, 20, finalY + 7 + (idx * 7));
          finalY += (splitItem.length * 7);
        });
        finalY += 10;
      }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated by MARGDARSHAK Elite Student Platform | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`${syllabus.course_code}_Syllabus.pdf`);

    toast({
      title: "PDF Generated",
      description: "Your syllabus has been exported successfully.",
    });
  };

  const handleSearch = async () => {
    if (!currentUser) return;

    try {
      if (searchTerm.trim()) {
        const results = await syllabusHelpers.searchSyllabi(
          searchTerm,
          selectedSemester !== 'all' ? selectedSemester : undefined,
          selectedAcademicYear !== 'all' ? selectedAcademicYear : undefined
        );
        setSyllabi(results);
      } else {
        // Reset to user's syllabi
        const userSyllabi = await syllabusHelpers.fetchUserSyllabi(currentUser.id);
        setSyllabi(userSyllabi);
      }
    } catch (error) {
      console.error('Error searching syllabi:', error);
    }
  };

  const filteredSyllabi = syllabi.filter(syllabus => {
    const matchesSearch = !searchTerm ||
      syllabus.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syllabus.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      syllabus.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || syllabus.status === filterStatus;
    const matchesSemester = selectedSemester === 'all' || syllabus.semester === selectedSemester;
    const matchesYear = selectedAcademicYear === 'all' || syllabus.academic_year === selectedAcademicYear;

    return matchesSearch && matchesStatus && matchesSemester && matchesYear;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingSyllabus(null);
  };

  // Custom input component with suggestions
  const InputWithSuggestions: React.FC<{
    field: any;
    placeholder: string;
    suggestions: string[];
    label: string;
  }> = ({ field, placeholder, suggestions, label }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleInputChange = (value: string) => {
      field.onChange(value);
      if (value.trim()) {
        const filtered = suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    };

    const selectSuggestion = (suggestion: string) => {
      field.onChange(suggestion);
      setShowSuggestions(false);
    };

    return (
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={field.value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setFilteredSuggestions(suggestions);
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold"
        />
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-[100] w-full mt-3 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto overflow-x-hidden custom-scrollbar"
            >
              <div className="p-2">
                {filteredSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    className="px-4 py-3 cursor-pointer rounded-xl text-sm font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-3 group"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 transition-all" />
                    {suggestion}
                  </motion.div>
                ))}
              </div>
              <div className="px-4 py-3 text-[8px] font-black text-zinc-500 uppercase tracking-widest border-t border-white/5 bg-black/20">
                💡 SYLLABI AI
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing secure syllabus system...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Loading Your Data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">Please log in to access your syllabus management system.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <ParallaxBackground />

      {/* Dynamic Neural Substrate */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10 pt-12">
        {/* Enhanced Header Architecture */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8"
        >
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              onClick={onBack}
              className="p-4 bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group"
            >
              <ArrowLeft className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
            </motion.div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">Knowledge Hub</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase flex items-center gap-6">
                Syllabus

              </h1>
              <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs">
                Private Syllabi for <span className="text-white font-bold">{currentUser.profile?.full_name}</span>
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => { resetForm(); setIsDialogOpen(true); }}
                className="h-20 px-10 bg-white text-black hover:bg-zinc-200 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center gap-4 group"
              >
                <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
                Add Syllabi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl bg-zinc-950/90 backdrop-blur-3xl border border-white/5 p-12 rounded-[3rem] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <Palette className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-4xl font-black text-white tracking-tighter uppercase">
                      {editingSyllabus ? 'Update Syllabi' : 'Add Syllabi'}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium text-xs uppercase tracking-widest">
                      Enter the details for your course syllabus below. Fields marked with * are required.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="course_name"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Course Designation" {...field} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-widest text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="course_code"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Syllabi ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CS101" {...field} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-widest text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Semester *</FormLabel>
                          <FormControl>
                            <InputWithSuggestions
                              field={field}
                              placeholder="Semester"
                              suggestions={semesterSuggestions}
                              label="Semester"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="academic_year"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Academic Year *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2024" {...field} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="instructor_name"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Instructor *</FormLabel>
                          <FormControl>
                            <Input placeholder="Instructor Name" {...field} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructor_email"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Instructor Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email" {...field} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">subject
                            *</FormLabel>
                          <FormControl>
                            <InputWithSuggestions
                              field={field}
                              placeholder="Subject"
                              suggestions={departmentSuggestions}
                              label="Department"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="course_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Archive Type *</FormLabel>
                          <FormControl>
                            <InputWithSuggestions
                              field={field}
                              placeholder="Archive Type"
                              suggestions={courseTypeSuggestions}
                              label="Course Type"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="credits"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Syllabi Credits</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="10" placeholder="3" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 3)} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Difficulty</FormLabel>
                    <FormField
                      control={form.control}
                      name="difficulty_level"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-16 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-bold px-6">
                                <SelectValue placeholder="Select Complexity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Overview *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Course description and general overview..." className="min-h-[120px] bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-white focus:border-indigo-500/50 transition-all font-medium resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="objectives"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Learning Objectives (One per line)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="What will students learn?" className="min-h-[120px] bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-white focus:border-indigo-500/50 transition-all font-medium resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="topics"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Topics Covered (One per line)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Weekly topics or major themes..." className="min-h-[120px] bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-white focus:border-indigo-500/50 transition-all font-medium resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormField
                      control={form.control}
                      name="grading_criteria"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Grading Criteria</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Exams: 40%, Quizzes: 20%, Projects: 40%..." className="min-h-[120px] bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-white focus:border-indigo-500/50 transition-all font-medium resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tags (Comma separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="AI, Machine Learning, Python..." className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-6 pt-10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setIsDialogOpen(false); setEditingSyllabus(null); resetForm(); }}
                      className="h-16 px-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      Abort
                    </Button>
                    <Button type="submit" className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                      {editingSyllabus ? 'Update Syllabi' : 'Add Syllabi'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Neural Stats Overview */}
        {syllabusStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {[
              { icon: BookOpen, value: syllabusStats.total_syllabi, label: 'Total Syllabi', gradient: 'from-blue-600 to-indigo-600', shadow: 'rgba(79,70,229,0.3)' },
              { icon: GraduationCap, value: syllabusStats.published_syllabi, label: 'Published Syllabi', gradient: 'from-emerald-600 to-teal-600', shadow: 'rgba(16,185,129,0.3)' },
              { icon: Edit, value: syllabusStats.draft_syllabi, label: 'Draft Syllabi', gradient: 'from-yellow-600 to-orange-600', shadow: 'rgba(245,158,11,0.3)' },
              { icon: Building, value: departmentSuggestions.length, label: 'Departments', gradient: 'from-purple-600 to-pink-600', shadow: 'rgba(168,85,247,0.3)' },
            ].map((stat, index) => (
              <TiltCard key={stat.label} className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-zinc-950/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div 
                        className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                        style={{ boxShadow: `0 10px 30px ${stat.shadow}` }}
                      >
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <span className="text-4xl font-black text-white tracking-tighter">{stat.value}</span>
                    </div>
                    <h3 className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">{stat.label}</h3>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        )}

        {/* Archival Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-zinc-950/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="w-full lg:flex-1">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-3 block">Search Syllabi</Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors h-4 w-4" />
                  <Input
                    placeholder="Search query..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-16 pl-12 bg-black/40 border-2 border-white/5 rounded-2xl text-white transition-all focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="w-full lg:w-64">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-3 block">Filter Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-16 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-bold px-6">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-64">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-3 block">Temporal Filter</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="h-16 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-bold px-6">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                    <SelectItem value="all">All Cycles</SelectItem>
                    {semesterSuggestions.map((semester) => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Syllabus Matrix Grid */}
        <AnimatePresence mode="wait">
          {filteredSyllabi.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32 bg-zinc-950/20 rounded-[3rem] border border-dashed border-white/5"
            >
              <FileText className="h-20 w-20 mx-auto text-zinc-800 mb-6" />
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Syllabi Empty</h3>
              <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs mb-10">
                {syllabi.length === 0 ? 'Add your First Syllabi to Get started' : 'Search query returned no results'}
              </p>
              {syllabi.length === 0 && (
                <Button
                  onClick={() => { resetForm(); setIsDialogOpen(true); }}
                  className="h-16 px-10 bg-indigo-600 text-white hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_20px_40px_rgba(79,70,229,0.3)]"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Initialize First Syllabi
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredSyllabi.map((syllabus, index) => (
                <TiltCard key={syllabus.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative bg-zinc-950/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 group hover:border-indigo-500/30 transition-all duration-700 h-full flex flex-col"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-8">
                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{syllabus.course_code}</span>
                          <h3 className="text-2xl font-black text-white tracking-tighter uppercase group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {syllabus.course_name}
                          </h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${syllabus.status === 'published' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                          syllabus.status === 'draft' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' :
                            'border-zinc-500/20 text-zinc-400 bg-zinc-500/5'
                          }`}>
                          {syllabus.status}
                        </div>
                      </div>

                      <div className="space-y-6 mb-10 flex-grow">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <Users className="h-4 w-4 text-zinc-500" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Instructor</span>
                            <span className="text-xs font-bold text-zinc-300">{syllabus.instructor_name}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                              <Building className="h-3.5 w-3.5 text-indigo-400" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 truncate">{syllabus.department}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <Clock className="h-3.5 w-3.5 text-purple-400" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400">{syllabus.credits} Credits</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{syllabus.semester} • {syllabus.academic_year}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center">
                              <div className="w-4 h-[1px] bg-white/20" />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(syllabus)}
                            className="h-10 w-10 bg-white/5 hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 rounded-xl transition-all"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(syllabus)}
                            className="h-10 w-10 bg-white/5 hover:bg-indigo-500/20 text-zinc-500 hover:text-indigo-400 rounded-xl transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(syllabus.id, syllabus.course_name)}
                            className="h-10 w-10 bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-xl transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { resetForm(); setIsDialogOpen(true); }}
        className="fixed bottom-10 right-10 w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.2)] z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <Plus size={32} className="relative z-10" />
      </motion.button>
    </div>
  );
};

export default Syllabus;
