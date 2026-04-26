import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Note } from './types';
import { Clock, Edit, FileText, Heart, Share, Star, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface NoteCardProps {
  note: Note;
  index: number;
  onEdit: (note: Note) => void;
  onDelete: (id: string, title: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onShare: (note: Note) => void;
  isSelected: boolean;
  onSelectNote: (id: string) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, index, onEdit, onDelete, onToggleFavorite, onShare, isSelected, onSelectNote }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    
    x.set(cursorX / rect.width - 0.5);
    y.set(cursorY / rect.height - 0.5);

    e.currentTarget.style.setProperty('--mouse-x', `${cursorX}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${cursorY}px`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative bg-zinc-950/80 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 transition-all duration-700 hover:border-indigo-500/30 group overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] h-full flex flex-col"
      >
        {/* Dynamic Cursor Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.15), transparent 40%)`,
          }}
        />
        
        {/* Parallax Substrate */}
        <motion.div 
          style={{ translateZ: 50 }}
          className="absolute -right-24 -top-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" 
        />
        <div className="mb-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Checkbox checked={isSelected} onCheckedChange={() => onSelectNote(note.id)} className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 rounded-md" />
              <motion.h3 
                style={{ translateZ: 40 }}
                className="font-black text-white text-xl tracking-tight cursor-pointer hover:text-indigo-400 transition-colors" 
                onClick={() => onEdit(note)}
              >
                {note.title}
              </motion.h3>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onToggleFavorite(note.id, note.is_favorite)} 
                className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all ${note.is_favorite ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-zinc-500 hover:text-red-400'}`}
              >
                <Heart className={`w-5 h-5 ${note.is_favorite ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onEdit(note)} 
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 text-zinc-500 hover:text-blue-400 transition-all"
              >
                <Edit className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="cursor-pointer" onClick={() => onEdit(note)}>
            {note.content && (
              <p className="text-zinc-400 text-sm font-medium line-clamp-3 leading-relaxed">
                {note.content}
              </p>
            )}
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-white/5 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {formatDate(note.created_at)}
            </div>
            <div className="flex items-center gap-2">
              {note.is_highlighted && (
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Star className="w-4 h-4 text-yellow-400 fill-current shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onShare(note)} 
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 text-zinc-500 hover:text-emerald-400 transition-all"
              >
                <Share className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(note.id, note.title)} 
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge 
                  key={tagIndex} 
                  className="bg-white/5 text-indigo-400 px-3 py-1 rounded-lg border border-indigo-500/10 font-black uppercase tracking-widest text-[9px] backdrop-blur-md"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};