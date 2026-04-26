import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Plus, Search, Shield } from 'lucide-react';
import { Note, NoteFolder } from './types';
import { NoteCard } from './NoteCard';
import { Button } from '@/components/ui/button';

interface NotesFolderViewProps {
    notes: Note[];
    folders: NoteFolder[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedFolder: string;
    currentView: 'folder' | 'search';
    handleSearch: () => void;
    handleCreateNote: () => void;
    handleEdit: (note: Note) => void;
    handleDelete: (id: string, title: string) => void;
    handleToggleFavorite: (id: string, isFavorite: boolean) => void;
    openShareModal: (note: Note) => void;
    setCurrentView: (view: 'main' | 'folder' | 'search') => void;
    setSelectedFolder: (folderId: string) => void;
    refreshNotes: () => void;
}

export const NotesFolderView: React.FC<NotesFolderViewProps> = (props) => {
    const {
        notes, folders, searchTerm, setSearchTerm, selectedFolder, currentView,
        handleSearch, handleCreateNote, handleEdit, handleDelete, handleToggleFavorite, openShareModal,
        setCurrentView, setSelectedFolder, refreshNotes
    } = props;

    const handleBack = () => {
        setCurrentView('main');
        setSelectedFolder('all');
        setSearchTerm('');
        refreshNotes();
    };

    const folderName = folders.find(f => f.id === selectedFolder)?.name || 'All Notes';
    const title = currentView === 'search' ? 'Search Results' : folderName;
    const subtitle = currentView === 'search'
        ? `Found ${notes.length} notes matching "${searchTerm}"`
        : `${notes.length} notes in this folder`;

    return (
        <div className="max-w-7xl mx-auto p-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-6">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleBack}
                        className="bg-zinc-950/40 text-white hover:shadow-lg rounded-xl transition-all duration-300 w-12 h-12 border border-white/10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
                            {title} 
                            <Shield className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
                        </h1>
                        <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs mt-1">{subtitle}</p>
                    </div>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCreateNote} 
                    className="bg-gradient-to-br from-indigo-600 to-cyan-600 p-4 rounded-2xl transition-all shadow-[0_15px_40px_rgba(79,70,229,0.3)]"
                >
                    <Plus className="w-6 h-6 text-white" />
                </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search within this archive repository..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
                        className="w-full pl-14 pr-32 py-5 bg-zinc-950/40 border-2 border-white/5 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30 transition-all backdrop-blur-3xl" 
                    />
                    <button onClick={handleSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-white shadow-lg">Execute Query</button>
                </div>
            </motion.div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {notes.map((note, index) => (
                        <NoteCard key={note.id} note={note} index={index} onEdit={handleEdit} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} onShare={openShareModal} />
                    ))}
                </AnimatePresence>
            </motion.div>

            {notes.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <div className="glass-morphism rounded-2xl p-8 border border-white/20 inline-block">
                        <FileText className="w-16 h-16 mx-auto text-white/30 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">{currentView === 'search' ? 'No notes found' : 'No notes in this folder'}</h3>
                        <p className="text-white/60 mb-6">{currentView === 'search' ? 'Try adjusting your search terms' : 'Start by creating a note'}</p>
                        <button onClick={handleCreateNote} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold flex items-center gap-2 mx-auto">
                            <Plus className="w-5 h-5" /> Create Note
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};