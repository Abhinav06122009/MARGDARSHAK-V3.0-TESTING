import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useSecureNotes } from './useSecureNotes.tsx';
import { NotesProps } from './types';
import { CommandMenu } from './CommandMenu';
import { NotesDashboard } from './NotesDashboard';
import { NotesFolderView } from './NotesFolderView';
import { NoteSheet } from './NoteSheet';
import { ShareModal } from './ShareModal';
import GlobalFooter from '@/components/layout/GlobalFooter';

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const hookProps = useSecureNotes();
  const { loading, securityVerified, currentUser, currentView, showShareModal, noteToShare, closeShareModal, openShareModal, isSheetOpen, setIsSheetOpen, notes, folders, handleEdit, handleFolderSelect, handleCreateNote, hasPremiumAccess } = hookProps;

  if (loading || !securityVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Dynamic Loading Substrate */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 p-12 rounded-[3rem] bg-zinc-950/50 backdrop-blur-3xl border border-white/10 text-center shadow-2xl"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-t-indigo-500 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">Loading Notes...</h2>
          <p className="text-zinc-500 font-medium tracking-tight uppercase text-[10px] mb-8">Loading Your Notes Data...</p>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      <CommandMenu
        notes={notes}
        folders={folders}
        onSelectNote={handleEdit}
        onSelectFolder={handleFolderSelect}
        onCreateNew={handleCreateNote}
      />
      {
        !currentUser ? (
          <div className="flex items-center justify-center h-screen">
            <div className="glass-morphism rounded-2xl p-8 border border-white/20 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-4">Authentication Required</h2>
              <p className="text-white/70 mb-6">Please log in to access your private notes.</p>
            </div>
          </div>
        ) : currentView === 'main' ? (
          <NotesDashboard {...hookProps} onBack={onBack} openShareModal={openShareModal} />
        ) : (
          <NotesFolderView {...hookProps} openShareModal={openShareModal} />
        )
      }
      <NoteSheet
        {...hookProps}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        hasPremiumAccess={hasPremiumAccess}
      />
      {showShareModal && <ShareModal note={noteToShare} onClose={closeShareModal} />}
      <GlobalFooter />
    </div>
  );
};

export default Notes;
