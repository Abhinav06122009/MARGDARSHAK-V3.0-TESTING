import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Trash2, Mail, User, Clock, Inbox, Sparkles, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminMessages = () => {
  const { tickets: messages, loading, refresh } = useAdmin();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to terminate this communication record?")) return;

    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);

      if (error) throw error;
      
      toast.success('Communication record purged from matrix');
      refresh(); // Use refresh from useAdmin to reload data
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to purge communication record');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500 gap-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 flex items-center justify-center">
             <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse italic">Synchronizing Neural Inbox...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-16 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4"
            >
              <Inbox className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Communication Grid_Online</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Admin <span className="text-emerald-500">Inbox</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Forensic review of incoming student uplinks and neural queries.</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3 shadow-2xl">
              <Activity className="w-4 h-4 text-emerald-500/40" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Active Signals: {messages.length}</span>
            </div>
          </div>
        </div>

        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-40 bg-white/[0.01] border border-white/5 rounded-[4rem] text-center gap-8 group"
          >
            <div className="w-32 h-32 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
               <Mail className="w-16 h-16 text-zinc-900" />
            </div>
            <div className="space-y-4">
              <p className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Zero Inbox Clearance</p>
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic max-w-sm mx-auto leading-relaxed">System logs are currently clear. All neural communications have been processed or resolved.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="bg-white/[0.01] border-white/5 rounded-[3rem] hover:bg-white/[0.03] hover:border-emerald-500/20 transition-all duration-700 group overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/[0.05] transition-colors duration-700" />
                    
                    <CardHeader className="p-10 pb-6 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700 overflow-hidden relative">
                             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 opacity-40" />
                             <span className="text-xl font-black text-white italic relative z-10">{msg.first_name?.[0]?.toUpperCase() || '?'}</span>
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-emerald-400 transition-colors">
                              {msg.first_name} {msg.last_name}
                            </CardTitle>
                            <div className="flex items-center gap-6 mt-4">
                              <span className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic group-hover:text-zinc-400 transition-colors">
                                <Mail className="w-3.5 h-3.5 text-emerald-500/40" /> {msg.email}
                              </span>
                              <span className="text-zinc-800">•</span>
                              <span className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic group-hover:text-zinc-400 transition-colors">
                                <Clock className="w-3.5 h-3.5 text-blue-500/40" /> {new Date(msg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[8px] font-black text-zinc-600 uppercase tracking-widest italic shadow-xl">
                              SEC_ID: {msg.id.substring(0, 8)}
                           </div>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 transition-all duration-700 group/trash shadow-xl"
                            onClick={() => handleDelete(msg.id)}
                          >
                            <Trash2 className="w-5 h-5 group-hover/trash:scale-125 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 relative z-10">
                      <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5 text-zinc-400 text-sm leading-relaxed font-medium italic group-hover:text-zinc-200 transition-colors shadow-inner whitespace-pre-wrap">
                        {msg.message}
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between opacity-20 group-hover:opacity-40 transition-opacity">
                         <div className="flex items-center gap-4">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <div className="h-[1px] w-20 bg-gradient-to-r from-emerald-500 to-transparent" />
                         </div>
                         <Sparkles className="w-4 h-4 text-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
