

import type { Order, PaymentMethod } from './order-store';

export interface Payout {
    id: string;
    amount: number;
    recipient: string;
    reason: string;
    timestamp: string; // ISO String
}

export interface Reinforcement {
    id: string;
    amount: number;
    reason: string;
    addedBy: string; // employee name
    timestamp: string; // ISO String
}

export interface CashSession {
    id: string; // e.g., `restaurantId-timestamp`
    restaurantId: string;
    status: 'open' | 'closed';
    openedBy: string; // employee name
    openedAt: string; // ISO string
    startAmount: number; // "fundo de troco"
    payouts: Payout[]; // Array of cash withdrawals
    reinforcements: Reinforcement[]; // Array of cash additions
    cancellations: {
        count: number;
    };
    closedBy?: string; // employee name
    closedAt?: string;
    endAmount?: number; // "valor contado"
    sales: {
        total: number;
        byMethod: {
            Dinheiro: number;
            Crédito: number;
            Débito: number;
            Pix: number;
        };
        // Store order IDs to prevent duplicate additions
        orderIds: Set<string>; 
    }
}

const SESSIONS_STORAGE_KEY = 'cash-sessions';

/**
 * Retrieves all cash sessions from localStorage.
 */
function getAllSessions(): CashSession[] {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const stored = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        // Re-hydrate the Set object
        return parsed.map((session: any) => ({
            ...session,
            payouts: session.payouts || [],
            reinforcements: session.reinforcements || [],
            cancellations: session.cancellations || { count: 0 },
            sales: {
                total: session.sales.total || 0,
                byMethod: {
                    Dinheiro: session.sales.byMethod.Dinheiro || 0,
                    Crédito: session.sales.byMethod.Crédito || session.sales.byMethod.Cartão || 0, // Migration for old "Cartão"
                    Débito: session.sales.byMethod.Débito || 0,
                    Pix: session.sales.byMethod.Pix || 0,
                },
                orderIds: new Set(session.sales.orderIds || []),
            }
        }));
    } catch (error) {
        console.error("Failed to parse cash sessions from localStorage", error);
        return [];
    }
}

/**
 * Saves all cash sessions to localStorage and dispatches an event.
 */
function saveAllSessions(sessions: CashSession[]): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        // De-hydrate the Set object for JSON serialization
        const serializableSessions = sessions.map(session => ({
            ...session,
            payouts: session.payouts || [],
            reinforcements: session.reinforcements || [],
            cancellations: session.cancellations || { count: 0 },
            sales: {
                ...session.sales,
                orderIds: Array.from(session.sales.orderIds),
            }
        }));
        window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(serializableSessions));
        window.dispatchEvent(new CustomEvent('cashSessionsChanged'));
    } catch (error) {
        console.error("Failed to save cash sessions to localStorage", error);
    }
}


/**
 * Retrieves a specific session by its ID.
 * @param sessionId The ID of the session to find.
 * @returns The CashSession or null if not found.
 */
export function getSessionById(sessionId: string): CashSession | null {
    const sessions = getAllSessions();
    return sessions.find(s => s.id === sessionId) || null;
}

/**
 * Retrieves a specific payout by its ID from any session.
 * @param payoutId The ID of the payout to find.
 * @returns The Payout object or null if not found.
 */
export function getPayoutById(payoutId: string): Payout | null {
    const sessions = getAllSessions();
    for (const session of sessions) {
        const payout = session.payouts.find(p => p.id === payoutId);
        if (payout) {
            return payout;
        }
    }
    return null;
}

/**
 * Retrieves a specific reinforcement by its ID from any session.
 * @param reinforcementId The ID of the reinforcement to find.
 * @returns The Reinforcement object or null if not found.
 */
export function getReinforcementById(reinforcementId: string): Reinforcement | null {
    const sessions = getAllSessions();
    for (const session of sessions) {
        const reinforcement = session.reinforcements.find(r => r.id === reinforcementId);
        if (reinforcement) {
            return reinforcement;
        }
    }
    return null;
}

/**
 * Finds the currently active (open) session for a restaurant.
 * @param restaurantId The ID of the restaurant.
 * @returns The active CashSession or null if none is open.
 */
export function getActiveSession(restaurantId: string): CashSession | null {
    const sessions = getAllSessions();
    return sessions.find(s => s.restaurantId === restaurantId && s.status === 'open') || null;
}

/**
 * Starts a new cash session for a restaurant.
 * @param restaurantId The ID of the restaurant.
 * @param operatorName The name of the user opening the session.
 * @param startAmount The initial cash amount in the register.
 * @returns The newly created session.
 */
export function startNewSession(restaurantId: string, operatorName: string, startAmount: number): CashSession | null {
    if (getActiveSession(restaurantId)) {
        console.error("Cannot start a new session; one is already active.");
        return null;
    }

    const newSession: CashSession = {
        id: `${restaurantId}-${Date.now()}`,
        restaurantId,
        status: 'open',
        openedBy: operatorName,
        openedAt: new Date().toISOString(),
        startAmount,
        payouts: [],
        reinforcements: [],
        cancellations: { count: 0 },
        sales: {
            total: 0,
            byMethod: { Dinheiro: 0, Crédito: 0, Débito: 0, Pix: 0 },
            orderIds: new Set(),
        },
    };

    const sessions = getAllSessions();
    sessions.push(newSession);
    saveAllSessions(sessions);
    return newSession;
}


/**
 * Adds a finalized order's sale to the current active session.
 * @param order The finalized order object.
 */
export function addSaleToSession(order: Order): void {
    const sessions = getAllSessions();
    const activeSessionIndex = sessions.findIndex(s => s.restaurantId === order.restaurantId && s.status === 'open');

    if (activeSessionIndex === -1) {
        console.warn("No active cash session to add sale to.");
        return;
    }

    const session = sessions[activeSessionIndex];

    // Prevent adding the same order sale twice
    if (session.sales.orderIds.has(order.id)) {
        console.warn(`Sale for order ${order.id} has already been added to the session.`);
        return;
    }

    const paymentMethod = order.paymentMethod;
    const saleAmount = order.total;

    if (paymentMethod && typeof saleAmount === 'number') {
        session.sales.total += saleAmount;
        session.sales.byMethod[paymentMethod] += saleAmount;
        session.sales.orderIds.add(order.id);

        sessions[activeSessionIndex] = session;
        saveAllSessions(sessions);
    }
}

/**
 * Adds a cash payout (sangria) to the active session.
 * @param restaurantId The ID of the restaurant.
 * @param payoutData The data for the payout.
 * @returns The created Payout object or null if failed.
 */
export function addPayoutToSession(restaurantId: string, payoutData: Omit<Payout, 'id' | 'timestamp'>): Payout | null {
    const sessions = getAllSessions();
    const activeSessionIndex = sessions.findIndex(s => s.restaurantId === restaurantId && s.status === 'open');

    if (activeSessionIndex === -1) {
        console.error("No active session to add a payout to.");
        return null;
    }

    const session = sessions[activeSessionIndex];
    
    const newPayout: Payout = {
        ...payoutData,
        id: `payout-${Date.now()}`,
        timestamp: new Date().toISOString(),
    };

    session.payouts.push(newPayout);
    sessions[activeSessionIndex] = session;
    saveAllSessions(sessions);
    return newPayout;
}


/**
 * Adds a cash reinforcement (suprimento) to the active session.
 * @param restaurantId The ID of the restaurant.
 * @param reinforcementData The data for the reinforcement.
 * @returns The created Reinforcement object or null if failed.
 */
export function addReinforcementToSession(restaurantId: string, reinforcementData: Omit<Reinforcement, 'id' | 'timestamp'>): Reinforcement | null {
    const sessions = getAllSessions();
    const activeSessionIndex = sessions.findIndex(s => s.restaurantId === restaurantId && s.status === 'open');

    if (activeSessionIndex === -1) {
        console.error("No active session to add a reinforcement to.");
        return null;
    }

    const session = sessions[activeSessionIndex];
    
    const newReinforcement: Reinforcement = {
        ...reinforcementData,
        id: `reinforcement-${Date.now()}`,
        timestamp: new Date().toISOString(),
    };

    session.reinforcements.push(newReinforcement);
    sessions[activeSessionIndex] = session;
    saveAllSessions(sessions);
    return newReinforcement;
}

/**
 * Increments the count of cancelled items in the active session.
 * @param restaurantId The ID of the restaurant.
 * @param quantity The number of items cancelled in this action.
 */
export function addCancellationToSession(restaurantId: string, quantity: number): void {
    const sessions = getAllSessions();
    const activeSessionIndex = sessions.findIndex(s => s.restaurantId === restaurantId && s.status === 'open');

    if (activeSessionIndex === -1) {
        console.error("No active session to add a cancellation to.");
        return;
    }

    const session = sessions[activeSessionIndex];
    session.cancellations.count += quantity;
    sessions[activeSessionIndex] = session;
    saveAllSessions(sessions);
}


/**
 * Closes the active session for a restaurant.
 * @param restaurantId The ID of the restaurant.
 * @param operatorName The name of the user closing the session.
 * @param endAmount The final counted cash amount.
 * @returns The closed session or null if no session was active.
 */
export function closeActiveSession(restaurantId: string, operatorName: string, endAmount: number): CashSession | null {
    const sessions = getAllSessions();
    const activeSessionIndex = sessions.findIndex(s => s.restaurantId === restaurantId && s.status === 'open');

    if (activeSessionIndex === -1) {
        console.error("No active session to close.");
        return null;
    }

    const session = sessions[activeSessionIndex];
    session.status = 'closed';
    session.closedBy = operatorName;
    session.closedAt = new Date().toISOString();
    session.endAmount = endAmount;

    sessions[activeSessionIndex] = session;
    saveAllSessions(sessions);
    return session;
}
