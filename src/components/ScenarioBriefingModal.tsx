import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Target, Truck, ShieldAlert, Coins, Play, Info, HelpCircle } from 'lucide-react';

interface ScenarioBriefingModalProps {
  scenario: number;
  onClose: () => void;
}

export function ScenarioBriefingModal({ scenario, onClose }: ScenarioBriefingModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  // Define scenario-specific data
  const scenarioData: Record<number, {
    title: string;
    subtitle: string;
    difficulty: string;
    difficultyClr: string;
    objective: string;
    fleet: { name: string; capacity: string; cost: string; speed: string; status: string }[];
    mechanics: { label: string; value: string }[];
    constraints: string[];
    tips: string;
  }> = {
    1: {
      title: "Scenario 1: Solo Carrier (Delivery Mission)",
      subtitle: "Master the fundamentals of supply chain transportation routing.",
      difficulty: "Beginner",
      difficultyClr: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      objective: "Deliver at least 26 pallets of inventory to EACH of the 2 retail stores in the fewest days possible.",
      fleet: [
        { name: "Truck 1", capacity: "26 Pallets", cost: "$2 / mile", speed: "250 miles / day", status: "Active" }
      ],
      mechanics: [
        { label: "Starting Inventory", value: "Manufacturer starts with 52 pallets. DC & stores start with 0." },
        { label: "No Direct Delivery", value: "Trucks cannot travel directly between the Manufacturer and Stores. Route via the Distribution Center (DC)!" },
        { label: "Unloading Flow", value: "First transport pallets to DC, unload them, then dispatch to Retail Store 1 or Retail Store 2." }
      ],
      constraints: [
        "Trucks must stop at the Distribution Center to buffer inventory from the Manufacturer.",
        "Sales occur daily based on consumer demand (1 to 10 pallets limit)."
      ],
      tips: "Do not keep your truck idle. Shuttle the first 26 pallets to the DC, unload them, and immediately start moving them to Store 1, while returning for the remaining 26 pallets."
    },
    2: {
      title: "Scenario 2: Double Fleet (Fleet Coordination)",
      subtitle: "Optimize labor division and throughput using multiple vehicles.",
      difficulty: "Intermediate",
      difficultyClr: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      objective: "Deliver at least 26 pallets of inventory to EACH store. Coordinate your 2 trucks to beat your Scenario 1 time!",
      fleet: [
        { name: "Truck 1", capacity: "26 Pallets", cost: "$2 / mile", speed: "250 miles / day", status: "Active" },
        { name: "Truck 2", capacity: "26 Pallets", cost: "$2 / mile", speed: "250 miles / day", status: "Active" }
      ],
      mechanics: [
        { label: "Multi-Truck Coordination", value: "You have two matching trucks stationed at the Distribution Center at start." },
        { label: "Throughput Strategy", value: "Since you have two trucks, you can have one transport from Manufacturer to the DC, while the second delivers from DC to stores." },
        { label: "Routing & Flow Limits", value: "Core rules still apply: no direct manufacturer-to-store routing." }
      ],
      constraints: [
        "Inefficiency tracker: Keep an eye on Idle Truck Days in the KPIs panel! Try to minimize both trucks sitting around."
      ],
      tips: "Stagger your deliveries. Send Truck 1 to pick up from Manufacturer and unload to DC, while Truck 2 serves Store 1 and Store 2 dynamically as stock arrives."
    },
    3: {
      title: "Scenario 3: Triple Fleet (Resource Saturation)",
      subtitle: "Understand resource limits, scale-back effects, and operational bottlenecks.",
      difficulty: "Intermediate",
      difficultyClr: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      objective: "Deliver at least 26 pallets of inventory to EACH store. Can you use 3 trucks to achieve an even faster completion time than with 2?",
      fleet: [
        { name: "Truck 1", capacity: "26 Pallets", cost: "$2 / mile", speed: "250 miles / day", status: "Active" },
        { name: "Truck 2", capacity: "26 Pallets", cost: "$2 / mile", speed: "250 miles / day", status: "Active" },
        { name: "Truck 3", capacity: "26 Pallets", cost: "$2 / mile", speed: "250 miles / day", status: "Active" }
      ],
      mechanics: [
        { label: "Resource Bottlenecks", value: "You have plenty of fleet capability. However, the Manufacturer produce only ~10-15 pallets per day." },
        { label: "Diminishing Returns", value: "More trucks do not translate into infinite throughput if the start of the line cannot replenish fast enough!" },
        { label: "Coordinated Idle Days", value: "Track your Idle Truck Days in the KPI indicators. Observe how much excess fleet capacity sits stationary." }
      ],
      constraints: [
        "Infinite transport doesn't solve production delays.",
        "Your score is based on the final day of completion."
      ],
      tips: "Is three trucks truly better than two? Pay attention to the factory's inventory and see if your trucks spend more time sleeping than rolling."
    },
    4: {
      title: "Scenario 4: Profit Maximizer (Enterprise Ledger)",
      subtitle: "Execute demand forecasting and strict financial control.",
      difficulty: "Advanced (Economic Model)",
      difficultyClr: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      objective: "Manage a full-ledger supply chain over critical 20 days. Achieve a POSITIVE total Net Cash Flow to win!",
      fleet: [
        { name: "Truck 1", capacity: "26 Pallets", cost: "$1.50 / mile", speed: "250 miles / day", status: "Active ($75/day rent)" }
      ],
      mechanics: [
        { label: "Daily Rent", value: "Every truck costs a fixed $75/day ownership fee regardless of whether it moves or sits idle." },
        { label: "Pallet Purchase", value: "Picking up pallets from the Manufacturer costs you $80 per pallet immediately." },
        { label: "Retail Earnings", value: "Deliver and sell pallets at Stores for $220 per pallet." },
        { label: "Daily Demand & Stockouts", value: "Stores experience fluctuating daily customer demand. Stockouts lose potential sales forever and hit your KPIs!" }
      ],
      constraints: [
        "You only have 20 days. At the end of Day 20, your cumulative Net Cash Flow must be greater than $0.",
        "Over-supplying is dangerous: inventory stored on idle shelves does not make money until sold, but you paid $80 upfront!"
      ],
      tips: "Only buy and transport what stores can dynamically sell. Watch the demand rates on the map. Try to maintain just enough buffer to dodge the stockout penalty!"
    },
    5: {
      title: "Scenario 5: Profit Maximizer (Dual Carrier)",
      subtitle: "Optimize economic logistics by leasing and routing two trucks.",
      difficulty: "Advanced (Economic Model)",
      difficultyClr: "text-purple-400 bg-purple-500/10 border-purple-500/15",
      objective: "Achieve a POSITIVE total Net Cash Flow at the end of 20 days. Leverage your second truck to capture more sales!",
      fleet: [
        { name: "Truck 1", capacity: "26 Pallets", cost: "$1.50 / mile", speed: "250 miles / day", status: "Active ($75/day rent)" },
        { name: "Truck 2", capacity: "26 Pallets", cost: "$1.50 / mile", speed: "250 miles / day", status: "Active ($75/day rent)" }
      ],
      mechanics: [
        { label: "Double Fixed Rent", value: "Both trucks cost $75/day fixed rent ($150/day total), raising your operational overhead break-even point." },
        { label: "Better Logistics Coverage", value: "With two trucks, you can serve both Stores with minimal stockouts. Deliveries can be staggered easily!" },
        { label: "Cash Flow Balancing", value: "Do not buy pallets recklessly. More trucks let you move faster, but make sure the stores are selling the inventory." }
      ],
      constraints: [
        "Time limit is 20 days. Aim for maximum cumulative Net Cash Flow above $0 to succeed.",
        "With twice the daily rent ($150/day total), stockouts or overstocked shelves are twice as expensive to recover from!"
      ],
      tips: "Use one truck to keep Store 1 stocked, and the other for Store 2. Be careful not to let both trucks sit idle with cargo, otherwise ownership costs will quickly drain your cash!"
    },
    6: {
      title: "Scenario 6: Global Supply Chain (The Raw supplier)",
      subtitle: "Synchronize a multi-echelon raw-material assembly supply chain.",
      difficulty: "Legendary (Multi-Echelon Model)",
      difficultyClr: "text-red-400 bg-red-500/10 border-red-500/20",
      objective: "Deliver at least 26 finished pallets of inventory to EACH of the 6 retail stores. Coordinate raw supplying to win!",
      fleet: [
        { name: "3 Active Trucks", capacity: "26 Pallets", cost: "None (Time-optimized)", speed: "250 miles / day", status: "Active" }
      ],
      mechanics: [
        { label: "Raw Materials Node", value: "A Raw Material Supplier is positioned at the top left. Deliver raw stock to the Manufacturer to start assembly." },
        { label: "1:1 Production assembly", value: "The Manufacturer must consume 1 raw material to build 1 finished pallet of goods." },
        { label: "Two Distribution Centers (DCs)", value: "DC 1 serves Upper stores 1-1, 1-2, 1-3. DC 2 serves Lower stores 2-1, 2-2, 2-3." },
        { label: "3-Truck Operations", value: "A larger operations fleet allows you to assign specific trucks to raw shuttle runs, DC transport, and regional store drops." }
      ],
      constraints: [
        "No direct movement between DC 1 and DC 2 (must return to Manufacturer first).",
        "Stores 1-1, 1-2, and 1-3 are only reachable from Distribution Center 1.",
        "Stores 2-1, 2-2, and 2-3 are only reachable from Distribution Center 2.",
        "The Supplier only accepts outgoing pickups; Factory only accepts raw material unloading."
      ],
      tips: "Dedicate Truck 1 to shuttle raw materials from Supplier to Manufacturer. Dedicate Truck 2 to shuttle finished pallets from Manufacturer to DC 1 or DC 2. Dedicate Truck 3 to deliver from DCs to their final stores!"
    },
    7: {
      title: "Scenario 7: Global Supply Chain (Cash Flow Enterprise)",
      subtitle: "Master multi-echelon financial control across raw procurement, assembly, and 6 retail markets.",
      difficulty: "Master (Enterprise Cash Flow)",
      difficultyClr: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      objective: "Manage a multi-echelon global supply chain over 20 days. Achieve a POSITIVE total Net Cash Flow to win!",
      fleet: [
        { name: "3 Active Trucks", capacity: "26 Pallets", cost: "$1.50 / mile", speed: "250 miles / day", status: "Active ($75/day rent each)" }
      ],
      mechanics: [
        { label: "Triple Ownership Cost", value: "3 trucks cost $225/day total fixed rent ($75/day each)." },
        { label: "Raw Procurement", value: "Buying raw materials at the Supplier costs $1,000 per pallet." },
        { label: "1:1 Production Assembly", value: "Manufacturer consumes 1 raw material to build 1 finished pallet." },
        { label: "6 Store Markets", value: "6 retail stores experience active daily customer demand. Sell finished pallets for $2,000 each!" },
        { label: "Multi-DC Logistics", value: "Route via DC 1 (North) and DC 2 (South) to keep all 6 stores stocked." }
      ],
      constraints: [
        "20 Day time limit. Maintain cumulative Net Cash Flow above $0 at the end of Day 20.",
        "No direct movement between DC 1 and DC 2 (must return to Manufacturer first).",
        "Stores 1-1, 1-2, and 1-3 are only reachable from DC 1; Stores 2-1, 2-2, and 2-3 are only reachable from DC 2.",
        "Avoid stockouts across all 6 stores while managing vehicle mileage and raw material purchase costs!"
      ],
      tips: "Keep a steady flow of raw materials to the factory. Assign Truck 1 to raw supply, Truck 2 to DC replenishment, and Truck 3 to retail deliveries. Keep an eye on store demand levels so you don't over-buy raw materials or suffer stockouts!"
    }
  };

  const activeData = scenarioData[scenario] || scenarioData[1];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto cursor-pointer"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        className="bg-[#121216] border border-[#2A2A2E] w-full max-w-2xl rounded-[28px] overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.15)] flex flex-col my-8 cursor-default"
      >
        {/* Header section with technical theme */}
        <div className="p-6 md:p-8 border-b border-[#2A2A2E] bg-gradient-to-r from-blue-950/20 to-transparent flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] font-mono uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full border ${activeData.difficultyClr}`}>
                {activeData.difficulty}
              </span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Sector Briefing</span>
            </div>
            <h2 className="text-xl md:text-2xl font-sans font-black uppercase tracking-tight text-white">
              {activeData.title}
            </h2>
            <p className="text-xs text-white/50 mt-1 font-sans font-normal">
              {activeData.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-xl cursor-pointer"
            id="close-briefing-btn"
          >
            &times;
          </button>
        </div>

        {/* Info Content with neat visual structure */}
        <div className="p-6 md:p-8 space-y-6 flex-1 text-white overflow-y-auto max-h-[50vh] min-h-[250px]">
          
          {/* Mission Objective / Goal section */}
          <div className="relative overflow-hidden group bg-gradient-to-r from-emerald-500/10 to-transparent p-5 rounded-2xl border border-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                <Target size={18} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Mission Goal</h4>
                <p className="text-sm font-medium leading-relaxed text-white/90 font-sans">
                  {activeData.objective}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mechanics / Operations */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-blue-400" />
                Operational Flow
              </h3>
              <div className="space-y-3">
                {activeData.mechanics.map((mech, index) => (
                  <div key={index} className="bg-white/5 border border-white/5 p-3.5 rounded-xl">
                    <span className="block text-[10px] uppercase font-bold text-blue-400 mb-0.5">{mech.label}</span>
                    <span className="text-xs text-white/75 leading-relaxed font-sans">{mech.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet details & constraints */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Truck size={14} className="text-amber-400" />
                Fleet Resources
              </h3>
              <div className="space-y-2.5">
                {activeData.fleet.map((truck, index) => (
                  <div key={index} className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-white/90 block">{truck.name}</span>
                      <span className="text-[10px] text-white/40">Cap: {truck.capacity} | Speed: {truck.speed}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-amber-400 block font-bold">{truck.cost}</span>
                      <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                        {truck.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Economic Ledger detail if Scenario 4 or 5 */}
              {(scenario === 4 || scenario === 5) && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Coins size={12} />
                    Economic Ledger
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-black/30 p-2 rounded">
                      <span className="text-white/40 block">BUY COST</span>
                      <span className="text-rose-400 font-bold">$80 / pallet</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded">
                      <span className="text-white/40 block">SELL PRICE</span>
                      <span className="text-emerald-400 font-bold">$220 / pallet</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded col-span-2">
                      <span className="text-white/40 block">DAILY FIXED RENT</span>
                      <span className="text-rose-400 font-bold">$75 / truck</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Constraints box */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={14} className="text-rose-400" />
                  Key Constraints
                </h3>
                <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-white/60 leading-relaxed font-sans">
                  {activeData.constraints.map((cons, index) => (
                    <li key={index}>{cons}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Expert Strategy Tips */}
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex gap-3.5 items-start">
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg mt-0.5 shrink-0">
              <Info size={14} />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase text-blue-400 tracking-wider mb-1">Instructor Tip</h5>
              <p className="text-xs text-white/70 italic leading-relaxed font-sans">
                "{activeData.tips}"
              </p>
            </div>
          </div>

        </div>

        {/* Action footer */}
        <div className="p-6 border-t border-[#2A2A2E] bg-black/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
            <HelpCircle size={12} className="text-blue-500/50" />
            <span>Clicking scenario numbers switches sectors.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 self-stretch sm:self-auto cursor-pointer"
            id="lets-begin-btn"
          >
            <Play size={14} fill="currentColor" />
            Let's Begin Simulation
          </button>
        </div>
      </motion.div>
    </div>
  );
}
