import { useState, useCallback, useEffect } from 'react';
import { GameState, Location, Transport } from '../types';
import { INITIAL_LOCATIONS, INITIAL_FLEET_S1, INITIAL_FLEET_S2, INITIAL_FLEET_S3, COSTS } from '../constants';

export function useGameLogic() {
  const [state, setState] = useState<GameState>({
    cash: 5000,
    day: 1,
    locations: INITIAL_LOCATIONS,
    fleet: INITIAL_FLEET_S1,
    logs: ['Logistics Ops Started: Scenario 1 - Single Truck. Deliver 26 pallets to each retail store.'],
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
    cashHistory: [0]
  });

  const [tick, setTick] = useState(0);

  const resetGame = useCallback((scenarioOverride?: any) => {
    setState(prev => {
      const scenario = typeof scenarioOverride === 'number' ? scenarioOverride : prev.scenario;
      return {
        cash: 5000,
        day: 1,
        locations: INITIAL_LOCATIONS,
        fleet: scenario === 2 ? INITIAL_FLEET_S2 : (scenario === 3 ? INITIAL_FLEET_S3 : INITIAL_FLEET_S1),
        logs: [`Scenario ${scenario} Started. Simulation from Day 1.`],
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
        cashHistory: [0]
      };
    });
  }, []);

  // Flexible Dispatch: Move stock from Current Location to Target Location
  const dispatchVehicle = useCallback((vehicleId: string, targetId: string, amount: number) => {
    setState(prev => {
      const vehicle = prev.fleet.find(v => v.id === vehicleId);
      const target = prev.locations.find(l => l.id === targetId);
      
      if (!vehicle || !target) return prev;

      // Find location where vehicle is currently stationed
      const origin = prev.locations.find(l => 
        Math.abs(l.x - vehicle.currentPos.x) < 0.5 && 
        Math.abs(l.y - vehicle.currentPos.y) < 0.5
      );

      if (!origin) {
        return {
          ...prev,
          logs: [`Warning: ${vehicle.name} is not at a valid location for dispatch.`, ...prev.logs.slice(0, 5)]
        };
      }

      const isUpdating = vehicle.status === 'enroute' && vehicle.targetId === targetId;
      if (vehicle.status !== 'idle' && !isUpdating) return prev;
      
      if (origin.id === targetId) return prev;
      
      // Calculate realLoad
      const availableInv = isUpdating ? (origin.inventory + vehicle.cargo) : origin.inventory;
      const realLoad = Math.min(amount, vehicle.capacity, availableInv);

      // Economic adjustment: Charge for pallets picked up from distributor (factory)
      let cashChange = 0;
      if (prev.scenario === 3 && origin.type === 'factory') {
        const addedPallets = isUpdating ? (realLoad - vehicle.cargo) : realLoad;
        cashChange = -(addedPallets * COSTS.PALLET_BUY_PRICE);
      }

      return {
        ...prev,
        cash: prev.cash + cashChange,
        cumulativeFlow: {
          ...prev.cumulativeFlow,
          purchases: prev.cumulativeFlow.purchases + (cashChange < 0 ? Math.abs(cashChange) : 0),
          total: prev.cumulativeFlow.total + cashChange
        },
        cashHistory: prev.cashHistory.map((v, i) => i === prev.cashHistory.length - 1 ? v + cashChange : v),
        locations: prev.locations.map(l => l.id === origin.id ? { ...l, inventory: availableInv - realLoad } : l),
        fleet: prev.fleet.map(v => v.id === vehicleId ? { 
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
          ...prev.logs.slice(0, 5)
        ]
      };
    });
  }, []);

  const returnToWarehouse = useCallback((vehicleId: string) => {
    setState(prev => {
      const v = prev.fleet.find(f => f.id === vehicleId);
      const dc = prev.locations.find(l => l.type === 'warehouse')!;
      if (!v || v.status !== 'idle') return prev;

      // Find origin to see if we should pick up anything? 
      // For now, let's just make it a simple move, OR we could use dispatchVehicle.
      // Let's modify ActionPanel to use dispatchVehicle even for returns if we want cargo.
      
      return {
        ...prev,
        fleet: prev.fleet.map(f => f.id === vehicleId ? { 
          ...f, 
          status: 'enroute', 
          targetId: dc.id 
        } : f),
        logs: [`${v.name} returning to Distribution Center.`, ...prev.logs.slice(0, 5)]
      };
    });
  }, []);

  // Discrete Turn: Advance to the next day
  const advanceDay = useCallback(() => {
    setState(prev => {
      if (prev.isGameOver) return prev;
      let newCash = prev.cash;
      let newLogs = [`Day ${prev.day} Completed.`];
      
      const updateMoney = prev.scenario === 3;
      let dailyRevenue = 0;
      let dailyOwnership = 0;
      let dailyOperating = 0;

      // Apply fixed ownership cost for each vehicle in the fleet
      if (updateMoney) {
        dailyOwnership = prev.fleet.length * COSTS.DAILY_OWNERSHIP_COST;
        newCash -= dailyOwnership;
        newLogs.push(`Daily Ownership Cost: -$${dailyOwnership} ($100/truck)`);
      }

      // 1. Process movement for the entire day - Clone objects to avoid mutation of prev state
      const updatedFleet = prev.fleet.map(v => {
        if (v.status === 'enroute' && v.targetId) {
          const target = prev.locations.find(l => l.id === v.targetId)!;
          const dx = target.x - v.currentPos.x;
          const dy = target.y - v.currentPos.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          const dailyMove = 100;
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
      const interLocs = prev.locations.map(l => {
        if (l.type === 'factory') {
          const production = l.production !== undefined ? l.production : (Math.floor(Math.random() * 6) + 10);
          const newInv = Math.min(l.capacity, l.inventory + production);
          return { ...l, inventory: newInv };
        }
        if (l.type === 'store') {
          const dailyDemand = Math.floor(Math.random() * 10) + 1; 
          const sales = Math.min(l.inventory, dailyDemand);
          if (updateMoney) {
            const revenue = sales * COSTS.RETAIL_PRICE;
            newCash += revenue;
            dailyRevenue += revenue;
          }
          if (dailyDemand > 0 && sales < dailyDemand) {
            newLogs.push(`Stockout at ${l.name}! Lost ${dailyDemand - sales} pallets of demand.`);
          }
          return { ...l, inventory: l.inventory - sales, demand: dailyDemand };
        }
        return l;
      });

      // 3. Process arrivals/unloading (added to inventory AFTER sales for next-day use)
      const finalLocs = interLocs.map(loc => {
        let inv = loc.inventory;
        let delivered = loc.delivered;
        // Collect how much is unloaded to this location
        updatedFleet.forEach(v => {
          // Check if truck is idle at this location
          const isAtLoc = Math.abs(v.currentPos.x - loc.x) < 0.5 && Math.abs(v.currentPos.y - loc.y) < 0.5;
          if (v.status === 'idle' && v.cargo > 0 && isAtLoc) {
            const space = loc.capacity - inv;
            const amount = Math.min(v.cargo, space);
            inv += amount;
            delivered += amount;
            if (amount > 0) {
              newLogs.push(`Arrival: ${v.name} unloaded ${amount} pallets at ${loc.name}.`);
            }
            v.cargo -= amount; // This modifies the object in updatedFleet, which is fine as it's a clone
          }
        });
        return { ...loc, inventory: inv, delivered };
      });

      // Check win condition: 26 pallets delivered to EACH retail store
      const allStoresMet = finalLocs
        .filter(l => l.type === 'store')
        .every(l => l.delivered >= 26);

      if (allStoresMet) {
        newLogs.push('CONGRATULATIONS! Delivery target met for all stores.');
      }

      // Update cumulative flow
      // 1. Calculate the day's end-of-day financial delta (revenue - fixed costs - variable travel costs)
      const cashFlowDelta = dailyRevenue - dailyOwnership - dailyOperating;
      const finalCumulative = {
        revenue: prev.cumulativeFlow.revenue + dailyRevenue,
        purchases: prev.cumulativeFlow.purchases,
        ownership: prev.cumulativeFlow.ownership + dailyOwnership,
        operating: prev.cumulativeFlow.operating + dailyOperating,
        total: prev.cumulativeFlow.total + cashFlowDelta
      };

      return {
        ...prev,
        day: prev.day + 1,
        cash: newCash,
        locations: finalLocs,
        fleet: updatedFleet,
        logs: [...newLogs, ...prev.logs.slice(0, 5)],
        isGameOver: allStoresMet,
        cumulativeFlow: finalCumulative,
        cashHistory: [...prev.cashHistory, finalCumulative.total]
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

  const switchScenario = useCallback((scenario: number) => {
    resetGame(scenario);
  }, [resetGame]);

  return { state, dispatchVehicle, returnToWarehouse, advanceDay, updatePendingLoad, updatePendingTarget, switchScenario, resetGame };
}

