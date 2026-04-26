import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Eye, FileText, Folder, Heart, Plus, Shield, Star, Search, Filter, Trash2, X, Download, GraduationCap, Lightbulb, User, Home } from 'lucide-react';
import { Note, NoteFolder, NoteStats, SecureUser } from './types';
import { NoteCard } from './NoteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import ParallaxBackground from '@/components/ui/ParallaxBackground';

interface NotesDashboardProps {
    onBack: () => void;
    currentUser: SecureUser;
    notes: Note[];
    folders: NoteFolder[];
    noteStats: NoteStats | null;
    onAddFolder: (folderName: string) => void;
    handleCreateNote: () => void;
    handleFolderSelect: (folderId: string) => void;
    handleEdit: (note: Note) => void;
    handleDelete: (id: string, title: string) => void;
    handleBulkDelete: () => void;
    handleExportCSV: () => void;
    handleExportPDF: () => void;
    handleToggleFavorite: (id: string, isFavorite: boolean) => void;
    openShareModal: (note: Note) => void;
    getRecentNotes: () => Note[];
    getHighlightedNotes: () => Note[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedNotes: string[];
    handleSelectNote: (id: string) => void;
    handleSelectAllNotes: () => void;
}

const iconMap: { [key: string]: React.ElementType } = {
    'book-open': BookOpen,
    'graduation-cap': GraduationCap,
    'search': Search,
    'user': User,
    'lightbulb': Lightbulb,
    'home': Home,
    'default': Folder,
};

const getFolderIcon = (iconName?: string) => {
    return iconMap[iconName || 'default'] || Folder;
};

export const NotesDashboard: React.FC<NotesDashboardProps> = (props) => {
    const {
        onBack, currentUser, notes, folders, noteStats, onAddFolder, handleCreateNote,
        handleFolderSelect, handleEdit, handleDelete, handleBulkDelete, handleExportCSV, handleExportPDF, handleToggleFavorite, openShareModal,
        getRecentNotes, getHighlightedNotes, searchTerm, setSearchTerm, selectedNotes, handleSelectNote, handleSelectAllNotes
    } = props;

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllNotesSelected = filteredNotes.length > 0 && selectedNotes.length === filteredNotes.length;
    const [newFolderName, setNewFolderName] = useState('');
    const [isAddingFolder, setIsAddingFolder] = useState(false);

    const handleAddNewFolder = () => {
        if (newFolderName.trim()) {
            onAddFolder(newFolderName.trim());
            setNewFolderName('');
            setIsAddingFolder(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Dynamic Neural Substrate */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <ParallaxBackground />
            <AnimatePresence>
                {selectedNotes.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 flex items-center gap-2 z-50"
                    >
                        <span className="text-white font-semibold px-3 text-sm">{selectedNotes.length} selected</span>
                        <div className="h-6 w-px bg-white/20" />
                        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
                        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-sm" onClick={handleExportPDF}><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
                        <div className="h-6 w-px bg-white/20" />
                        <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm" onClick={handleBulkDelete}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => handleSelectAllNotes()}><X className="w-4 h-4" /></Button>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between my-12">
                    <div className="flex items-center space-x-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="bg-gradient-button-outline text-white hover:shadow-lg rounded-xl transition-all duration-300 w-12 h-12"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="text-3xl md:text-5xl font-black text-white mb-2 flex flex-wrap items-center tracking-tighter cursor-default"
                            >
                                <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]">Notes</span>
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent italic px-2 drop-shadow-[0_10px_30px_rgba(52,211,153,0.3)]">Archive</span>
                                <Shield className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                            </motion.h1>
                            <p className="text-zinc-400 text-lg font-medium">Welcome back, {currentUser.profile?.full_name}.</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={handleCreateNote}
                        className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 px-10 py-4 font-black text-lg text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all duration-700 ease-out hover:from-indigo-700 hover:to-cyan-700 hover:shadow-[0_25px_70px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:scale-95"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Plus className="w-5 h-5 transition-transform duration-700 group-hover:rotate-180" />
                            </div>
                            <span className="text-base tracking-tight uppercase">Add Note</span>
                        </div>
                    </motion.button>
                </motion.div>

                {noteStats && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 px-2">
                        {[
                            { icon: FileText, value: noteStats.total_notes, label: 'Total Notes', grad: 'from-blue-600 to-indigo-600', ring: '#4f46e5' },
                            { icon: Star, value: noteStats.highlighted_notes, label: 'Marked Notes', grad: 'from-yellow-600 to-orange-600', ring: '#d97706' },
                            { icon: Heart, value: noteStats.favorite_notes, label: 'Priority Notes', grad: 'from-red-600 to-rose-600', ring: '#e11d48' },
                            { icon: Clock, value: `${noteStats.total_reading_time}m`, label: 'Total Time', grad: 'from-emerald-600 to-teal-600', ring: '#059669' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + (i * 0.1), type: 'spring' }}
                                className="relative p-8 rounded-[2.5rem] bg-zinc-950/40 backdrop-blur-3xl border border-white/10 group overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700" style={{ background: stat.ring }} />
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.grad} shadow-[0_10px_30px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">Notes</div>
                                </div>
                                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
                                <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                    <div className="lg:col-span-3">
                        <div className="sticky top-6 space-y-8">
                            <Card className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-white flex items-center gap-3 text-xl font-black uppercase tracking-widest">
                                        <div className="p-2 bg-blue-500/20 rounded-xl">
                                            <Search className="w-5 h-5 text-blue-400" />
                                        </div>
                                        Search Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                        <Input
                                            placeholder="Search notes..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-12 bg-black/40 border-2 border-white/5 focus:border-blue-500/50 text-white placeholder:text-zinc-600 rounded-2xl h-14 transition-all"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-white flex items-center gap-3 text-xl font-black uppercase tracking-widest">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                                            <Folder className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        Notes Folders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <motion.button
                                        whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleFolderSelect('all')}
                                        className="w-full flex items-center gap-4 text-left p-4 rounded-2xl text-zinc-400 hover:text-white transition-all duration-300"
                                    >
                                        <div className="p-2 bg-white/5 rounded-xl">
                                            <Home className="w-5 h-5" />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-[10px]">All Repositories</span>
                                    </motion.button>
                                    {folders.map(folder => {
                                        const Icon = getFolderIcon(folder.icon);
                                        return (
                                            <motion.button
                                                key={folder.id}
                                                whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleFolderSelect(folder.id)}
                                                className="w-full flex items-center gap-4 text-left p-4 rounded-2xl text-zinc-400 hover:text-white transition-all duration-300"
                                            >
                                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${folder.color}20` || 'rgba(255,255,255,0.05)' }}>
                                                    <Icon className="w-5 h-5" style={{ color: folder.color || '#A3A3A3' }} />
                                                </div>
                                                <span className="font-black uppercase tracking-widest text-[10px] flex-grow truncate">{folder.name}</span>
                                                {noteStats?.notes_in_folder?.[folder.id] > 0 && (
                                                    <span className="text-[9px] font-black bg-white/10 text-white/70 rounded-lg px-2.5 py-1 uppercase tracking-widest">
                                                        {noteStats.notes_in_folder[folder.id]}
                                                    </span>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </CardContent>
                                <CardFooter className="pt-6 border-t border-white/5">
                                    {isAddingFolder ? (
                                        <div className="w-full space-y-4">
                                            <Input
                                                autoFocus
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNewFolder()}
                                                placeholder="Folder name..."
                                                className="bg-black/40 border-2 border-white/5 text-white rounded-2xl h-12"
                                            />
                                            <div className="flex gap-3">
                                                <Button size="sm" onClick={handleAddNewFolder} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-10 font-bold uppercase tracking-widest text-[10px]">Add</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setIsAddingFolder(false)} className="w-full text-zinc-500 rounded-xl h-10 font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsAddingFolder(true)}
                                            className="w-full justify-center text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]"
                                        >
                                            <Plus className="w-5 h-5 mr-3" /> New Folder
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    </div>

                    <div className="lg:col-span-9">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="select-all" checked={isAllNotesSelected} onCheckedChange={handleSelectAllNotes} />
                                <label htmlFor="select-all" className="text-white">Select All</label>
                            </div>
                        </div>
                        {filteredNotes.length > 0 ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredNotes.map((note, index) => (
                                    <NoteCard key={note.id} note={note} index={index} onEdit={handleEdit} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} onShare={openShareModal} isSelected={selectedNotes.includes(note.id)} onSelectNote={handleSelectNote} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                <div className="glass-morphism rounded-2xl p-8 border border-white/20 inline-block">
                                    <BookOpen className="w-16 h-16 mx-auto text-white/30 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
                                    <p className="text-white/60 mb-6">Create a new note or try a different search term.</p>
                                    <Button onClick={handleCreateNote} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold flex items-center gap-2 mx-auto">
                                        <Plus className="w-5 h-5" /> Create Note
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};