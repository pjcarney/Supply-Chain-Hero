import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Warehouse, Store, Truck, MapPin, Factory, Package } from 'lucide-react';
import { Location, Transport } from '../types';

interface GameMapProps {
  locations: Location[];
  fleet: Transport[];
}

export function GameMap({ locations, fleet }: GameMapProps) {
  // Build Route Connections dynamically based on the current active locations
  const routes: { id: string; from: Location; to: Location; color: string }[] = [];
  
  const factory = locations.find(l => l.type === 'factory');
  const dcs = locations.filter(l => l.type === 'warehouse');
  const supplier = locations.find(l => l.type === 'supplier');
  const stores = locations.filter(l => l.type === 'store');

  if (supplier && factory) {
    routes.push({ id: 'route-supplier-factory', from: supplier, to: factory, color: "#a855f7" }); // Purple for raw materials
  }

  if (factory) {
    dcs.forEach((dc, index) => {
      routes.push({ id: `route-factory-dc-${index}`, from: factory, to: dc, color: "#f59e0b" }); // Amber for factory to DC
    });
  }

  stores.forEach(store => {
    if (dcs.length > 1) {
      // S6 Specific DC-to-Store mapping
      if (store.id.startsWith('retail_1')) {
        const dc1 = dcs.find(d => d.id === 'dc_1');
        if (dc1) routes.push({ id: `route-dc1-${store.id}`, from: dc1, to: store, color: "#6366f1" });
      } else if (store.id.startsWith('retail_2')) {
        const dc2 = dcs.find(d => d.id === 'dc_2');
        if (dc2) routes.push({ id: `route-dc2-${store.id}`, from: dc2, to: store, color: "#34d399" }); // Teal for DC2 stores
      } else {
        // Fallback
        routes.push({ id: `route-fallback-${store.id}`, from: dcs[0], to: store, color: "#6366f1" });
      }
    } else {
      // S1-5 mapping: all stores linked to first DC
      const singleDc = dcs[0];
      if (singleDc) {
        routes.push({ id: `route-dc-${store.id}`, from: singleDc, to: store, color: "#6366f1" });
      }
    }
  });

  return (
    <div className="relative w-full h-full bg-[#121214] overflow-hidden border-2 border-[#2A2A2E] rounded-xl shadow-2xl">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 data-grid opacity-5 pointer-events-none" />
      
      {/* Connection Lines (Routes) */}
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
        {routes.map(route => {
          const dx = route.to.x - route.from.x;
          const dy = route.to.y - route.from.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const miles = Math.round(dist * 5); // 5 is MILES_PER_UNIT
          
          return (
            <React.Fragment key={route.id}>
              <line 
                x1={`${route.from.x}%`} y1={`${route.from.y}%`}
                x2={`${route.to.x}%`} y2={`${route.to.y}%`}
                stroke={route.color} strokeWidth="2" strokeDasharray="6 4"
              />
              <text
                x={`${(route.from.x + route.to.x) / 2}%`}
                y={`${(route.from.y + route.to.y) / 2}%`}
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
                : loc.type === 'supplier'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                  : 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'}
            hover:scale-110 hover:rotate-3
          `}>
            {loc.type === 'warehouse' ? <Warehouse size={28} strokeWidth={2.5} /> : 
             loc.type === 'factory' ? <Factory size={24} strokeWidth={2.5} /> :
             loc.type === 'supplier' ? <Package size={24} strokeWidth={2.5} /> :
             <Store size={24} strokeWidth={2.5} />}
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest bg-[#1A1A1E] text-white px-2 py-0.5 rounded border border-[#2A2A2E]">
              {loc.name}
            </p>
            
            {/* Custom display for Factory in Scenario 6 */}
            {loc.type === 'factory' && loc.rawInventory !== undefined ? (
              <div className="mt-1 flex flex-col items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest font-black">Raw:</span>
                  <span className="text-[11px] font-mono font-bold text-purple-300">{loc.rawInventory}</span>
                </div>
                <div className="flex items-center gap-1 border-t border-white/5 pt-0.5 w-full justify-center">
                  <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest font-black">Fin:</span>
                  <span className="text-[11px] font-mono font-bold text-amber-300">{loc.inventory}</span>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-1 justify-center">
                <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full ${loc.inventory < (loc.capacity * 0.2) ? 'bg-orange-500' : 'bg-blue-400'}`} 
                    style={{ width: `${(loc.inventory / loc.capacity) * 100}%` }} 
                  />
                </div>
                <span className="text-[12px] font-mono font-bold text-white/80">{loc.inventory}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Fleet */}
      <AnimatePresence>
        {fleet.map((v, idx) => {
          // Calculate offset if multiple trucks are at the exact same stationary location
          const samePosCount = fleet.filter(other => 
            Math.abs(other.currentPos.x - v.currentPos.x) < 0.8 && 
            Math.abs(other.currentPos.y - v.currentPos.y) < 0.8
          ).length;

          const samePosIndex = fleet.filter(other => 
            Math.abs(other.currentPos.x - v.currentPos.x) < 0.8 && 
            Math.abs(other.currentPos.y - v.currentPos.y) < 0.8
          ).findIndex(other => other.id === v.id);

          const offsetX = samePosCount > 1 ? (samePosIndex - (samePosCount - 1) / 2) * 36 : 0;

          // Color themes for distinct truck identification
          const isT1 = v.id === 't1' || idx === 0;
          const isT2 = v.id === 't2' || idx === 1;
          
          const theme = isT1 
            ? {
                badgeBg: 'bg-amber-400 text-black border-amber-300',
                iconBg: v.status === 'enroute' ? 'bg-amber-400 border-amber-300 text-black' : 'bg-amber-100 border-amber-400 text-amber-900',
                glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]'
              }
            : isT2
              ? {
                  badgeBg: 'bg-cyan-400 text-black border-cyan-300',
                  iconBg: v.status === 'enroute' ? 'bg-cyan-400 border-cyan-300 text-black' : 'bg-cyan-100 border-cyan-400 text-cyan-900',
                  glow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                }
              : {
                  badgeBg: 'bg-purple-400 text-black border-purple-300',
                  iconBg: v.status === 'enroute' ? 'bg-purple-400 border-purple-300 text-black' : 'bg-purple-100 border-purple-400 text-purple-900',
                  glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                };

          return (
            <motion.div
              key={v.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center"
              initial={false}
              animate={{ 
                left: `calc(${v.currentPos.x}% + ${offsetX}px)`, 
                top: `${v.currentPos.y}%`,
                transition: { duration: 0.3, ease: "linear" }
              }}
            >
              {/* Top Badges: Cargo + Label */}
              <div className="flex flex-col items-center mb-1 gap-0.5">
                {v.cargo > 0 && (
                  <div className="bg-amber-400 text-black border-2 border-black text-[9px] px-1.5 py-0.2 font-black rounded shadow-lg whitespace-nowrap">
                    📦 {v.cargo} Pallets
                  </div>
                )}
                
                {/* Truck Name Label */}
                <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border-2 shadow-lg whitespace-nowrap ${theme.badgeBg}`}>
                  {v.name}
                </div>
              </div>

              {/* Truck Icon Box */}
              <div className={`p-2 rounded-lg border-2 shadow-lg transition-all ${theme.iconBg} ${v.status === 'enroute' ? `${theme.glow} animate-pulse scale-105` : ''}`}>
                <Truck size={20} strokeWidth={2.5} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
