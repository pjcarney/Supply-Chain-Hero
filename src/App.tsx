/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Calendar, Wallet, LogIn, LogOut, Trophy, HelpCircle, X, ArrowLeft, Undo2 } from 'lucide-react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameMap } from './components/GameMap';
import { ActionPanel } from './components/ActionPanel';
import { CashFlowStatement } from './components/CashFlowStatement';
import { KPIPanel } from './components/KPIPanel';
import { ScenarioBriefingModal } from './components/ScenarioBriefingModal';
import { StudentRecordsModal } from './components/StudentRecordsModal';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';

function SupplyChainHero() {
  const { state, dispatchVehicle, returnToWarehouse, advanceDay, undoDay, canUndo, updatePendingLoad, updatePendingTarget, switchScenario, resetGame } = useGameLogic();
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [hasDismissedVictory, setHasDismissedVictory] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [briefingScenario, setBriefingScenario] = useState<number | null>(1); // Open Scenario 1 briefing initially on load
  const { user, signIn, signInWithGithub, signOut, progress, saveProgress, saving } = useFirebase();

  const handleUndoDay = () => {
    setHasDismissedVictory(false);
    setShowVictoryModal(false);
    undoDay();
  };

  useEffect(() => {
    if (!state.isGameOver) {
      setHasDismissedVictory(false);
    }
  }, [state.isGameOver]);

  useEffect(() => {
    if (state.isGameOver) {
      if (hasDismissedVictory) {
        setShowVictoryModal(false);
        return;
      }
      console.log('Game ended. Day:', state.day, 'Scenario:', state.scenario);
      const isCashFlowScenario = [4, 5, 7].includes(state.scenario);
      const isSuccess = isCashFlowScenario ? state.cumulativeFlow.total > 0 : true;
      const outcome = isSuccess ? 'victory' : 'failed';
      const scoreValue = (state.scenario === 3 || isCashFlowScenario) ? state.cumulativeFlow.total : state.day;

      saveProgress(state.scenario, scoreValue, { outcome, cashFlow: state.cumulativeFlow.total }).catch(err => {
        console.error('saveProgress error:', err);
      });
      
      const timer = setTimeout(() => {
        setShowVictoryModal(true);
      }, 1500); // 1.5s delay to allow truck animation to finish
      return () => clearTimeout(timer);
    } else {
      setShowVictoryModal(false);
    }
  }, [state.isGameOver, state.scenario, state.day, state.cumulativeFlow.total, saveProgress, hasDismissedVictory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showRecordsModal) setShowRecordsModal(false);
        if (briefingScenario !== null) setBriefingScenario(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRecordsModal, briefingScenario]);

  const handleAdvanceDay = () => {
    // Save in_progress attempt if not completed
    const scenarioKey = `scenario_${state.scenario}`;
    const isCompleted = progress?.scores?.[scenarioKey] !== undefined || progress?.attempts?.some(a => a.scenario === state.scenario && a.outcome === 'victory');
    if (!isCompleted) {
      saveProgress(state.scenario, state.day, { outcome: 'in_progress', cashFlow: state.cumulativeFlow.total }).catch(() => {});
    }

    const pendingDispatches = state.fleet
      .filter(v => v.status === 'idle' && v.pendingTargetId)
      .map(v => ({
        vehicleId: v.id,
        targetId: v.pendingTargetId!,
        amount: v.pendingLoad
      }));
    
    advanceDay(pendingDispatches);
  };

  const handleSwitchScenario = (num: number) => {
    const scenarioKey = `scenario_${num}`;
    const isCompleted = progress?.scores?.[scenarioKey] !== undefined || progress?.attempts?.some(a => a.scenario === num && a.outcome === 'victory');
    const hasAttempt = progress?.attempts?.some(a => a.scenario === num);
    if (!isCompleted && !hasAttempt) {
      saveProgress(num, 1, { outcome: 'in_progress' }).catch(() => {});
    }
    switchScenario(num);
    setBriefingScenario(num);
  };

  const getScenarioStatus = (scenarioNum: number) => {
    if (scenarioNum === state.scenario) {
      return 'current';
    }
    const scenarioKey = `scenario_${scenarioNum}`;
    const hasVictoryScore = progress?.scores && progress.scores[scenarioKey] !== undefined;
    const hasVictoryAttempt = progress?.attempts && progress.attempts.some(a => a.scenario === scenarioNum && a.outcome === 'victory');

    if (hasVictoryScore || hasVictoryAttempt) {
      return 'completed';
    }

    const hasAnyAttempt = progress?.attempts && progress.attempts.some(a => a.scenario === scenarioNum);

    if (hasAnyAttempt) {
      return 'failed';
    }

    return 'not_attempted';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-[#2A2A2E] bg-[#0A0A0C]/80 backdrop-blur-md p-6 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-sans font-black uppercase tracking-tighter text-3xl leading-tight">SupplyChain Hero</h1>
              <div className="flex gap-4 items-center">
                <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Logistics Simulator v1.2</p>
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 ml-2">
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest hidden sm:inline">Scenario</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map(num => {
                      const status = getScenarioStatus(num);
                      let buttonStyle = "";
                      let titleText = "";

                      switch (status) {
                        case 'current':
                          buttonStyle = "bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.6)]";
                          titleText = `Scenario ${num}: Current Active Scenario (Blue)`;
                          break;
                        case 'completed':
                          buttonStyle = "bg-emerald-600 hover:bg-emerald-500 text-white font-bold border border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                          titleText = `Scenario ${num}: Successfully Completed (Green)`;
                          break;
                        case 'failed':
                          buttonStyle = "bg-rose-600 hover:bg-rose-500 text-white font-bold border border-rose-400/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]";
                          titleText = `Scenario ${num}: Attempted - Not Completed Yet (Red)`;
                          break;
                        case 'not_attempted':
                        default:
                          buttonStyle = "bg-black text-white/60 hover:text-white hover:bg-neutral-900 border border-neutral-800";
                          titleText = `Scenario ${num}: Not Attempted Yet (Black)`;
                          break;
                      }

                      return (
                        <button
                          key={num}
                          onClick={() => handleSwitchScenario(num)}
                          title={titleText}
                          className={`w-7 h-7 text-xs font-mono rounded-lg transition-all flex items-center justify-center cursor-pointer ${buttonStyle}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="hidden xl:flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-white/40 ml-1 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block shadow-[0_0_6px_rgba(59,130,246,0.8)]"></span>Current</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>Passed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-[0_0_6px_rgba(244,63,94,0.8)]"></span>Failed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-black border border-white/40 inline-block"></span>Unattempted</span>
                </div>
                <button
                  onClick={() => setBriefingScenario(state.scenario)}
                  className="flex items-center gap-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 px-2.5 py-1 rounded-xl border border-blue-500/20 transition-all font-mono text-[9px] uppercase tracking-widest cursor-pointer ml-1"
                  title="View Scenario Briefing"
                >
                  <HelpCircle size={11} className="mr-0.5 inline" />
                  Briefing
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Status Indicators */}
            <div className="flex items-center gap-6 mr-4">
              <div className="flex items-center gap-4 transition-opacity">
                {state.cashHistory.length > 1 && (
                  <div className="h-12 w-32 hidden sm:block">
                    <svg viewBox={`0 0 100 40`} className="w-full h-full overflow-visible">
                      <polyline
                        fill="none"
                        stroke={state.cumulativeFlow.total >= 0 ? '#10b981' : '#f43f5e'}
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={state.cashHistory.map((val, i) => {
                          const x = (i / (state.cashHistory.length - 1)) * 100;
                          const min = Math.min(...state.cashHistory);
                          const max = Math.max(...state.cashHistory);
                          const range = max - min || 1;
                          const y = 40 - ((val - min) / range) * 35;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-2">
                    <Wallet size={12} className={state.scenario < 4 ? 'text-blue-400/50' : 'text-blue-400'} /> Cash Flow
                  </span>
                  <span className={`font-mono text-xl font-black tracking-tighter ${state.cumulativeFlow.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {`${state.cumulativeFlow.total >= 0 ? '+' : ''}$${state.cumulativeFlow.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-2">
                  <Calendar size={12} className="text-emerald-400" /> Current Day
                </span>
                <span className="font-mono text-xl font-black tracking-tighter text-white">
                  {state.day}
                </span>
              </div>
            </div>

            {/* Nav Tools */}
            <div className="flex items-center gap-2 pr-8 border-r border-[#2A2A2E]">
              <button
                onClick={() => setShowRecordsModal(true)}
                className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-3 py-2 rounded-xl border border-yellow-500/20 transition-all group cursor-pointer"
                title="Student Records & History"
              >
                <Trophy size={16} className="group-hover:scale-110 transition-transform text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Records</span>
                {saving && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />}
              </button>
            </div>

            {/* User Auth */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-white/30">Active Sector</p>
                    <p className="text-sm font-sans font-medium">{user.displayName || 'Operator'}</p>
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-red-400"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => signIn()}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-400 transition-all shadow-lg"
                >
                  <LogIn size={16} />
                  Operator Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Left Column: Visual Map */}
        <section className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="h-[500px] md:h-[650px] lg:h-[750px] bg-[#1A1A1E] rounded-3xl border border-[#2A2A2E] overflow-hidden shadow-2xl relative">
            <GameMap locations={state.locations} fleet={state.fleet} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CashFlowStatement state={state} />
            <KPIPanel state={state} />
          </div>
        </section>

        {/* Right Column: Controls & Analytics */}
        <aside className="w-full md:w-[280px] lg:w-[330px] space-y-6 shrink-0">
          <ActionPanel 
            state={state} 
            onDispatch={dispatchVehicle} 
            onAdvanceDay={handleAdvanceDay}
            onUndoDay={handleUndoDay}
            canUndo={canUndo}
            onReset={resetGame}
            onUpdatePendingLoad={updatePendingLoad}
            onUpdatePendingTarget={updatePendingTarget}
          />
        </aside>
      </main>


      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C] border-t border-[#2A2A2E] px-8 py-2 flex justify-between items-center text-[9px] font-mono uppercase tracking-[0.3em] text-white/20">
        <div className="flex gap-6">
          <span>OS: SCH_CORE_v1.2</span>
          <span>LATENCY: 12ms</span>
        </div>
        <div className="flex gap-6">
          <span>SECURITY: SECURE</span>
          <span>TIMESTAMP: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>

      {/* Scenario Briefing Modal */}
      {briefingScenario !== null && (
        <ScenarioBriefingModal
          scenario={briefingScenario}
          onClose={() => setBriefingScenario(null)}
        />
      )}

      {/* Personal Records Modal */}
      {showRecordsModal && (
        <StudentRecordsModal onClose={() => setShowRecordsModal(false)} />
      )}

      {/* Game Over Message Overlay */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1A1E] border-4 border-emerald-500/50 p-12 rounded-[40px] text-center max-w-2xl shadow-[0_0_100px_rgba(16,185,129,0.3)]"
          >
            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <TrendingUp size={48} />
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 text-emerald-400">
              {(state.scenario === 4 || state.scenario === 5 || state.scenario === 7) ? (state.cumulativeFlow.total > 0 ? 'Mission Success' : 'Simulation End') : 'Mission Success'}
            </h2>
            <p className="text-xl text-white/60 mb-10 font-sans">
              {(state.scenario === 4 || state.scenario === 5 || state.scenario === 7) ? (
                state.cumulativeFlow.total > 0 
                  ? `Incredible management. You generated a positive net flow of $${state.cumulativeFlow.total.toLocaleString()} over 20 days.`
                  : `Scenario finalized. You finished with a net flow of $${state.cumulativeFlow.total.toLocaleString()}. This simulation highlights the difficulty of inventory costs!`
              ) : (
                "Excellent work! You have successfully delivered the required 26 pallets to each retail location and optimized the supply chain."
              )}
            </p>
            <div className={`grid ${(state.scenario === 4 || state.scenario === 5 || state.scenario === 7) ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-10`}>
              {(state.scenario === 4 || state.scenario === 5 || state.scenario === 7) && (
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Net Scenario Cash Flow</p>
                  <p className={`text-2xl font-mono font-black ${state.cumulativeFlow.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {state.cumulativeFlow.total >= 0 ? '+' : ''}${state.cumulativeFlow.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Days Elapsed</p>
                <p className="text-2xl font-mono font-black">{state.day}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {canUndo && (
                <button 
                  onClick={handleUndoDay}
                  className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-black uppercase tracking-widest py-4 rounded-2xl border border-amber-500/30 transition-all font-sans cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  <Undo2 size={16} />
                  Undo 1 Day
                </button>
              )}
              <button 
                onClick={() => setHasDismissedVictory(true)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] font-sans cursor-pointer text-xs"
              >
                Review KPIs
              </button>
              <button 
                onClick={() => {
                  setHasDismissedVictory(false);
                  resetGame();
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl border border-white/10 transition-all font-sans cursor-pointer text-xs"
              >
                Restart Scenario
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <SupplyChainHero />
    </FirebaseProvider>
  );
}
