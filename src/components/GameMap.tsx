import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Warehouse, Store, Truck, MapPin, Factory } from 'lucide-react';
import { Location, Transport } from '../types';

interface GameMapProps {
  locations: Location[];
  fleet: Transport[];
}

export function GameMap({ locations, fleet }: GameMapProps) {
  return (
    <div className="relative w-full h-full bg-[#121214] overflow-hidden border-2 border-[#2A2A2E] rounded-xl shadow-2xl">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 data-grid opacity-5 pointer-events-none" />
      
      {/* Connection Lines (Routes) */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
        {locations.filter(l => l.type !== 'warehouse').map(loc => {
          const wh = locations.find(l => l.type === 'warehouse')!;
          const dx = loc.x - wh.x;
          const dy = loc.y - wh.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const miles = Math.round(dist * 5); // 5 is MILES_PER_UNIT
          
          return (
            <React.Fragment key={`route-group-${loc.id}`}>
              <line 
                x1={`${wh.x}%`} y1={`${wh.y}%`}
                x2={`${loc.x}%`} y2={`${loc.y}%`}
                stroke={loc.type === 'factory' ? "#f59e0b" : "#6366f1"} strokeWidth="2" strokeDasharray="6 4"
              />
              <text
                x={`${(wh.x + loc.x) / 2}%`}
                y={`${(wh.y + loc.y) / 2}%`}
                dy="-10"
                textAnchor="middle"
                fill="white"
                className="text-[10px] font-mono font-bold opacity-60"
              >
                {miles} mi
              </text>
            </React.Fragment>
          );
        })}
      </svg>

      {/* Locations */}
      {locations.map(loc => (
        <div 
          key={loc.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
          style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
        >
          <div className={`p-3 rounded-xl border-2 transition-all
            ${loc.type === 'warehouse' 
              ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
              : loc.type === 'factory'
                ? 'bg-amber-500 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'}
            hover:scale-110 hover:rotate-3
          `}>
            {loc.type === 'warehouse' ? <Warehouse size={28} strokeWidth={2.5} /> : 
             loc.type === 'factory' ? <Factory size={24} strokeWidth={2.5} /> :
             <Store size={24} strokeWidth={2.5} />}
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest bg-[#1A1A1E] text-white px-2 py-0.5 rounded border border-[#2A2A2E]">
              {loc.name}
            </p>
            <div className="mt-1 flex items-center gap-1 justify-center">
              <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full ${loc.inventory < (loc.capacity * 0.2) ? 'bg-orange-500' : 'bg-blue-400'}`} 
                  style={{ width: `${(loc.inventory / loc.capacity) * 100}%` }} 
                />
              </div>
              <span className="text-[12px] font-mono font-bold text-white/80">{loc.inventory}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Fleet */}
      <AnimatePresence>
        {fleet.map(v => (
          <motion.div
            key={v.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            initial={false}
            animate={{ 
              left: `${v.currentPos.x}%`, 
              top: `${v.currentPos.y}%`,
              transition: { duration: 0.3, ease: "linear" }
            }}
          >
            <div className={`p-2 rounded-lg border-2 shadow-lg
              ${v.status === 'enroute' 
                ? 'bg-amber-400 border-amber-300 text-black animate-pulse' 
                : 'bg-white border-gray-200 text-black'}
            `}>
              <Truck size={20} strokeWidth={2.5} />
            </div>
            {v.cargo > 0 && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-400 text-black border-2 border-black text-xs px-2 py-0.5 font-black rounded-md shadow-lg">
                {v.cargo}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
