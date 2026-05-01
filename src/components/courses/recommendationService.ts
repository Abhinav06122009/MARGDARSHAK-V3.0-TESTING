import type { Course } from '@/components/dashboard/course';
import type { Task } from '@/components/tasks/types';
import { supabase } from '@/integrations/supabase/client';
import { authedFetch } from '@/lib/ai/authedFetch';

export interface RecommendedCourse extends Course {
  recommendationReason: string;
}

export interface LearningPath {
  title: string;
  description: string;
  steps: any[];
}

export interface CuratedContent {
  title: string;
  url: string;
  type: 'video' | 'article' | 'tutorial';
}

const recommendationService = {
  getPersonalizedRecommendations: async (
    userId: string,
    existingCourses: Course[]
  ): Promise<RecommendedCourse[]> => {
    // Keep this as a fast heuristic for the sidebar/quick recs
    const existingCourseIds = new Set(existingCourses.map(c => c.id));
    const { data: allCoursesData, error } = await supabase.from('courses').select('*');
    if (error) return [];
    const allCourses: Course[] = allCoursesData || [];
    const recommendations: RecommendedCourse[] = [];
    const lastCourse = existingCourses[existingCourses.length - 1];
    
    if (lastCourse && lastCourse.difficulty === 'beginner') {
      const nextLevelCourse = allCourses.find(c => !existingCourseIds.has(c.id) && c.difficulty === 'intermediate');
      if (nextLevelCourse) {
        recommendations.push({ ...nextLevelCourse, recommendationReason: `Based on your completion of ${lastCourse.name}, this is a great next step.` });
      }
    }
    
    const foundationalCourse = allCourses.find(c => c.code?.toUpperCase().includes('CS') && c.difficulty === 'intermediate' && !existingCourseIds.has(c.id));
    if (foundationalCourse) {
      recommendations.push({ ...foundationalCourse, recommendationReason: 'This is a foundational course for many advanced topics.' });
    }

    if (recommendations.length < 3) {
      const fallbacks = allCourses.filter(c => !existingCourseIds.has(c.id) && !recommendations.some(r => r.id === c.id));
      for (const fallback of fallbacks) {
        if (recommendations.length >= 3) break;
        recommendations.push({ ...fallback, recommendationReason: 'Broaden your skillset with this course.' });
      }
    }

    return recommendations.slice(0, 3);
  },

  generateLearningPath: async (userId: string, goal: string): Promise<LearningPath> => {
    try {
      // 1. Fetch lightweight academic context
      const ctxRes = await authedFetch('/.netlify/functions/timetable-crud', {
        method: 'POST',
        body: JSON.stringify({ action: 'fetch-academic-context', userId })
      });
      const ctx = ctxRes.ok ? await ctxRes.json() : { tasks: [], syllabi: [] };

      // 2. Format context for AI
      const coursesCtx = (ctx.syllabi || []).slice(0, 3).map((s: any) => 
        `- ${s.course_name}: ${s.topics?.slice(0,2).join(', ') || 'N/A'}`
      ).join('\n') || 'None';

      const tasksCtx = (ctx.tasks || []).slice(0, 3).map((t: any) => 
        `- ${t.title}`
      ).join('\n') || 'None';

      const prompt = `Student Goal: "${goal}"
Courses: ${coursesCtx}
Tasks: ${tasksCtx}

As Saarthi AI, create a 4-step path. Return ONLY valid JSON:
{
  "title": "Path Name",
  "description": "Short summary",
  "steps": [
    {"id": "1", "name": "Topic", "description": "Details", "difficulty": "intermediate", "credits": 3}
  ]
}`;

      // 3. Call AI without strict JSON mode (faster)
      const aiRes = await authedFetch('/.netlify/functions/neuro-engine', {
        method: 'POST',
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: prompt }], 
          model: 'qwen-safety',
          task: 'research'
        })
      });

      if (!aiRes.ok) throw new Error('AI generation failed');
      const data = await aiRes.json();
      
      let rawText = data.response || "";
      let result;

      try {
        // Robust Extraction: Look for the first { and last }
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonCandidate = rawText.substring(firstBrace, lastBrace + 1);
          result = JSON.parse(jsonCandidate);
        } else {
          throw new Error('No JSON object found in response');
        }
      } catch (parseErr) {
        console.error('Failed to parse AI response:', rawText);
        throw parseErr;
      }

      return {
        title: result.title || 'AI Generated Path',
        description: result.description || 'Custom path created by Saarthi.',
        steps: result.steps || []
      };

    } catch (error) {
      console.error('Error generating AI Learning Path:', error);
      return {
        title: 'Academic Path (Fallback)',
        description: 'Saarthi encountered an error, using default sequence.',
        steps: [
          { id: 'db-102', name: 'Database Design', description: 'Understand relational database design.', difficulty: 'beginner', credits: 3 },
          { id: 'ds-201', name: 'Data Structures', description: 'Master core data structures.', difficulty: 'intermediate', credits: 4 },
          { id: 'web-301', name: 'Advanced Web Dev', description: 'Build complex web applications.', difficulty: 'advanced', credits: 4 },
        ]
      };
    }
  },

  getCuratedContent: async (course: Course): Promise<CuratedContent[]> => {
    return [
      { title: `Crash Course: ${course.name}`, url: 'https://youtube.com', type: 'video' },
      { title: `In-depth article on ${course.code}`, url: 'https://medium.com', type: 'article' },
      { title: `Interactive tutorial for ${course.name}`, url: 'https://www.freecodecamp.org/', type: 'tutorial' },
    ];
  },

  getRelatedTasks: async (courseId: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status')
      .eq('course_id', courseId)
      .eq('is_deleted', false)
      .limit(5);

    if (error) {
      console.error('Error fetching related tasks:', error);
      return [];
    }
    return data || [];
  },
};

export { recommendationService };