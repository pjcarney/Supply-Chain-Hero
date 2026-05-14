import { Location, Transport } from './types';

export const INITIAL_LOCATIONS: Location[] = [
  { id: 'factory_1', name: 'Manufacturer', type: 'factory', x: 5, y: 50, inventory: 52, capacity: 500, production: 0, delivered: 0 },
  { id: 'dc', name: 'Distribution Center', type: 'warehouse', x: 45, y: 50, inventory: 0, capacity: 1000, delivered: 0 },
  { id: 'retail_1', name: 'Retail Store 1', type: 'store', x: 85, y: 30, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
  { id: 'retail_2', name: 'Retail Store 2', type: 'store', x: 85, y: 70, inventory: 0, capacity: 200, demand: 0, delivered: 0 },
];

export const INITIAL_FLEET_S1: Transport[] = [
  { 
    id: 't1', 
    name: 'Truck 1', 
    capacity: 26, 
    costPerMile: 2, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
];

export const INITIAL_FLEET_S2: Transport[] = [
  { 
    id: 't1', 
    name: 'Truck 1', 
    capacity: 26, 
    costPerMile: 2, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
  { 
    id: 't2', 
    name: 'Truck 2', 
    capacity: 26, 
    costPerMile: 2, 
    speed: 250, 
    status: 'idle', 
    currentPos: { x: 45, y: 50 }, 
    cargo: 0,
    pendingLoad: 0
  },
];

export const INITIAL_FLEET_S3 = INITIAL_FLEET_S1;

export const COSTS = {
  RETAIL_PRICE: 200,
  MILES_PER_UNIT: 5,
  DAILY_OWNERSHIP_COST: 100,
  PALLET_BUY_PRICE: 100,
};
