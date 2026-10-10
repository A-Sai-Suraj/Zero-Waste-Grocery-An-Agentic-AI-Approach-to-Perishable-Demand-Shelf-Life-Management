import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role, StoreId } from '../types';

interface AuthUser {
  name: string;
  title: string;
  avatar: string;
  email: string;
  assignedStore?: StoreId;
}

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  selectedStore: StoreId;
  setSelectedStore: (store: StoreId) => void;
  user: AuthUser;
  simulationTick: number;
  isSimulating: boolean;
  toggleSimulation: () => void;
  syncLive: () => void;
  lastSyncTime: string;
  canApproveRecommendations: boolean;
  canModifyRecommendations: boolean;
  canViewTransfers: boolean;
  canViewEvaluation: boolean;
  canViewForecasting: boolean;
}

const ROLE_USERS: Record<Role, AuthUser> = {
  ADMIN: {
    name: 'Jordan Davies',
    title: 'Lead Inventory Planner',
    avatar: 'JD',
    email: 'jordan.davies@zerowaste.ai',
    assignedStore: 'ALL',
  },
  STORE_OWNER: {
    name: 'Elena Vance',
    title: 'Store Manager (Northway)',
    avatar: 'EV',
    email: 'elena.vance@store-a.retail.com',
    assignedStore: 'STORE_A',
  },
  USER: {
    name: 'Alex Morgan',
    title: 'Store Staff / Customer View',
    avatar: 'AM',
    email: 'alex.m@zerowaste.org',
    assignedStore: 'STORE_A',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('ADMIN');
  const [selectedStore, setSelectedStoreState] = useState<StoreId>('ALL');
  const [simulationTick, setSimulationTick] = useState<number>(4289);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole === 'STORE_OWNER') {
      setSelectedStoreState('STORE_A');
    } else if (newRole === 'USER') {
      setSelectedStoreState('STORE_A');
    }
  };

  const setSelectedStore = (store: StoreId) => {
    if (role === 'STORE_OWNER' && store !== 'STORE_A') {
      // In Store Owner role, notify or limit to assigned store
      setSelectedStoreState('STORE_A');
      return;
    }
    setSelectedStoreState(store);
  };

  // Periodic simulation tick to bring live feel
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimulationTick((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSimulation = () => setIsSimulating((prev) => !prev);

  const syncLive = () => {
    setSimulationTick((prev) => prev + 3);
    const now = new Date();
    setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const user = ROLE_USERS[role];

  // RBAC Permission logic
  const canApproveRecommendations = role === 'ADMIN' || role === 'STORE_OWNER';
  const canModifyRecommendations = role === 'ADMIN' || role === 'STORE_OWNER';
  const canViewTransfers = role === 'ADMIN';
  const canViewEvaluation = role === 'ADMIN';
  const canViewForecasting = role === 'ADMIN' || role === 'STORE_OWNER';

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        selectedStore,
        setSelectedStore,
        user,
        simulationTick,
        isSimulating,
        toggleSimulation,
        syncLive,
        lastSyncTime,
        canApproveRecommendations,
        canModifyRecommendations,
        canViewTransfers,
        canViewEvaluation,
        canViewForecasting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
