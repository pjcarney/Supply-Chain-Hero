import { useState, useCallback, useEffect } from 'react';
import { GameState, Location, Transport } from '../types';
import { INITIAL_LOCATIONS, INITIAL_FLEET_S1, INITIAL_FLEET_S2, INITIAL_FLEET_S3, INITIAL_FLEET_S4, INITIAL_FLEET_S5, INITIAL_LOCATIONS_S6, INITIAL_FLEET_S6, COSTS } from '../constants';

export function useGameLogic() {
  const [state, setState] = useState<GameState>({
    cash: 5000,
    day: 1,
    locations: INITIAL_LOCATIONS,
    fleet: INITIAL_FLEET_S1,
    logs: ['Fleet Ops Started: Scenario 1 - Delivery Mission. Get 26 pallets to each store.'],
    isGameOver: false,
    scenario: 1,
    satisfaction: 100,
    pendingOrders: [],
    cumulativeFlow: { 
      revenue: 0, 
      purchases: 0, 
      ownership: 0, 
      operating: 0, 
      total: 0 
    },
    cashHistory: [0],
    kpis: {
      unmetDemand: 0,
      idleTruckDays: 0
    }
  });

  const [history, setHistory] = useState<GameState[]>([]);

  const resetGame = useCallback((scenarioOverride?: any) => {
    setHistory([]);
    setState(prev => {
      const scenario = typeof scenarioOverride === 'number' ? scenarioOverride : prev.scenario;
      let startLog = `Scenario ${scenario} Started. Simulation from Day 1.`;
      if (scenario === 1) startLog = "Scenario 1: Solo Carrier. Deliver 26 pallets to each store.";
      if (scenario === 2) startLog = "Scenario 2: Double Fleet. Deliver 26 pallets to each store.";
      if (scenario === 3) startLog = "Scenario 3: Triple Fleet. Deliver 26 pallets to each store.";
      if (scenario === 4) startLog = "Scenario 4: Profit Maximizer. 20 Days to achieve positive net flow. Manage your fleet and inventory cost carefully.";
      if (scenario === 5) startLog = "Scenario 5: Profit Maximizer (Dual Carrier). 20 Days, positive net flow. Try to leverage two trucks to stay profitable!";
      if (scenario === 6) startLog = "Scenario 6: Global Supply Chain. Deliver 26 pallets of finished goods to each of the 6 stores! Manage raw material flow first.";
      if (scenario === 7) startLog = "Scenario 7: Global Supply Chain (Cash Flow). 20 Days to achieve positive net flow. Manage raw procurement, manufacturing, and retail sales!";

      return {
        cash: scenario === 7 ? 50000 : 5000,
        day: 1,
        locations: (scenario === 6 || scenario === 7) 
          ? INITIAL_LOCATIONS_S6 
          : ((scenario === 4 || scenario === 5) ? INITIAL_LOCATIONS.map(l => l.type === 'factory' ? { ...l, inventory: 100 } : l) : INITIAL_LOCATIONS),
        fleet: scenario === 2 
          ? INITIAL_FLEET_S2 
          : (scenario === 3 
              ? INITIAL_FLEET_S3 
              : (scenario === 4 
                  ? INITIAL_FLEET_S4 
                  : (scenario === 5 
                      ? INITIAL_FLEET_S5 
                      : ((scenario === 6 || scenario === 7) ? INITIAL_FLEET_S6 : INITIAL_FLEET_S1)))),
        logs: [startLog],
        isGameOver: false,
        scenario,
        satisfaction: 100,
        pendingOrders: [],
        cumulativeFlow: { 
          revenue: 0, 
          purchases: 0, 
          ownership: 0, 
          operating: 0, 
          total: 0
        },
        cashHistory: [0],
        kpis: {
          unmetDemand: 0,
          idleTruckDays: 0
        }
      };
    });
  }, []);

  // Core dispatch logic used by both manual and auto-dispatches
  const executeDispatch = (prevState: GameState, vehicleId: string, targetId: string, amount: number): GameState => {
    const vehicle = prevState.fleet.find(v => v.id === vehicleId);
    const target = prevState.locations.find(l => l.id === targetId);
    
    if (!vehicle || !target) return prevState;

    // Find location where vehicle is currently stationed
    const origin = prevState.locations.find(l => 
      Math.abs(l.x - vehicle.currentPos.x) < 1.0 && 
      Math.abs(l.y - vehicle.currentPos.y) < 1.0
    );

    if (!origin) {
      return {
        ...prevState,
        logs: [`Warning: ${vehicle.name} is not at a valid location for dispatch.`, ...prevState.logs.slice(0, 5)]
      };
    }

    const isUpdating = vehicle.status === 'enroute' && vehicle.targetId === targetId;
    if (vehicle.status !== 'idle' && !isUpdating) return prevState;
    
    if (origin.id === targetId) return prevState;

    // Routing Restrictions
    if (prevState.scenario === 6 || prevState.scenario === 7) {
      if (origin.type === 'supplier' && target.type !== 'factory') {
        return {
          ...prevState,
          logs: [`Restriction: ${vehicle.name} from Supplier can only go to Manufacturer.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if (origin.type === 'factory' && target.type === 'store') {
        return {
          ...prevState,
          logs: [`Restriction: ${vehicle.name} cannot go directly from Manufacturer to Retail Store. Stop at DC first.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if (origin.type === 'warehouse' && target.type === 'supplier') {
        return {
          ...prevState,
          logs: [`Restriction: ${vehicle.name} must return to Manufacturer before visiting Supplier.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if (origin.type === 'warehouse' && target.type === 'warehouse') {
        return {
          ...prevState,
          logs: [`Restriction: ${vehicle.name} cannot go directly between Distribution Centers. Return to Manufacturer first.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if ((target.id === 'retail_1_1' || target.id === 'retail_1_2' || target.id === 'retail_1_3') && origin.id !== 'dc_1') {
        return {
          ...prevState,
          logs: [`Restriction: ${target.name} is only reachable from Distribution Center 1.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if ((target.id === 'retail_2_1' || target.id === 'retail_2_2' || target.id === 'retail_2_3') && origin.id !== 'dc_2') {
        return {
          ...prevState,
          logs: [`Restriction: ${target.name} is only reachable from Distribution Center 2.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if (origin.id.startsWith('retail_1') && target.id !== 'dc_1') {
        return {
          ...prevState,
          logs: [`Restriction: ${origin.name} can only return to Distribution Center 1.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if (origin.id.startsWith('retail_2') && target.id !== 'dc_2') {
        return {
          ...prevState,
          logs: [`Restriction: ${origin.name} can only return to Distribution Center 2.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if (origin.type === 'store' && (target.type === 'factory' || target.type === 'supplier')) {
        return {
          ...prevState,
          logs: [`Restriction: ${vehicle.name} from Retail Store can only return to a Distribution Center.`, ...prevState.logs.slice(0, 5)]
        };
      }
    } else {
      if (origin.type === 'factory' && target.type === 'store') {
        return {
          ...prevState,
          logs: [`Restriction: ${vehicle.name} cannot go directly from Manufacturer to Retail Store. Stop at DC first.`, ...prevState.logs.slice(0, 5)]
        };
      }
      if (origin.type === 'store' && target.type === 'factory') {
        return {
          ...prevState,
          logs: [`Restriction: ${vehicle.name} cannot go directly from Retail Store to Manufacturer.`, ...prevState.logs.slice(0, 5)]
        };
      }
    }
    
    // Calculate realLoad
    const availableInv = isUpdating ? (origin.inventory + vehicle.cargo) : origin.inventory;
    const realLoad = Math.min(amount, vehicle.capacity, availableInv);

    // Economic adjustment: Charge for pallets picked up from distributor/factory or raw supplier
    let cashChange = 0;
    if ((prevState.scenario === 4 || prevState.scenario === 5) && origin.type === 'factory') {
      const addedPallets = isUpdating ? (realLoad - vehicle.cargo) : realLoad;
      cashChange = -(addedPallets * COSTS.PALLET_BUY_PRICE);
    } else if (prevState.scenario === 7 && origin.type === 'supplier') {
      const addedPallets = isUpdating ? (realLoad - vehicle.cargo) : realLoad;
      cashChange = -(addedPallets * 1000);
    }

    return {
      ...prevState,
      cash: prevState.cash + cashChange,
      cumulativeFlow: {
        ...prevState.cumulativeFlow,
        purchases: prevState.cumulativeFlow.purchases + (cashChange < 0 ? Math.abs(cashChange) : 0),
        total: prevState.cumulativeFlow.total + cashChange
      },
      cashHistory: prevState.cashHistory.map((v, i) => i === prevState.cashHistory.length - 1 ? v + cashChange : v),
      locations: prevState.locations.map(l => l.id === origin.id ? { ...l, inventory: availableInv - realLoad } : l),
      fleet: prevState.fleet.map(v => v.id === vehicleId ? { 
        ...v, 
        status: 'enroute', 
        targetId, 
        pendingTargetId: undefined,
        cargo: realLoad,
        pendingLoad: amount
      } : v),
      logs: [
        isUpdating 
          ? `Update: ${vehicle.name} shipment adjusted to ${realLoad} pallets.`
          : `Dispatch: ${vehicle.name} loading ${realLoad} pallets from ${origin.name}, enroute to ${target.name}.`, 
        ...(cashChange < 0 ? [`Inventory Purchase: Paid $${Math.abs(cashChange)} for ${Math.abs(realLoad - (isUpdating ? vehicle.cargo : 0))} pallets.`] : []),
        ...(cashChange > 0 ? [`Inventory Refund: Received $${cashChange} for returning ${Math.abs(realLoad - (isUpdating ? vehicle.cargo : 0))} pallets.`] : []),
        ...prevState.logs.slice(0, 5)
      ]
    };
  };

  // Flexible Dispatch: Move stock from Current Location to Target Location
  const dispatchVehicle = useCallback((vehicleId: string, targetId: string, amount: number) => {
    setState(prev => executeDispatch(prev, vehicleId, targetId, amount));
  }, []);

  const returnToWarehouse = useCallback((vehicleId: string) => {
    setState(prev => {
      const v = prev.fleet.find(f => f.id === vehicleId);
      if (!v || v.status !== 'idle') return prev;

      const dcs = prev.locations.filter(l => l.type === 'warehouse');
      if (dcs.length === 0) return prev;

      // Find closest DC
      let closestDc = dcs[0];
      let minDist = Infinity;
      dcs.forEach(dc => {
        const dx = dc.x - v.currentPos.x;
        const dy = dc.y - v.currentPos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
          minDist = dist;
          closestDc = dc;
        }
      });
      
      return {
        ...prev,
        fleet: prev.fleet.map(f => f.id === vehicleId ? { 
          ...f, 
          status: 'enroute', 
          targetId: closestDc.id 
        } : f),
        logs: [`${v.name} returning to ${closestDc.name}.`, ...prev.logs.slice(0, 5)]
      };
    });
  }, []);

  // Discrete Turn: Advance to the next day
  const advanceDay = useCallback((pendingDispatches?: { vehicleId: string, targetId: string, amount: number }[]) => {
    setState(current => {
      if (current.isGameOver) return current;

      // Save snapshot of state prior to advancing the day into history stack
      setHistory(prevHistory => [...prevHistory, current]);

      // First, apply any automatic dispatches
      let prev = current;
      if (pendingDispatches && pendingDispatches.length > 0) {
        pendingDispatches.forEach(d => {
          if (d.targetId) {
            prev = executeDispatch(prev, d.vehicleId, d.targetId, d.amount);
          }
        });
      }

      let newCash = prev.cash;
      let newLogs = [`Day ${prev.day} Completed.`];
      
      const updateMoney = prev.scenario === 4 || prev.scenario === 5 || prev.scenario === 7;
      let dailyRevenue = 0;
      let dailyOwnership = 0;
      let dailyOperating = 0;

      // Apply fixed ownership cost for each vehicle in the fleet
      if (updateMoney) {
        dailyOwnership = prev.fleet.length * COSTS.DAILY_OWNERSHIP_COST;
        newCash -= dailyOwnership;
        newLogs.push(`Daily Ownership Cost: -$${dailyOwnership} ($${COSTS.DAILY_OWNERSHIP_COST}/truck)`);
      }

      // 1. Process movement for the entire day - Clone objects to avoid mutation of prev state
      let idleCount = 0;
      const updatedFleet = prev.fleet.map(v => {
        if (v.status === 'idle') {
          idleCount++;
        }
        if (v.status === 'enroute' && v.targetId) {
          const target = prev.locations.find(l => l.id === v.targetId)!;
          const dx = target.x - v.currentPos.x;
          const dy = target.y - v.currentPos.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          const dailyMove = 100; // Restore to 100 for one-day trips across standard distances
          const moveDist = Math.min(dist, dailyMove);
          const milesTraveled = moveDist * COSTS.MILES_PER_UNIT;
          const moveCost = milesTraveled * v.costPerMile;
          if (updateMoney) {
            newCash -= moveCost;
            dailyOperating += moveCost;
          }

          if (dist <= dailyMove + 0.1) {
            return { ...v, status: 'idle', targetId: undefined, pendingTargetId: undefined, pendingLoad: 0, currentPos: { x: target.x, y: target.y } };
          } else {
            return {
              ...v,
              currentPos: {
                x: v.currentPos.x + (dx/dist) * dailyMove,
                y: v.currentPos.y + (dy/dist) * dailyMove
              }
            };
          }
        }
        return { ...v }; // Clone even if idle to be safe
      });

      // 2. Daily Demand, Sales & Production (using morning inventory)
      let dailyUnmet = 0;
      const interLocs = prev.locations.map(l => {
        if (l.type === 'supplier') {
          // Supplier produces raw materials
          const production = l.production !== undefined ? l.production : 15;
          const newInv = Math.min(l.capacity, l.inventory + production);
          return { ...l, inventory: newInv };
        }
        if (l.type === 'factory') {
          if (prev.scenario === 4 || prev.scenario === 5) {
            return { ...l, inventory: 100 };
          }
          if (prev.scenario === 6 || prev.scenario === 7) {
            // Manufacturer requires raw materials 1:1 to assemble finished pallets
            const onHandRaw = l.rawInventory !== undefined ? l.rawInventory : 0;
            const capLimit = l.production !== undefined ? l.production : 12;
            const actualAssemble = Math.min(capLimit, onHandRaw);
            const newInv = Math.min(l.capacity, l.inventory + actualAssemble);
            if (actualAssemble > 0) {
              newLogs.push(`Manufacturer assembled ${actualAssemble} finished pallets (used ${actualAssemble} raw materials).`);
            } else if (onHandRaw === 0) {
              newLogs.push(`Manufacturer production STALLED! Waiting on raw materials...`);
            }
            return {
              ...l,
              inventory: newInv,
              rawInventory: onHandRaw - actualAssemble
            };
          }
          const production = l.production !== undefined ? l.production : (Math.floor(Math.random() * 6) + 10);
          const newInv = Math.min(l.capacity, l.inventory + production);
          return { ...l, inventory: newInv };
        }
        if (l.type === 'store') {
          if (updateMoney) {
            // Scenarios 4, 5 and 7: Cash flow scenarios with active store demand
            const maxDemand = prev.scenario === 7 ? 5 : 10;
            const dailyDemand = Math.floor(Math.random() * maxDemand) + 1; 
            const sales = Math.min(l.inventory, dailyDemand);
            const price = prev.scenario === 7 ? 2000 : COSTS.RETAIL_PRICE;
            const revenue = sales * price;
            newCash += revenue;
            dailyRevenue += revenue;
            if (dailyDemand > 0 && sales < dailyDemand) {
              const unmet = dailyDemand - sales;
              dailyUnmet += unmet;
              newLogs.push(`Stockout at ${l.name}! Lost ${unmet} pallets of demand.`);
            }
            return { ...l, inventory: l.inventory - sales, demand: dailyDemand };
          } else {
            // Scenarios 1, 2, 3, 6: Non-cash flow scenarios with zero demand
            return { ...l, inventory: l.inventory, demand: 0 };
          }
        }
        return l;
      });

      // 3. Process arrivals/unloading (added to inventory/raw_inventory AFTER sales for next-day use)
      const finalLocs = interLocs.map(loc => {
        let inv = loc.inventory;
        let rawInv = loc.rawInventory;
        let delivered = loc.delivered;
        
        // Collect how much is unloaded to this location
        updatedFleet.forEach(v => {
          // Check if truck is idle at this location
          const isAtLoc = Math.abs(v.currentPos.x - loc.x) < 0.5 && Math.abs(v.currentPos.y - loc.y) < 0.5;
          if (v.status === 'idle' && v.cargo > 0 && isAtLoc) {
            if (loc.type === 'factory') {
              // Factories accept raw materials
              const currentRawNum = rawInv !== undefined ? rawInv : 0;
              const space = loc.capacity - currentRawNum;
              const amount = Math.min(v.cargo, space);
              rawInv = currentRawNum + amount;
              delivered += amount;
              if (amount > 0) {
                newLogs.push(`Arrival: ${v.name} delivered ${amount} raw materials to Manufacturer.`);
              }
              v.cargo -= amount;
            } else if (loc.type !== 'supplier') { // Supplier does not accept incoming unloads
              const space = loc.capacity - inv;
              const amount = Math.min(v.cargo, space);
              inv += amount;
              delivered += amount;
              if (amount > 0) {
                newLogs.push(`Arrival: ${v.name} unloaded ${amount} finished goods at ${loc.name}.`);
              }
              v.cargo -= amount; // This modifies the object in updatedFleet, which is fine as it's a clone
            }
          }
        });
        return { ...loc, inventory: inv, rawInventory: rawInv, delivered };
      });

      // Update cumulative statistics
      const cashFlowDelta = dailyRevenue - dailyOwnership - dailyOperating;
      const finalCumulative = {
        revenue: prev.cumulativeFlow.revenue + dailyRevenue,
        purchases: prev.cumulativeFlow.purchases,
        ownership: prev.cumulativeFlow.ownership + dailyOwnership,
        operating: prev.cumulativeFlow.operating + dailyOperating,
        total: prev.cumulativeFlow.total + cashFlowDelta
      };

      // Check win/end conditions
      let gameOver = false;
      if (prev.scenario === 4 || prev.scenario === 5 || prev.scenario === 7) {
        if (prev.day >= 20) {
          gameOver = true;
          const success = finalCumulative.total > 0;
          newLogs.push(success 
            ? `MISSION COMPLETE: $${finalCumulative.total.toLocaleString()} profit reached!` 
            : `SCENARIO END: No profit achieved. Final flow: $${finalCumulative.total.toLocaleString()}`);
        }
      } else {
        const allStoresMet = finalLocs
          .filter(l => l.type === 'store')
          .every(l => l.delivered >= 26);
        
        if (allStoresMet) {
          gameOver = true;
          newLogs.push('CONGRATULATIONS! Delivery target met for all stores.');
        }
      }

      return {
        ...prev,
        day: prev.day + 1,
        cash: newCash,
        locations: finalLocs,
        fleet: updatedFleet,
        logs: [...newLogs, ...prev.logs.slice(0, 5)],
        isGameOver: gameOver,
        cumulativeFlow: finalCumulative,
        cashHistory: [...prev.cashHistory, finalCumulative.total],
        kpis: {
          unmetDemand: prev.kpis.unmetDemand + dailyUnmet,
          idleTruckDays: prev.kpis.idleTruckDays + idleCount
        }
      };
    });
  }, []);

  const updatePendingLoad = useCallback((vehicleId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      fleet: prev.fleet.map(v => v.id === vehicleId ? { ...v, pendingLoad: amount } : v)
    }));
  }, []);

  const updatePendingTarget = useCallback((vehicleId: string, targetId: string) => {
    setState(prev => ({
      ...prev,
      fleet: prev.fleet.map(v => v.id === vehicleId ? { ...v, pendingTargetId: targetId } : v)
    }));
  }, []);

  const undoDay = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) return prevHistory;
      const lastState = prevHistory[prevHistory.length - 1];
      setState(lastState);
      return prevHistory.slice(0, -1);
    });
  }, []);

  const switchScenario = useCallback((scenario: number) => {
    resetGame(scenario);
  }, [resetGame]);

  return { state, dispatchVehicle, returnToWarehouse, advanceDay, undoDay, canUndo: history.length > 0, updatePendingLoad, updatePendingTarget, switchScenario, resetGame };
}

