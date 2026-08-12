import React from 'react';
import { GameState } from '../types';
import { Activity, AlertCircle, Clock, BarChart3 } from 'lucide-react';

interface KPIPanelProps {
  state: GameState;
}

export function KPIPanel({ state }: KPIPanelProps) {
  const kpis = state.kpis;

  const metrics = [
    {
      label: 'Unmet Store Demand',
      value: kpis.unmetDemand,
      unit: 'Pallets',
      icon: <AlertCircle size={14} className="text-rose-400" />,
      description: 'Lost sales due to stockouts',
      color: 'text-rose-400'
    },
    {
      label: 'Idle Truck Days',
      value: kpis.idleTruckDays,
      unit: 'Days',
      icon: <Clock size={14} className="text-amber-400" />,
      description: 'Fleet inefficiency (static units)',
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl flex flex-col h-[450px]">
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Performance Benchmarks</h3>
          <h2 className="text-xl font-sans font-black uppercase tracking-tight">Key Results (KPIs)</h2>
        </div>
        <div className="bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-mono text-emerald-400 uppercase">
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              {m.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{m.label}</span>
                <span className={`text-xl font-mono font-black ${m.color}`}>{m.value}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-white/20 font-sans italic">{m.description}</span>
                <span className="text-[10px] font-mono text-white/40 uppercase">{m.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 italic">
        <span className="text-[8px] font-sans text-white/60 tracking-widest uppercase">System Inefficiency Tracker</span>
        <Activity size={12} className="text-white/60" />
      </div>
    </div>
  );
}
