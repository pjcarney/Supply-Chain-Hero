import React, { useState } from 'react';
import { Calendar, ChevronRight, Truck, RotateCcw, Check, Undo2 } from 'lucide-react';
import { GameState, Location } from '../types';

interface ActionPanelProps {
  state: GameState;
  onDispatch: (vehicleId: string, targetId: string, amt: number) => void;
  onAdvanceDay: () => void;
  onUndoDay?: () => void;
  canUndo?: boolean;
  onReset: () => void;
  onUpdatePendingLoad: (vehicleId: string, amount: number) => void;
  onUpdatePendingTarget: (vehicleId: string, targetId: string) => void;
}

export function ActionPanel({ state, onDispatch, onAdvanceDay, onUndoDay, canUndo, onReset, onUpdatePendingLoad, onUpdatePendingTarget }: ActionPanelProps) {
  return (
    <div className="flex flex-col h-full space-y-6 font-sans">
      {/* TURN CONTROL */}
      <section className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
        {state.isGameOver && (
          <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
        )}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
            {state.isGameOver ? "Analysis Mode" : "Status Report"}
          </p>
          <p className="text-sm font-sans font-black uppercase tracking-tight">
            {state.isGameOver ? "Simulation Complete" : `Day ${state.day} in Progress`}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={onUndoDay}
            disabled={!canUndo}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              canUndo 
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-lg hover:scale-105 active:scale-95 cursor-pointer' 
                : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
            }`}
            title={canUndo ? "Undo 1 Day" : "No previous days to undo"}
          >
            <Undo2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider hidden xl:inline">Undo</span>
          </button>

          <button 
            onClick={onReset}
            className="bg-red-950/30 text-red-400 border border-red-900/50 p-3.5 rounded-xl shadow-lg hover:bg-red-900/40 hover:text-red-300 transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
            title="Restart Scenario"
          >
            <RotateCcw size={18} />
          </button>
          {state.isGameOver ? (
            <div 
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl flex items-center justify-center font-bold text-xs"
              title="Simulation has successfully finished!"
            >
              <Check size={20} className="text-emerald-400" />
            </div>
          ) : (
            <button 
              onClick={onAdvanceDay}
              className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
              title="Advance to Next Day"
            >
              <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </section>

      <section className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-blue-400">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Truck size={18} /></div>
          Fleet Operations
        </h3>
        
        <div className="space-y-3">
          {state.fleet.map((v, idx) => {
            const origin = state.locations.find(l => 
              Math.abs(l.x - v.currentPos.x) < 1.0 && 
              Math.abs(l.y - v.currentPos.y) < 1.0
            );

            const isT1 = v.id === 't1' || idx === 0;
            const isT2 = v.id === 't2' || idx === 1;
            const badgeClass = isT1 
              ? 'bg-amber-400 text-black border-amber-300'
              : isT2
                ? 'bg-cyan-400 text-black border-cyan-300'
                : 'bg-purple-400 text-black border-purple-300';

            const availableLocations = state.locations.filter(loc => {
              if (loc.id === origin?.id) return false;
              
              if (state.scenario === 6 || state.scenario === 7) {
                if (origin?.type === 'supplier') {
                  return loc.type === 'factory';
                }
                if (origin?.type === 'factory') {
                  return loc.type === 'supplier' || loc.type === 'warehouse';
                }
                if (origin?.type === 'warehouse') {
                  if (loc.type === 'warehouse') return false; // Cannot go directly between DCs
                  if (origin.id === 'dc_1') {
                    if (loc.type === 'store') return loc.id.startsWith('retail_1');
                    return loc.type === 'factory';
                  }
                  if (origin.id === 'dc_2') {
                    if (loc.type === 'store') return loc.id.startsWith('retail_2');
                    return loc.type === 'factory';
                  }
                  return loc.type === 'factory';
                }
                if (origin?.type === 'store') {
                  if (origin.id.startsWith('retail_1')) return loc.id === 'dc_1';
                  if (origin.id.startsWith('retail_2')) return loc.id === 'dc_2';
                  return loc.type === 'warehouse';
                }
                return true;
              } else {
                // Manufacturer cannot go directly to retail stores
                if (origin?.type === 'factory' && loc.type === 'store') return false;
                // Retail stores cannot go directly to manufacturer
                if (origin?.type === 'store' && loc.type === 'factory') return false;
                return true;
              }
            });

            return (
              <div key={v.id} className="bg-black/20 border border-[#2A2A2E] p-2 rounded-xl flex items-center gap-3">
                {/* Unit Identity */}
                <div className="w-20 shrink-0 overflow-hidden">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border shadow-sm ${badgeClass}`}>
                      {v.name}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.status === 'enroute' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  </div>
                  <div className="text-[8px] font-mono text-white/40 uppercase tracking-tighter truncate mt-0.5">
                    {v.status === 'enroute' ? v.cargo : 0}/{v.capacity} UNITS
                  </div>
                </div>

                {/* Destination Dropdown */}
                <div className="flex-1 min-w-0">
                  <label className="text-[7px] font-bold text-white/20 uppercase block ml-0.5 mb-1 tracking-widest">Routing</label>
                  <select 
                    value={v.status === 'enroute' ? v.targetId : (v.pendingTargetId || '')}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (v.status === 'idle') {
                        onUpdatePendingTarget(v.id, id);
                      }
                    }}
                    className={`bg-black/40 border border-[#2A2A2E] p-1.5 h-8 text-[10px] font-mono text-white focus:border-blue-500 focus:outline-none transition-all rounded-lg cursor-pointer disabled:opacity-30 w-full truncate ${v.pendingTargetId ? 'border-blue-500/50 ring-1 ring-blue-500/20' : ''}`}
                    disabled={v.status !== 'idle'}
                  >
                    <option value="">STATIONARY</option>
                    {availableLocations.map(loc => (
                      <option key={loc.id} value={loc.id} className="bg-[#1A1A1E]">
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shipment Size */}
                <div className="w-14">
                  <label className="text-[7px] font-bold text-white/20 uppercase block ml-0.5 mb-1 tracking-widest text-center">Load</label>
                  <input 
                    type="number" 
                    max={26}
                    min={0}
                    value={v.status === 'enroute' ? v.cargo : v.pendingLoad}
                    onChange={(e) => {
                      const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), 26);
                      if (v.status === 'idle') {
                        onUpdatePendingLoad(v.id, val);
                      }
                    }}
                    className={`bg-black/40 border border-[#2A2A2E] p-1 h-8 text-[10px] font-mono text-white focus:border-blue-500 focus:outline-none transition-all rounded-lg w-full text-center disabled:opacity-50 ${v.pendingTargetId ? 'ring-1 ring-blue-500/50' : ''}`}
                    disabled={v.status !== 'idle'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 flex-1 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/40">Ops History</h3>
        <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 custom-scrollbar">
          {state.logs.map((log, i) => (
            <div key={i} className={`flex gap-3 leading-relaxed ${i === 0 ? 'text-white' : 'text-white/30'}`}>
              <span className="text-blue-500 opacity-50">[{state.day}]</span>
              <p>{log}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
