import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, KeyRound, Key, Zap, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onOpenChange }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="bg-gradient-to-br from-[#1a0b2e] to-black border border-purple-500/30 text-white sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-purple-400">
          <Crown className="w-5 h-5 fill-current" /> Elite Exclusive
        </DialogTitle>
        <DialogDescription className="text-gray-300 pt-2">
          This specific feature is reserved for Elite users.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 text-sm text-purple-200">
          🚀 Upgrade to Elite to unlock Deep Web Research, Image Analysis, and Advanced Generation.
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Link to="/upgrade">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold border-0">Upgrade Now</Button>
        </Link>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface ByokModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  byokInput: string;
  setByokInput: (value: string) => void;
  onSave: () => void;
  byokKey: string;
  onClear: () => void;
}

export const ByokModal: React.FC<ByokModalProps> = ({ 
  isOpen, onOpenChange, byokInput, setByokInput, onSave, byokKey, onClear 
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="bg-gradient-to-br from-[#0a1628] to-black border border-blue-500/30 text-white sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-400">
          <KeyRound className="w-5 h-5" /> Connect Your API Key
        </DialogTitle>
        <DialogDescription className="text-gray-300 pt-2">
          As a <span className="text-blue-400 font-semibold">Premium</span> user, enter your free OpenRouter key to activate the AI chat.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-sm text-blue-200 space-y-2">
          <p className="font-semibold flex items-center gap-2"><Key size={14} /> How to get your free key:</p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-xs">
            <li>Go to <span className="text-blue-400 font-mono">openrouter.ai</span></li>
            <li>Sign up for a free account</li>
            <li>Copy your API key from the dashboard</li>
            <li>Paste it below</li>
          </ol>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300 text-xs uppercase tracking-widest">Your OpenRouter API Key</Label>
          <Input
            type="password"
            placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
            value={byokInput}
            onChange={(e) => setByokInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-600 focus:border-blue-500"
          />
        </div>
        {byokKey && (
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs">
            <span className="text-green-400 flex items-center gap-2"><Key size={12} /> Key saved & active</span>
            <button onClick={onClear} className="text-red-400 hover:text-red-300 text-xs underline">Remove</button>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          onClick={onSave}
          disabled={!byokInput.trim()}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold border-0 disabled:opacity-50"
        >
          Save & Activate
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
