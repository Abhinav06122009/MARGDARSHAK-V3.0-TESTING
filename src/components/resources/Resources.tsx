import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Upload, Download, Share, Search, Filter, Heart, Eye, Shield, HardDrive,
  FileText, BookOpen, Code, DollarSign, AlertCircle, Star, Trash2, Edit,
  Users, Trophy, Target, Briefcase, Languages, Plus, MoreHorizontal, Folder, LayoutGrid, List, TrendingUp, Palette, CheckCircle
} from 'lucide-react';
import { X } from 'lucide-react';
import logo from "@/components/logo/logo.png";
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { Link } from 'react-router-dom';
import { Label } from '@/components/ui/label';

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

const Footer = () => (
  <footer className="w-full mt-24 border-t border-white/5 relative z-10 overflow-hidden bg-black">
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
      />
    </div>

    <div className="relative max-w-7xl mx-auto px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
          >
            <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MARGDARSHAK</span>
            </h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">by VSAV GYANTAPA</p>
          </motion.div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
            Empowering students with AI-driven scheduling and intelligent academic orchestration. Built for the next generation of learners.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: TwitterLogo, href: "https://x.com/gyantappas", label: "Twitter" },
              { icon: FacebookLogo, href: "https://www.facebook.com/profile.php?id=61584618795158", label: "Facebook" },
              { icon: linkedinLogo, href: "https://www.linkedin.com/in/vsav-gyantapa-33893a399/", label: "LinkedIn" }
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/5 rounded-xl border border-white/10 transition-all text-zinc-400 hover:text-white"
              >
                <social.icon />
              </motion.a>
            ))}
          </div>
        </div>

        {[
          {
            title: "Platform",
            links: [
              { name: "Scheduler", href: "/timetable" },
              { name: "AI Assistant", href: "/ai-assistant" },
              { name: "Quiz Gen", href: "/quiz" },
              { name: "Wellness", href: "/wellness" }
            ]
          },
          {
            title: "Legal",
            links: [
              { name: "Terms of Service", href: "/terms" },
              { name: "Privacy Policy", href: "/privacy" },
              { name: "Cookie Policy", href: "/cookies" },
              { name: "GDPR Compliance", href: "/gdpr" }
            ]
          },
          {
            title: "Support",
            links: [
              { name: "Help Center", href: "/help" },
              { name: "Contact Us", href: "mailto:support@margdarshan.tech" }
            ]
          }
        ].map((section, i) => (
          <div key={i} className="space-y-6">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">{section.title}</h4>
            <ul className="space-y-4">
              {section.links.map((link, j) => (
                <li key={j}>
                  <Link
                    to={link.href}
                    className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center group"
                  >
                    <motion.span
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
                      {link.name}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-zinc-500 text-sm font-medium">
          © 2025 <span className="text-white font-bold">VSAV GYANTAPA</span>. All rights reserved.
        </p>
        <div className="flex items-center gap-6">

          <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">Version 3.0</p>
        </div>
      </div>
    </div>
  </footer>
);


interface ResourcesProps {
  onBack: () => void;
}

interface Resource {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  title?: string;
  description?: string;
  notes?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  language: string;
  grade_level?: string;
  subject?: string;
  difficulty_level: string;
  download_count: number;
  like_count: number;
  view_count: number;
  is_public: boolean;
  is_featured: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at?: string;
}

interface ResourceStats {
  total_resources: number;
  public_resources: number;
  private_resources: number;
  total_downloads: number;
  total_likes: number;
  total_storage_used: number;
  categories: string[];
  languages: string[];
  popular_tags: string[];
}

interface SecureUser {
  id: string;
  email: string;
  profile?: {
    full_name: string;
    role: string;
    subscription_tier?: string;
    student_id?: string;
    preferred_language?: string;
  };
}

interface CategorySummary {
  name: string;
  count: number;
  icon: React.ComponentType<any>;
  color: string;
}

const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  language: z.string().min(1, 'Language is required'),
  grade_level: z.string().optional(),
  subject: z.string().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.string().optional(),
  is_public: z.boolean().default(true),
});

const STORAGE_LIMITS: { [key: string]: number } = {
  'free': 10 * 1024 * 1024 * 1024,        // 10 GB
  'student': 10 * 1024 * 1024 * 1024,     // 10 GB (Free)
  'premium': 50 * 1024 * 1024 * 1024,     // 50 GB
  'premium_elite': 9999999 * 1024 * 1024 * 1024, // Unlimited (approx 10 PB)
  'extra++': 9999999 * 1024 * 1024 * 1024,    // Unlimited
  'admin': 9999999 * 1024 * 1024 * 1024,      // Unlimited
  'superadmin': 9999999 * 1024 * 1024 * 1024, // Unlimited
  'default': 10 * 1024 * 1024 * 1024,     // 10 GB
};

type ResourceFormData = z.infer<typeof resourceSchema>;

// Default category suggestions with icons
const defaultCategoryIcons: { [key: string]: { icon: React.ComponentType<any>, color: string } } = {
  'worksheets': { icon: FileText, color: '#3B82F6' },
  'lesson-plans': { icon: BookOpen, color: '#10B981' },
  'coding': { icon: Code, color: '#8B5CF6' },
  'financial-literacy': { icon: DollarSign, color: '#F59E0B' },
  'interview-prep': { icon: Users, color: '#EF4444' },
  'resume-building': { icon: Briefcase, color: '#06B6D4' },
  'project-challenges': { icon: Target, color: '#84CC16' },
  'career-pathways': { icon: Trophy, color: '#F97316' },
  'presentations': { icon: BookOpen, color: '#EC4899' },
  'documents': { icon: FileText, color: '#6366F1' },
  'templates': { icon: Star, color: '#F59E0B' },
  'study-materials': { icon: BookOpen, color: '#10B981' },
  'assignments': { icon: Edit, color: '#EF4444' },
  'reference': { icon: BookOpen, color: '#8B5CF6' },
};

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
];

// Enhanced helper functions for Resources
const resourceHelpers = {
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
        profile: profile ? {
          full_name: profile.full_name || 'User',
          role: profile.role || 'student',
          subscription_tier: profile.subscription_tier || 'free',
          student_id: profile.student_id,
          preferred_language: profile.preferred_language || 'en'
        } : undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  fetchUserResources: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user resources:', error);
      return [];
    }
  },

  getResourceStatistics: async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_resource_statistics');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching resource statistics:', error);
      return null;
    }
  },

  // NEW: Get unique categories from user's resources
  getUserCategories: async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('category')
        .eq('user_id', userId)
        .eq('is_deleted', false);

      if (error) throw error;
      return [...new Set(data?.map(item => item.category).filter(Boolean))];
    } catch (error) {
      console.error('Error fetching user categories:', error);
      return [];
    }
  },

  searchResources: async (query: string, category?: string, language?: string) => {
    try {
      const { data, error } = await supabase
        .rpc('search_resources', {
          p_query: query || null,
          p_category: category || null,
          p_language: language || null,
          p_limit: 50
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching resources:', error);
      return [];
    }
  },

  uploadFile: async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('school-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school-files')
        .getPublicUrl(fileName);

      return {
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  createResource: async (resourceData: any, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          ...resourceData,
          user_id: userId,
          tags: resourceData.tags ? resourceData.tags.split(',').map((tag: string) => tag.trim()) : []
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  updateResource: async (resourceId: string, resourceData: any, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({
          ...resourceData,
          tags: resourceData.tags ? resourceData.tags.split(',').map((tag: string) => tag.trim()) : []
        })
        .eq('id', resourceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  deleteResource: async (resourceId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', resourceId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  trackDownload: async (resourceId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('track_resource_download', {
          p_resource_id: resourceId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking download:', error);
      throw error;
    }
  },

  toggleLike: async (resourceId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('toggle_resource_like', {
          p_resource_id: resourceId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
};

import SupabaseStatus from '@/components/SupabaseStatus';

const Resources: React.FC<ResourcesProps> = ({ onBack }) => {
  const [currentUser, setCurrentUser] = useState<SecureUser | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [storageLimit, setStorageLimit] = useState(STORAGE_LIMITS['default']);
  // NEW: State for dynamic categories and suggestions
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { toast } = useToast();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      language: 'en',
      grade_level: '',
      subject: '',
      difficulty_level: 'beginner',
      tags: '',
      is_public: true,
    },
  });

  useEffect(() => {
    initializeSecureResources();
  }, []);

  const initializeSecureResources = async () => {
    try {
      setLoading(true);

      const user = await resourceHelpers.getCurrentUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your resources.",
          variant: "destructive",
        });
        setSecurityVerified(true);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      setSecurityVerified(true);

      const userTier = user.profile?.subscription_tier || 'free';
      const userRole = user.profile?.role || 'student';

      // Tier-based limit takes precedence, then role-based fallback
      const limit = STORAGE_LIMITS[userTier] || STORAGE_LIMITS[userRole] || STORAGE_LIMITS['default'];
      setStorageLimit(limit);

      // Set default language from user preference
      if (user.profile?.preferred_language) {
        setSelectedLanguage(user.profile.preferred_language);
        form.setValue('language', user.profile.preferred_language);
      }

      // Fetch user's resources, statistics, and categories
      const [userResources, stats, categories] = await Promise.all([
        resourceHelpers.fetchUserResources(user.id),
        resourceHelpers.getResourceStatistics(),
        resourceHelpers.getUserCategories(user.id)
      ]);

      setResources(userResources);
      setResourceStats(stats);
      setUserCategories(categories);

      // Set default category suggestions
      setCategorySuggestions([
        ...categories, // User's existing categories
        ...Object.keys(defaultCategoryIcons) // Default suggestions
      ]);

      toast({
        title: (
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
            Secure Access Verified
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Welcome {user.profile?.full_name || 'User'}! Your resources are private and secure.
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
      console.error('Error initializing secure resources:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize secure resources system.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic category summaries
  const getCategorySummaries = (): CategorySummary[] => {
    const categoryMap = new Map<string, number>();

    resources.forEach(resource => {
      const count = categoryMap.get(resource.category) || 0;
      categoryMap.set(resource.category, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => {
      const defaultIcon = defaultCategoryIcons[name.toLowerCase().replace(/\s+/g, '-')];
      return {
        name,
        count,
        icon: defaultIcon?.icon || Folder,
        color: defaultIcon?.color || '#6B7280'
      };
    }).sort((a, b) => b.count - a.count);
  };

  // Custom input component with category suggestions
  const CategoryInputWithSuggestions: React.FC<{
    field: any;
    placeholder: string;
  }> = ({ field, placeholder }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleInputChange = (value: string) => {
      field.onChange(value);
      if (value.trim()) {
        const filtered = categorySuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions([...new Set(filtered)]);
        setShowCategorySuggestions(filtered.length > 0);
      } else {
        setShowCategorySuggestions(false);
      }
    };

    const selectSuggestion = (suggestion: string) => {
      field.onChange(suggestion);
      setShowCategorySuggestions(false);
    };

    return (
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={field.value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (categorySuggestions.length > 0) {
              setFilteredSuggestions(categorySuggestions.slice(0, 10));
              setShowCategorySuggestions(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
          className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold"
        />
        <AnimatePresence>
          {showCategorySuggestions && filteredSuggestions.length > 0 && (
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
                💡 RESOURCE SUGGESTION AI
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleFileUpload = async (file: File) => {
    if (!currentUser) throw new Error('User not authenticated');
    return await resourceHelpers.uploadFile(file, currentUser.id);
  };

  const onSubmit = async (data: ResourceFormData) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upload resources.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      let fileData = {};
      
      if (!editingResource) {
        const file = selectedFile;

        if (!file) {
          toast({
            title: (
              <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
                File Required
              </span>
            ),
            description: (
              <span className="text-white font-medium">
                Please select a file to upload.
              </span>
            ),
            icon: <AlertCircle className="text-red-500" />,
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

          return;
        }

        // Check storage limit before uploading
        const currentUsage = resourceStats?.total_storage_used || 0;
        if (currentUsage + file.size > storageLimit) {
          toast({
            title: 'Storage Limit Exceeded',
            description: `You cannot upload this file. Your storage is full. Used ${formatFileSize(currentUsage)} of ${formatFileSize(storageLimit)}.`,
            variant: 'destructive',
          });
          return;
        }

        fileData = await handleFileUpload(file);
      }

      const resourceData = {
        title: data.title,
        description: data.description,
        category: data.category.trim(), // Ensure category is trimmed
        language: data.language,
        grade_level: data.grade_level,
        subject: data.subject,
        difficulty_level: data.difficulty_level,
        tags: data.tags,
        is_public: data.is_public,
        file_name: editingResource?.file_name || selectedFile?.name,
        ...fileData,
      };

      if (editingResource) {
        await resourceHelpers.updateResource(editingResource.id, resourceData, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Resource Updated Successfully!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              &quot;<em>{data.title}</em>&quot; has been updated in your secure resource library.
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
        await resourceHelpers.createResource(resourceData, currentUser.id);
        toast({
          title: (
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Resource Uploaded Successfully!
            </span>
          ),
          description: (
            <span className="text-white font-medium">
              &quot;<em>{data.title}</em>&quot; has been added to your private resource collection.
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

      setIsDialogOpen(false);
      setEditingResource(null);
      setSelectedFile(null);
      form.reset();

      // Refresh resources and categories
      const [userResources, categories] = await Promise.all([
        resourceHelpers.fetchUserResources(currentUser.id),
        resourceHelpers.getUserCategories(currentUser.id)
      ]);

      setResources(userResources);
      setUserCategories(categories);

      // Update category suggestions
      setCategorySuggestions([
        ...categories,
        ...Object.keys(defaultCategoryIcons)
      ]);

    } catch (error: any) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Error Saving Resource',
        description: `Failed to save resource: ${error.message || 'Please try again.'}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    form.setValue('title', resource.title || resource.file_name);
    form.setValue('description', resource.description || '');
    form.setValue('category', resource.category);
    form.setValue('language', resource.language);
    form.setValue('grade_level', resource.grade_level || '');
    form.setValue('subject', resource.subject || '');
    form.setValue('difficulty_level', resource.difficulty_level);
    form.setValue('tags', resource.tags?.join(', ') || '');
    form.setValue('is_public', resource.is_public);
    setIsDialogOpen(true);
  };

  const handleDelete = async (resourceId: string, resourceTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${resourceTitle}"? This action cannot be undone.`)) return;
    if (!currentUser) return;

    try {
      await resourceHelpers.deleteResource(resourceId, currentUser.id);

      toast({
        title: (
          <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
            Resource Deleted Successfully
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            &quot;<em>{resourceTitle}</em>&quot; has been moved to trash.
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


      // Refresh resources and categories
      const [userResources, categories] = await Promise.all([
        resourceHelpers.fetchUserResources(currentUser.id),
        resourceHelpers.getUserCategories(currentUser.id)
      ]);

      setResources(userResources);
      setUserCategories(categories);

    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error Deleting Resource",
        description: `Failed to delete resource: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Track download
      await resourceHelpers.trackDownload(resource.id);

      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: (
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent font-bold">
            Download Started
          </span>
        ),
        description: (
          <span className="text-white font-medium">
            Your file download has started
          </span>
        ),
        icon: <Download className="text-blue-400" />,
        className: "relative bg-black border border-blue-400/70 shadow-xl px-6 py-4 pr-12 rounded-lg max-w-sm",
        action: (
          <button
            onClick={() => toast.dismiss()}
            aria-label="Close"
            className="
        absolute top-2 right-2 p-1 rounded-full 
        text-blue-400 hover:text-blue-200 
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
        transition-colors duration-300 shadow-md hover:shadow-lg
      "
          >
            <X className="w-5 h-5" />
          </button>
        ),
      });


      // Refresh resources to update download count
      if (currentUser) {
        const userResources = await resourceHelpers.fetchUserResources(currentUser.id);
        setResources(userResources);
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast({
        title: "Error",
        description: "Failed to download resource",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (resource: Resource) => {
    const shareUrl = resource.file_url;

    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title || resource.file_name,
          text: resource.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Resource link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
      toast({
        title: "Error",
        description: "Failed to share resource",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (resourceId: string) => {
    if (!currentUser) return;

    try {
      await resourceHelpers.toggleLike(resourceId);

      // Refresh resources to update like count
      const userResources = await resourceHelpers.fetchUserResources(currentUser.id);
      setResources(userResources);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSearch = async () => {
    if (!currentUser) return;

    try {
      if (searchTerm.trim()) {
        const results = await resourceHelpers.searchResources(
          searchTerm,
          selectedCategory !== 'all' ? selectedCategory : undefined,
          selectedLanguage !== 'all' ? selectedLanguage : undefined
        );
        setResources(results);
      } else {
        // Reset to user's resources
        const userResources = await resourceHelpers.fetchUserResources(currentUser.id);
        setResources(userResources);
      }
    } catch (error) {
      console.error('Error searching resources:', error);
    }
  };

  const getFilteredResources = (category: string = 'all') => {
    return resources.filter(resource => {
      const matchesSearch = !searchTerm ||
        resource.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = category === 'all' || resource.category === category;
      const matchesLanguage = selectedLanguage === 'all' || resource.language === selectedLanguage;

      return matchesSearch && matchesCategory && matchesLanguage;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i < 0) return '0 Bytes';
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    form.reset();
    setEditingResource(null);
  };

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing secure resources system...</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm">Maximum Security Active</span>
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
          <p className="text-white/70 mb-6">Please log in to access your private resources system.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
              <Shield className="w-4 h-4" />
              <span>Your resources are completely private and secure</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categorySummaries = getCategorySummaries();

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
                <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">Knowledge HUB</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase flex items-center gap-6">
                Resource

              </h1>
              <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs">
                RESOUCES for <span className="text-white font-bold">{currentUser.profile?.full_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="h-16 w-56 bg-zinc-950/40 backdrop-blur-3xl border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-bold px-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                <SelectItem value="all">ALL Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-bold">{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => { resetForm(); setSelectedFile(null); setIsDialogOpen(true); }}
                  className="h-20 px-10 bg-white text-black hover:bg-zinc-200 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center gap-4 group"
                >
                  <Upload className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                  ADD Upload
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
                        {editingResource ? 'UPDATE RESOURCE' : 'Resource ADD'}
                      </DialogTitle>
                      <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest">Secure Data Transfer Substrate</p>
                    </div>
                  </div>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    {!editingResource && (
                      <div className="p-10 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-black/20 hover:bg-black/40 transition-all group">
                        <label className="flex flex-col items-center justify-center cursor-pointer space-y-4">
                          <div className="p-6 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                          <div className="text-center">
                            {selectedFile ? (
                              <div className="flex flex-col items-center gap-2">
                                <p className="text-emerald-400 font-black uppercase tracking-widest text-xs">File Ready</p>
                                <p className="text-white font-bold text-lg tracking-tight">{selectedFile.name}</p>
                                <p className="text-zinc-500 text-[10px] uppercase font-medium">{formatFileSize(selectedFile.size)}</p>
                              </div>
                            ) : (
                              <>
                                <p className="text-white font-black uppercase tracking-widest text-xs">Select FILE TO UPLOAD</p>
                                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest mt-1">PDF, DOC, Multimedia (Max: 50MB)</p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3,.txt,.zip"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">RESOURCE NAME *</FormLabel>
                            <FormControl>
                              <Input placeholder="Resource" {...field} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-black tracking-widest text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Classification *</FormLabel>
                            <FormControl>
                              <CategoryInputWithSuggestions
                                field={field}
                                placeholder="Classification"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">DESCRIPTION *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Overview..." className="min-h-[160px] bg-black/40 border-2 border-white/5 rounded-2xl p-6 text-white focus:border-indigo-500/50 transition-all font-medium resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">RESOURCE LANGUAGE *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-16 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-bold px-6">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                                {languages.map((lang) => (
                                  <SelectItem key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="difficulty_level"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">DIFFICULTY</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-16 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-bold px-6">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Target Tier</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Grade 10" {...field} className="h-16 bg-black/40 border-2 border-white/5 rounded-2xl px-6 text-white focus:border-indigo-500/50 transition-all font-bold" />
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
                        onClick={() => setIsDialogOpen(false)}
                        className="h-16 px-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                      >
                        Abort
                      </Button>
                      <Button type="submit" disabled={uploading} className="h-16 px-12 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                        {uploading ? 'Processing Stream...' : (editingResource ? 'UPDATE RESOURCE' : 'UPLOAD RESOURCE')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Neural Stats Overview */}
        {resourceStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {[
              { icon: FileText, value: resourceStats.total_resources, label: 'TOTAL RESOURCES', gradient: 'from-blue-600 to-indigo-600', shadow: 'rgba(79,70,229,0.3)' },
              { icon: Download, value: resourceStats.total_downloads, label: 'TOTAL DOWNLOADS', gradient: 'from-emerald-600 to-teal-600', shadow: 'rgba(16,185,129,0.3)' },
              { icon: Heart, value: resourceStats.total_likes, label: 'RESOURCE STATS', gradient: 'from-red-600 to-pink-600', shadow: 'rgba(239,68,68,0.3)' },
              { icon: HardDrive, value: formatFileSize(resourceStats?.total_storage_used || 0), label: 'YOUR Storage', gradient: 'from-purple-600 to-fuchsia-600', shadow: 'rgba(168,85,247,0.3)' },
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
                      <span className="text-3xl font-black text-white tracking-tighter">{stat.value}</span>
                    </div>
                    <h3 className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">{stat.label}</h3>
                    {stat.icon === HardDrive && (
                      <div className="mt-6 space-y-2">
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${storageLimit > 1000 * 1024 * 1024 * 1024 ? 0 : Math.min(100, ((resourceStats?.total_storage_used || 0) / (storageLimit || 1)) * 100)}%`
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-indigo-500 h-full"
                          />
                        </div>
                        <p className="text-right text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                          {storageLimit > 1000 * 1024 * 1024 * 1024
                            ? 'Unlimited Capacity'
                            : `${(((resourceStats?.total_storage_used || 0) / (storageLimit || 1)) * 100).toFixed(1)}% Capacity`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </motion.div>
        )}

        {/* Archival Search Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-zinc-950/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="w-full lg:flex-1">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-3 block">Search</Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors h-4 w-4" />
                  <Input
                    placeholder="Search query..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-16 pl-12 bg-black/40 border-2 border-white/5 rounded-2xl text-white transition-all focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="w-full lg:w-64">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-3 block">Filter</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-16 bg-black/40 border-2 border-white/5 text-white rounded-2xl focus:ring-indigo-500/30 font-bold px-6">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/90 backdrop-blur-2xl border-white/10 text-white rounded-2xl">
                    <SelectItem value="all">ALL SUBJECT</SelectItem>
                    {userCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                className="h-16 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                SEARCH
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Category Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-4 bg-transparent h-auto p-0 mb-12">
              <TabsTrigger
                value="all"
                className="h-14 px-8 rounded-2xl border-2 border-white/5 bg-zinc-950/20 text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-white font-black uppercase tracking-widest text-[10px] transition-all"
              >
                ALL RESOURCES ({resources.length})
              </TabsTrigger>
              {categorySummaries.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.name}
                    value={category.name}
                    className="h-14 px-8 rounded-2xl border-2 border-white/5 bg-zinc-950/20 text-zinc-500 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3"
                  >
                    <Icon className="w-4 h-4" />
                    {category.name} ({category.count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="all" className="mt-0 outline-none">
              <ResourceGrid resources={getFilteredResources('all')} />
            </TabsContent>

            {categorySummaries.map((category) => (
              <TabsContent key={category.name} value={category.name} className="mt-0 outline-none">
                <ResourceGrid resources={getFilteredResources(category.name)} />
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        <Footer />
      </div>
    </div>
  );

  // Resource Grid Component
  function ResourceGrid({ resources: filteredResources }: { resources: Resource[] }) {
    if (filteredResources.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 bg-zinc-950/20 rounded-[3rem] border border-dashed border-white/5"
        >
          <FileText className="h-20 w-20 mx-auto text-zinc-800 mb-6" />
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">NO RESOURCE</h3>
          <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs mb-8">
            {searchTerm || selectedCategory !== 'all' || selectedLanguage !== 'all'
              ? 'Filter returned zero entities'
              : 'Add your first resource to begin'
            }
          </p>
          <Button
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            className="h-16 px-10 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            ADD First RESOURCE
          </Button>
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredResources.map((resource, index) => {
            const defaultIcon = defaultCategoryIcons[resource.category.toLowerCase().replace(/\s+/g, '-')];
            const Icon = defaultIcon?.icon || Folder;
            const language = languages.find(l => l.code === resource.language);

            return (
              <TiltCard key={resource.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-zinc-950/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 group hover:border-indigo-500/30 transition-all duration-700 h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                          <Icon className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-2xl font-black text-white tracking-tighter uppercase group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {resource.title || resource.file_name}
                          </h3>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">{resource.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(resource)}
                          className="h-10 w-10 bg-white/5 hover:bg-indigo-500/20 text-zinc-500 hover:text-indigo-400 rounded-xl transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(resource.id, resource.title || resource.file_name)}
                          className="h-10 w-10 bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6 flex-grow">
                      <p className="text-zinc-500 font-medium text-xs uppercase tracking-tight line-clamp-3 leading-relaxed">
                        {resource.description || resource.notes || 'No description node available'}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                          {resource.file_type}
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                          {formatFileSize(resource.file_size)}
                        </div>
                        {language && (
                          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <span>{language.flag}</span> {language.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                      <div className="flex items-center gap-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        <div className="flex items-center gap-2 group/stat">
                          <Download className="w-4 h-4 text-zinc-700 group-hover/stat:text-emerald-400 transition-colors" />
                          <span className="group-hover/stat:text-white transition-colors">{resource.download_count}</span>
                        </div>
                        <div className="flex items-center gap-2 group/stat cursor-pointer" onClick={() => handleLike(resource.id)}>
                          <Heart className="w-4 h-4 text-zinc-700 group-hover/stat:text-red-400 transition-colors" />
                          <span className="group-hover/stat:text-white transition-colors">{resource.like_count}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(resource)}
                          className="h-12 px-6 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-[8px] transition-all"
                        >
                          Extract
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleShare(resource)}
                          className="h-12 w-12 bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-2xl transition-all"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }
};

export default Resources;
