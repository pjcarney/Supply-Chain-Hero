import React from 'react';
import { GameState } from '../types';
import { DollarSign, ArrowUpRight, ArrowDownRight, Truck, Package, CreditCard } from 'lucide-react';

interface CashFlowStatementProps {
  state: GameState;
}

export function CashFlowStatement({ state }: CashFlowStatementProps) {
  const cf = state.cumulativeFlow;

  if (state.scenario < 3) {
    return (
      <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl h-[450px] flex flex-col justify-center items-center text-center opacity-50">
        <DollarSign size={40} className="text-white/10 mb-4" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Financial Performance</h3>
        <p className="text-xs text-white/20 font-mono">Available in Scenario 3: Economic Operations</p>
      </div>
    );
  }

  const rows = [
    { label: 'Total Sales Revenue', value: cf.revenue },
    { label: 'Inventory Purchases', value: -cf.purchases },
    { label: 'Vehicle Ownership Fees', value: -cf.ownership },
    { label: 'Vehicle Operating Costs', value: -cf.operating },
  ];

  return (
    <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-6 rounded-2xl shadow-xl flex flex-col h-[450px]">
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Statement of Cash Flows</h3>
          <h2 className="text-xl font-sans font-black uppercase tracking-tight">Cumulative (Day {state.day})</h2>
        </div>
        <div className="bg-blue-500/10 px-2 py-1 rounded text-[10px] font-mono text-blue-400 uppercase">
          Scenario {state.scenario}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {rows.map((row, idx) => (
          <div key={idx} className="flex justify-between items-baseline border-b border-white/5 pb-2 last:border-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 font-sans">{row.label}</span>
            <div className={`font-mono text-sm font-bold ${row.value > 0 ? 'text-emerald-400' : (row.value < 0 ? 'text-rose-400' : 'text-white/20')}`}>
              {row.value < 0 ? '(' : ''}${Math.abs(row.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{row.value < 0 ? ')' : ''}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-[#2A2A2E]">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Net Scenario Cash Flow
          </span>
          <div className={`text-2xl font-mono font-black ${cf.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {cf.total < 0 ? '(' : ''}${Math.abs(cf.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{cf.total < 0 ? ')' : ''}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
           <div className="text-[9px] font-mono text-white/10 uppercase tracking-widest">
             Audited Simulation Results
           </div>
        </div>
      </div>
    </div>
  );
}
