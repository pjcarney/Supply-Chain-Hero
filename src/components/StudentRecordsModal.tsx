import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, X, ArrowLeft, Download, Upload, Edit2, Check, 
  Database, ShieldCheck, Calendar, Clock, Trash2, User, FileText, CheckCircle2
} from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

interface StudentRecordsModalProps {
  onClose: () => void;
}

export function StudentRecordsModal({ onClose }: StudentRecordsModalProps) {
  const { 
    progress, 
    user, 
    saving, 
    updateStudentProfile, 
    exportRecordsJSON, 
    importRecordsJSON, 
    clearRecords 
  } = useFirebase();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(progress?.studentName || '');
  const [idInput, setIdInput] = useState(progress?.studentId || '');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scores' | 'history'>('scores');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStudentProfile(nameInput, idInput);
    setIsEditingProfile(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importRecordsJSON(content);
        if (success) {
          setImportStatus('Records imported successfully!');
        } else {
          setImportStatus('Invalid records file format.');
        }
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const scenarioMeta: Record<number, { title: string; category: string; targetText: string; isHighBetter: boolean }> = {
    1: { title: 'Scenario 1: Distribution Loop', category: 'Core Movement', targetText: 'Lowest Days', isHighBetter: false },
    2: { title: 'Scenario 2: Dual Retail Stores', category: 'Multi-Store', targetText: 'Lowest Days', isHighBetter: false },
    3: { title: 'Scenario 3: Cash Flow Challenge', category: 'Financial Op', targetText: 'Highest Cash Flow', isHighBetter: true },
    4: { title: 'Scenario 4: Rent & Ownership Costs', category: 'Operating Expense', targetText: 'Highest Cash Flow', isHighBetter: true },
    5: { title: 'Scenario 5: Multi-Store Expenses', category: 'Network Expansion', targetText: 'Highest Cash Flow', isHighBetter: true },
    6: { title: 'Scenario 6: Global Supply Chain', category: 'Multi-Echelon', targetText: 'Lowest Days', isHighBetter: false },
    7: { title: 'Scenario 7: Global Supply Chain (Cash Flow)', category: 'Enterprise Financials', targetText: 'Highest Cash Flow', isHighBetter: true },
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto cursor-pointer"
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        className="bg-[#141418] border border-[#2A2A2E] w-full max-w-2xl rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] cursor-default my-8 flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-[#2A2A2E] bg-gradient-to-r from-yellow-500/10 via-blue-500/5 to-transparent flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 p-3.5 rounded-2xl text-yellow-400 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <Trophy size={26} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-sans font-black uppercase tracking-tight text-white flex items-center gap-2">
                Flight Deck Records
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
                Persistent Academic & Simulation History
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer border border-white/5"
            aria-label="Close Records"
          >
            <X size={20} />
          </button>
        </div>

        {/* Student Profile Identity Bar */}
        <div className="bg-black/30 p-6 border-b border-[#2A2A2E]">
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1">
                    Student / Operator Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-sans"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1">
                    Student ID / Course Ref
                  </label>
                  <input
                    type="text"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder="e.g. SCH-2026-99"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check size={14} /> Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">
                      {progress?.studentName || user?.displayName || 'Guest Student'}
                    </span>
                    {progress?.studentId && (
                      <span className="bg-white/5 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        ID: {progress.studentId}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                    <Database size={10} className="text-emerald-400" />
                    LocalStorage Saved • {user ? 'Cloud Synced' : 'Offline Session'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNameInput(progress?.studentName || user?.displayName || '');
                    setIdInput(progress?.studentId || '');
                    setIsEditingProfile(true);
                  }}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 transition-all text-xs font-mono uppercase tracking-wider cursor-pointer"
                >
                  <Edit2 size={13} />
                  Edit Student ID
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#2A2A2E] px-8 bg-black/20">
          <button
            onClick={() => setActiveTab('scores')}
            className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-all ${
              activeTab === 'scores' 
                ? 'border-yellow-500 text-yellow-400' 
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            Scenario High Scores
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-mono font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'border-yellow-500 text-yellow-400' 
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            Session History Log
            {progress?.attempts && progress.attempts.length > 0 && (
              <span className="bg-white/10 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                {progress.attempts.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto space-y-4">
          {importStatus && (
            <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 size={16} />
              {importStatus}
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map(num => {
                const meta = scenarioMeta[num];
                const score = progress?.scores?.[`scenario_${num}`];
                const isCompleted = score !== undefined;

                return (
                  <div 
                    key={num} 
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted 
                        ? 'bg-black/40 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' 
                        : 'bg-black/20 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-yellow-500/80 font-bold block">
                          {meta.category}
                        </span>
                        <h3 className="text-sm font-sans font-bold text-white">
                          Scenario {num}
                        </h3>
                      </div>
                      {isCompleted ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Completed
                        </span>
                      ) : (
                        <span className="bg-white/5 text-white/30 border border-white/10 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-baseline justify-between">
                      <span className="text-[10px] font-mono text-white/40 uppercase">
                        {meta.targetText}
                      </span>
                      {isCompleted ? (
                        <span className="text-lg font-mono font-black text-yellow-400">
                          {meta.isHighBetter 
                            ? `$${score.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `${score} Days`}
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-white/20">
                          — No Record —
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {(!progress?.attempts || progress.attempts.length === 0) ? (
                <div className="text-center py-12 text-white/30 font-mono text-xs">
                  No completed scenario runs logged yet. Complete a scenario to record your performance!
                </div>
              ) : (
                progress.attempts.map(att => (
                  <div key={att.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-mono text-xs font-bold">
                        #{att.scenario}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Scenario {att.scenario}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                            {att.outcome}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(att.date).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-black text-yellow-400">
                        {[3, 4, 5].includes(att.scenario) 
                          ? `$${att.score.toLocaleString()}`
                          : `${att.score} Days`}
                      </div>
                      {att.cashFlow !== undefined && (
                        <div className={`text-[10px] ${att.cashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Cash: ${att.cashFlow.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Data Portability & Controls Footer */}
        <div className="p-6 border-t border-[#2A2A2E] bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={exportRecordsJSON}
              className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Download Student Transcript & Records (JSON)"
            >
              <Download size={14} className="text-blue-400" />
              Export Transcript
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Import Student Transcript (JSON)"
            >
              <Upload size={14} className="text-emerald-400" />
              Import
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>

          <button 
            onClick={onClose}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_35px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <ArrowLeft size={16} />
            Return to Simulation
          </button>
        </div>
      </motion.div>
    </div>
  );
}
