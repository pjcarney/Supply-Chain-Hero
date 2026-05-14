/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Calendar, Wallet, Warehouse, Store, Factory, LogIn, LogOut, Trophy } from 'lucide-react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameMap } from './components/GameMap';
import { ActionPanel } from './components/ActionPanel';
import { CashFlowStatement } from './components/CashFlowStatement';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';

function SupplyChainHero() {
  const { state, dispatchVehicle, returnToWarehouse, advanceDay, updatePendingLoad, updatePendingTarget, switchScenario, resetGame } = useGameLogic();
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const { user, signIn, signOut, progress, saveProgress, saving } = useFirebase();

  useEffect(() => {
    if (state.isGameOver) {
      console.log('Victory achieved! Day:', state.day, 'Scenario:', state.scenario);
      // Save progress to Firebase if logged in
      if (user) {
        console.log('User logged in, attempting to save progress...');
        saveProgress(state.scenario, state.day).then(() => {
          console.log('saveProgress call completed.');
        }).catch(err => {
          console.error('saveProgress error:', err);
        });
      } else {
        console.log('User not logged in, progress will not be saved.');
      }
      
      const timer = setTimeout(() => {
        setShowVictoryModal(true);
      }, 1500); // 1.5s delay to allow truck animation to finish
      return () => clearTimeout(timer);
    } else {
      setShowVictoryModal(false);
    }
  }, [state.isGameOver, user, state.scenario, state.day, saveProgress]);

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
                <div className="flex items-center gap-2 bg-white/5 px-2 py-0.5 rounded border border-white/10 ml-2">
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Scenario</span>
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => switchScenario(num)}
                      className={`text-[10px] font-mono px-2 rounded transition-all ${
                        state.scenario === num 
                          ? 'bg-blue-500 text-white font-bold' 
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Status Indicators */}
            <div className="flex items-center gap-6 mr-4">
              <div className={`flex items-center gap-4 transition-opacity ${state.scenario < 3 ? 'opacity-20' : 'opacity-100'}`}>
                {state.scenario >= 3 && state.cashHistory.length > 1 && (
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
                    <Wallet size={12} className={state.scenario < 3 ? 'text-gray-500' : 'text-blue-400'} /> Cash Flow
                  </span>
                  <span className={`font-mono text-xl font-black tracking-tighter ${state.scenario < 3 ? 'text-white' : (state.cumulativeFlow.total >= 0 ? 'text-emerald-400' : 'text-rose-400')}`}>
                    {state.scenario < 3 ? '---' : `${state.cumulativeFlow.total >= 0 ? '+' : ''}$${state.cumulativeFlow.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
              {user && (
                <button
                  onClick={() => setShowRecordsModal(true)}
                  className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-3 py-2 rounded-xl border border-yellow-500/20 transition-all group"
                  title="Personal Records"
                >
                  <Trophy size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Records</span>
                  {saving && <span className="w-1 h-1 bg-yellow-500 rounded-full animate-ping" />}
                </button>
              )}
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

      {/* Main Content Layout */}
      <main className="max-w-[1600px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Visual Map */}
        <section className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex-1 min-h-[500px]">
            <GameMap locations={state.locations} fleet={state.fleet} />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <CashFlowStatement state={state} />

            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl h-[450px] flex flex-col">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Node Analytics</h3>
                  <h2 className="text-xl font-sans font-black uppercase tracking-tight">Supply Chain Inventory</h2>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-mono text-blue-400">
                  {state.locations.length} ACTIVE NODES
                </div>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {state.locations.map(loc => (
                  <div key={loc.id} className="bg-black/20 border border-[#2A2A2E] p-4 rounded-xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        loc.type === 'warehouse' ? 'bg-blue-600/20 text-blue-400' : 
                        loc.type === 'factory' ? 'bg-amber-600/20 text-amber-400' :
                        'bg-emerald-600/20 text-emerald-400'
                      }`}>
                        {loc.type === 'warehouse' ? <Warehouse size={18} /> : 
                         loc.type === 'factory' ? <Factory size={18} /> :
                         <Store size={18} />}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/30">{loc.type}</p>
                        <p className="font-sans font-black uppercase tracking-tighter text-sm group-hover:text-blue-400 transition-colors">{loc.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Inv / Target</p>
                      <div className="flex items-baseline justify-end gap-1">
                        <p className="font-mono text-sm font-black tracking-tighter">{loc.inventory}</p>
                        <span className="text-[8px] font-mono text-white/20">/ {loc.capacity}</span>
                        {loc.type === 'store' && (
                           <div className="ml-2 px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                             <span className="text-[10px] font-mono font-bold text-emerald-400">{loc.delivered}/26</span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Controls */}
        <aside className="lg:col-span-4 space-y-8">
          <ActionPanel 
            state={state} 
            onDispatch={dispatchVehicle} 
            onAdvanceDay={advanceDay}
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

      {/* Personal Records Modal */}
      {showRecordsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-[#1A1A1E] border border-[#2A2A2E] w-full max-w-lg rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8 border-b border-[#2A2A2E] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500/20 p-3 rounded-2xl text-yellow-500">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-sans font-black uppercase tracking-tight">Personal Records</h2>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Your career trajectory</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRecordsModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-xl font-light"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(num => {
                const score = progress?.scores?.[`scenario_${num}`];
                return (
                  <div key={num} className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-yellow-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xs font-black group-hover:bg-yellow-500/10 group-hover:text-yellow-500 transition-all">
                        S{num}
                      </div>
                      <div>
                        <span className="block text-lg font-sans font-bold text-white/80">Scenario {num}</span>
                        <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest">
                          {num === 3 ? 'Economic Operations' : 'Core Movement'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] uppercase font-bold text-white/20 mb-1">Best Time</p>
                       <p className={`text-2xl font-mono font-black ${score ? 'text-yellow-500' : 'text-white/10'}`}>
                         {score ? `${score} DAYS` : 'INCOMPLETE'}
                       </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-8 bg-black/20 flex justify-center">
              <button 
                onClick={() => setShowRecordsModal(false)}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
              >
                — Close Flight Deck Records —
              </button>
            </div>
          </motion.div>
        </div>
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
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 text-emerald-400">Simulation Complete</h2>
            <p className="text-xl text-white/60 mb-10 font-sans">
              Excellent work! You have successfully delivered the required 26 pallets to each retail location. 
              The supply chain is fully operational and optimized for peak efficiency.
            </p>
            <div className={`grid ${state.scenario >= 3 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-10`}>
              {state.scenario >= 3 && (
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
            <button 
              onClick={() => resetGame()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0C] font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] font-sans"
            >
              Restart Simulation
            </button>
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
