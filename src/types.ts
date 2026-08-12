export interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'store' | 'factory' | 'supplier';
  x: number; // 0-100 relative
  y: number; // 0-100 relative
  inventory: number;
  capacity: number;
  delivered: number;
  demand?: number; // per day for stores
  production?: number; // per day for factories
  rawInventory?: number; // raw materials for assembly
}

export interface Transport {
  id: string;
  name: string;
  capacity: number;
  costPerMile: number;
  speed: number; // pixels per day
  status: 'idle' | 'enroute';
  currentPos: { x: number, y: number };
  targetId?: string;
  pendingTargetId?: string;
  cargo: number;
  pendingLoad: number;
  path?: { x: number, y: number }[];
}

export interface CashFlow {
  revenue: number;
  purchases: number;
  ownership: number;
  operating: number;
  total: number;
}

export interface KPIState {
  unmetDemand: number;
  idleTruckDays: number;
}

export interface GameState {
  cash: number;
  day: number;
  locations: Location[];
  fleet: Transport[];
  logs: string[];
  isGameOver: boolean;
  scenario: number;
  satisfaction: number; // 0-100
  pendingOrders: { amount: number, deliveryDay: number }[];
  cumulativeFlow: CashFlow;
  cashHistory: number[];
  kpis: KPIState;
}
