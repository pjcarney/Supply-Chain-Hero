import { Location, Transport } from './types';

export const INITIAL_LOCATIONS: Location[] = [
  { id: 'factory_1', name: 'Manufacturer', type: 'factory', x: 5, y: 50, inventory: 52, capacity: 500, production: 0, delivered: 0 },
  { id: 'dc', name: 'Distribution Center', type: 'warehouse', x: 45, y: 50, inventory: 0, capacity: 1000, delivered: 0 },
  { id: 'retail_1', name: 'Retail Store 1', type: 'store', x: 80, y: 30, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
  { id: 'retail_2', name: 'Retail Store 2', type: 'store', x: 90, y: 70, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
];

export const INITIAL_FLEET_S1: Transport[] = [
  { 
    id: 't1', 
    name: 'Truck 1', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 5, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
];

export const INITIAL_FLEET_S2: Transport[] = [
  { 
    id: 't1', 
    name: 'Truck 1', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 5, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
  { 
    id: 't2', 
    name: 'Truck 2', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
];

export const INITIAL_FLEET_S3: Transport[] = [
  { 
    id: 't1', 
    name: 'Truck 1', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 5, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
  { 
    id: 't2', 
    name: 'Truck 2', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
  { 
    id: 't3', 
    name: 'Truck 3', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
];

export const INITIAL_FLEET_S4: Transport[] = INITIAL_FLEET_S1;

export const INITIAL_FLEET_S5: Transport[] = INITIAL_FLEET_S2;

export const INITIAL_LOCATIONS_S6: Location[] = [
  { id: 'supplier_1', name: 'Raw Supplier', type: 'supplier', x: 8, y: 15, inventory: 60, capacity: 500, production: 15, delivered: 0 },
  { id: 'factory_1', name: 'Manufacturer', type: 'factory', x: 8, y: 55, inventory: 0, rawInventory: 20, capacity: 500, production: 12, delivered: 0 },
  { id: 'dc_1', name: 'Distribution Center 1', type: 'warehouse', x: 45, y: 30, inventory: 0, capacity: 500, delivered: 0 },
  { id: 'dc_2', name: 'Distribution Center 2', type: 'warehouse', x: 45, y: 70, inventory: 0, capacity: 500, delivered: 0 },
  { id: 'retail_1_1', name: 'Store 1-1 (North)', type: 'store', x: 78, y: 12, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
  { id: 'retail_1_2', name: 'Store 1-2 (Central)', type: 'store', x: 90, y: 27, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
  { id: 'retail_1_3', name: 'Store 1-3 (South)', type: 'store', x: 78, y: 42, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
  { id: 'retail_2_1', name: 'Store 2-1 (North)', type: 'store', x: 90, y: 58, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
  { id: 'retail_2_2', name: 'Store 2-2 (Central)', type: 'store', x: 78, y: 73, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
  { id: 'retail_2_3', name: 'Store 2-3 (South)', type: 'store', x: 90, y: 88, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
];

export const INITIAL_FLEET_S6: Transport[] = [
  { 
    id: 't1', 
    name: 'Truck 1', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 8, y: 55 }, 
    cargo: 0,
    pendingLoad: 0
  },
  { 
    id: 't2', 
    name: 'Truck 2', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 30 }, 
    cargo: 0,
    pendingLoad: 0
  },
  { 
    id: 't3', 
    name: 'Truck 3', 
    capacity: 26, 
    costPerMile: 1.5, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 70 }, 
    cargo: 0,
    pendingLoad: 0
  },
];

export const COSTS = {
  RETAIL_PRICE: 220,
  MILES_PER_UNIT: 5,
  DAILY_OWNERSHIP_COST: 75,
  PALLET_BUY_PRICE: 80,
};
