import React, { useState } from 'react';
import { Calendar, ChevronRight, Truck, RotateCcw } from 'lucide-react';
import { GameState, Location } from '../types';

interface ActionPanelProps {
  state: GameState;
  onDispatch: (vehicleId: string, targetId: string, amt: number) => void;
  onAdvanceDay: () => void;
  onReset: () => void;
  onUpdatePendingLoad: (vehicleId: string, amount: number) => void;
  onUpdatePendingTarget: (vehicleId: string, targetId: string) => void;
}

export function ActionPanel({ state, onDispatch, onAdvanceDay, onReset, onUpdatePendingLoad, onUpdatePendingTarget }: ActionPanelProps) {
  return (
    <div className="flex flex-col h-full space-y-6 font-sans">
      {/* TURN CONTROL */}
      <section className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Status Report</p>
          <p className="text-sm font-sans font-black uppercase tracking-tight">Day {state.day} in Progress</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onReset}
            className="bg-red-950/30 text-red-400 border border-red-900/50 p-4 rounded-xl shadow-lg hover:bg-red-900/40 hover:text-red-300 transition-all flex items-center justify-center"
            title="Reset Simulation"
          >
            <RotateCcw size={22} />
          </button>
          <button 
            onClick={onAdvanceDay}
            className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all group"
            title="Advance to Next Day"
          >
            <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <section className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-blue-400">
          <div className="p-2 bg-blue-500/10 rounded-lg"><Truck size={18} /></div>
          Fleet Operations
        </h3>
        
        <div className="space-y-3">
          {state.fleet.map(v => {
            return (
              <div key={v.id} className="bg-black/20 border border-[#2A2A2E] p-2.5 rounded-xl flex items-center gap-3">
                {/* Unit Identity */}
                <div className="w-24 shrink-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-black uppercase text-white truncate font-sans tracking-tight">{v.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${v.status === 'enroute' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                  </div>
                  <div className="text-[9px] font-mono text-white/40 uppercase tracking-tighter">
                    {v.status === 'enroute' ? v.cargo : 0}/{v.capacity} PLTS
                  </div>
                </div>

                {/* Destination Dropdown */}
                <div className="flex-1 min-w-0">
                  <label className="text-[8px] font-bold text-white/20 uppercase block ml-1 mb-0.5 tracking-widest">Destination</label>
                  <select 
                    value={v.status === 'enroute' ? v.targetId : (v.pendingTargetId || '')}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (v.status === 'idle') {
                        onUpdatePendingTarget(v.id, id);
                      }
                    }}
                    className="bg-black/40 border border-[#2A2A2E] p-1.5 text-[10px] font-mono text-white focus:border-blue-500 focus:outline-none transition-all rounded-lg cursor-pointer disabled:opacity-30 w-full"
                    disabled={v.status !== 'idle'}
                  >
                    <option value="">SELECT...</option>
                    {state.locations.map(loc => (
                      <option key={loc.id} value={loc.id} className="bg-[#1A1A1E]">
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shipment Size */}
                <div className="w-14">
                  <label className="text-[8px] font-bold text-white/20 uppercase block ml-1 mb-0.5 tracking-widest">Size</label>
                  <input 
                    type="number" 
                    max={26}
                    value={v.status === 'enroute' ? v.cargo : v.pendingLoad}
                    onChange={(e) => {
                      const val = Math.min(parseInt(e.target.value) || 0, 26);
                      if (v.status === 'idle') {
                        onUpdatePendingLoad(v.id, val);
                      }
                    }}
                    className="bg-black/40 border border-[#2A2A2E] p-1.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-none transition-all rounded-lg w-full text-center disabled:opacity-50"
                    disabled={v.status !== 'idle'}
                  />
                </div>

                {/* Dispatch Button */}
                <div className="w-12 flex flex-col justify-end pb-0.5">
                  <button
                    onClick={() => {
                      const targetId = v.pendingTargetId;
                      if (targetId) {
                        onDispatch(v.id, targetId, v.pendingLoad);
                      }
                    }}
                    disabled={v.status !== 'idle' || !v.pendingTargetId}
                    className="bg-blue-600/20 text-blue-400 border border-blue-500/30 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none group"
                    title="Dispatch Vehicle"
                  >
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
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
