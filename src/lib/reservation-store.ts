

import { removeUserPoints, addUserPoints } from "./points-store";
import type { Table as TableData } from './restaurants-data';
import { format } from "date-fns";
import { getRestaurants } from "./restaurants-data";

export interface Reservation {
  id: string;
  restaurantId: string;
  userId?: string | null;
  userEmail?: string | null;
  fullName: string;
  phoneNumber: string;
  numberOfPeople: number;
  date: string; // YYYY-MM-DD
  time: string;
  status: "Confirmado" | "Pendente" | "Cancelado" | "Checked-in" | "No-show";
  observations?: string;
  assignedTable?: string;
  hasCakeOrder?: boolean;
}

// Omit 'id' when creating a new reservation, as it will be generated.
export type NewReservation = Omit<Reservation, 'id'>;


const RESERVATIONS_STORAGE_KEY_PREFIX = 'reservations-';

function getStorageKey(restaurantId: string): string {
    return `${RESERVATIONS_STORAGE_KEY_PREFIX}${restaurantId}`;
}

// Initial mock data to populate the store if it's empty
const initialReservationsByRestaurant: Record<string, Reservation[]> = {
    'trattoria-del-ponte': [
        {
            id: "1",
            restaurantId: "trattoria-del-ponte",
            userEmail: "cliente.alice@example.com",
            userId: "alice-user-id",
            fullName: "Alice Johnson",
            phoneNumber: "11999991111",
            numberOfPeople: 2,
            date: "2024-08-15",
            time: "19:30",
            status: "Confirmado",
            observations: "Mesa perto da janela, por favor."
        },
        {
            id: "2",
            restaurantId: "trattoria-del-ponte",
            userEmail: "cliente.bob@example.com",
            userId: "bob-user-id",
            fullName: "Bob Williams",
            phoneNumber: "21999992222",
            numberOfPeople: 4,
            date: "2024-08-15",
            time: "20:00",
            status: "Confirmado",
            observations: "",
        },
    ],
    'cantina-nonna': [
        {
            id: "3",
            restaurantId: "cantina-nonna",
            userEmail: "cliente.charlie@example.com",
            userId: "charlie-user-id",
            fullName: "Charlie Brown",
            phoneNumber: "31999993333",
            numberOfPeople: 3,
            date: new Date().toISOString().split('T')[0], // Today's date
            time: "18:00",
            status: "Confirmado",
            observations: "Comemoração de aniversário.",
        },
    ],
    'sushi-kawa': [
         {
            id: "4",
            restaurantId: "sushi-kawa",
            userEmail: "cliente.diana@example.com",
            userId: "diana-user-id",
            fullName: "Diana Prince",
            phoneNumber: "41999994444",
            numberOfPeople: 2,
            date: new Date().toISOString().split('T')[0], // Today's date
            time: "18:30",
            status: "Pendente",
            observations: "",
        },
    ],
    'izakaya-matsu': [
        {
            id: "5",
            restaurantId: "izakaya-matsu",
            userEmail: "cliente.ethan@example.com",
            userId: "ethan-user-id",
            fullName: "Ethan Hunt",
            phoneNumber: "51999995555",
            numberOfPeople: 5,
            date: "2024-08-18",
            time: "19:30",
            status: "Confirmado",
            observations: "",
        },
    ]
};

/**
 * Retrieves all reservations for a specific restaurant from localStorage.
 */
function getReservationsForRestaurant(restaurantId: string): Reservation[] {
    if (typeof window === 'undefined') {
        return [];
    }
    const storageKey = getStorageKey(restaurantId);
    try {
        const storedReservations = window.localStorage.getItem(storageKey);
        if (storedReservations) {
            return JSON.parse(storedReservations);
        } else {
            const initialData = initialReservationsByRestaurant[restaurantId] || [];
            window.localStorage.setItem(storageKey, JSON.stringify(initialData));
            return initialData;
        }
    } catch (error) {
        console.error(`Failed to parse reservations for ${restaurantId} from localStorage`, error);
        return [];
    }
}

/**
 * Retrieves all reservations from all restaurants.
 * NOTE: This can be slow if there are many restaurants. Use with caution.
 */
export function getReservations(): Reservation[] {
    if (typeof window === 'undefined') {
        return [];
    }
    const allReservations: Reservation[] = [];
    const restaurantIds = Array.from(new Set(Object.keys(initialReservationsByRestaurant)));
    
    // Attempt to get all known restaurants to ensure we check all possible keys
    try {
        const restaurants = getRestaurants();
        restaurants.forEach(r => restaurantIds.push(r.id));
    } catch(e) {
        // This might fail if called before restaurants are available. The initial set is a fallback.
    }

    const uniqueRestaurantIds = Array.from(new Set(restaurantIds));

    for (const restaurantId of uniqueRestaurantIds) {
        allReservations.push(...getReservationsForRestaurant(restaurantId));
    }
    return allReservations;
}


function saveReservations(restaurantId: string, reservations: Reservation[]): void {
  if (typeof window === 'undefined') return;
  const storageKey = getStorageKey(restaurantId);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(reservations));
    window.dispatchEvent(new CustomEvent('reservationsChanged'));
  } catch (error) {
    console.error("Failed to save reservations to localStorage", error);
  }
}


/**
 * Adds a new reservation to the list in localStorage.
 * This function can only be used in a client-side context.
 * @param newReservation - The reservation object to add, without an ID.
 */
export function addReservation(newReservation: NewReservation): void {
  if (typeof window === 'undefined' || !newReservation.restaurantId) {
    return;
  }
  const reservations = getReservationsForRestaurant(newReservation.restaurantId);
  const reservationWithId: Reservation = {
    ...newReservation,
    id: Date.now().toString() + Math.random().toString(), // Simple unique ID
  };
  const updatedReservations = [...reservations, reservationWithId];
  saveReservations(newReservation.restaurantId, updatedReservations);
}

/**
 * Updates an existing reservation.
 * @param updatedReservation The full reservation object with updated data.
 */
export function updateReservation(updatedReservation: Reservation): void {
  const reservations = getReservationsForRestaurant(updatedReservation.restaurantId);
  const updatedReservations = reservations.map(res => 
    res.id === updatedReservation.id ? updatedReservation : res
  );
  saveReservations(updatedReservation.restaurantId, updatedReservations);
}


/**
 * Deletes a reservation from the list in localStorage.
 * This function can only be used in a client-side context.
 * @param restaurantId - The ID of the restaurant the reservation belongs to.
 * @param reservationId - The ID of the reservation to delete.
 */
export function deleteReservation(restaurantId: string, reservationId: string): void {
  if (!restaurantId) return;
  const reservations = getReservationsForRestaurant(restaurantId);
  const updatedReservations = reservations.filter(res => res.id !== reservationId);
  saveReservations(restaurantId, updatedReservations);
}

/**
 * Updates the status of a specific reservation.
 * @param reservationId The ID of the reservation to update.
 * @param newStatus The new status to set.
 */
export function updateReservationStatus(restaurantId: string, reservationId: string, newStatus: Reservation['status']): void {
  if (!restaurantId) return;
  const reservations = getReservationsForRestaurant(restaurantId);
  const updatedReservations = reservations.map(res => {
    if (res.id === reservationId) {
      const restaurantName = getRestaurants().find(r => r.id === restaurantId)?.name || 'um restaurante';
      
      // If marking as No-show, penalize the user
      if (newStatus === 'No-show' && res.status !== 'No-show' && res.userId) {
        removeUserPoints(res.userId, 1, `Não comparecimento em ${restaurantName}`);
      }
      
      // If marking as Checked-in, reward the user
      if (newStatus === 'Checked-in' && res.status !== 'Checked-in' && res.userId) {
        addUserPoints(res.userId, 5, `Check-in realizado em ${restaurantName}`);
      }

      return { ...res, status: newStatus };
    }
    return res;
  });
  saveReservations(restaurantId, updatedReservations);
}


// Helper function to parse time string (HH:mm) into minutes from midnight
const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Robust table assignment logic with time-based availability and table combination
const assignTablesToReservations = (reservations: Reservation[], tables: TableData[]) => {
    if (!tables || tables.length === 0) {
        return reservations.map(r => ({...r, assignedTable: undefined}));
    }

    const tableAvailability: Record<string, number> = {}; // key: table.id, value: time in minutes it becomes available
    tables.forEach(table => {
        tableAvailability[table.id] = 0; // All tables are available at time 0
    });

    const DINING_DURATION_MINUTES = 120; // Assume 2 hours per reservation

    const sortedReservations = [...reservations].sort((a, b) => a.time.localeCompare(b.time));
    const assignedReservationsMap = new Map<string, string>();

    for (const res of sortedReservations) {
        if (res.status !== 'Confirmado') continue;

        const reservationTime = timeToMinutes(res.time);
        let assignedTableNumbers: string | undefined = undefined;

        // 1. Try to find a single table
        const availableSingleTables = tables
            .filter(table => table.capacity >= res.numberOfPeople && tableAvailability[table.id] <= reservationTime)
            .sort((a, b) => {
                const capacityDiffA = a.capacity - res.numberOfPeople;
                const capacityDiffB = b.capacity - res.numberOfPeople;
                if (capacityDiffA !== capacityDiffB) return capacityDiffA - capacityDiffB; // Prefer tighter fit
                return a.priority - b.priority; // Then by priority
            });
        
        if (availableSingleTables.length > 0) {
            const bestTable = availableSingleTables[0];
            assignedTableNumbers = bestTable.number;
            tableAvailability[bestTable.id] = reservationTime + DINING_DURATION_MINUTES;
        } else {
            // 2. If no single table, try to find a combination of two tables
            const possibleCombinations: { tables: TableData[], totalCapacity: number, waste: number }[] = [];
            const tablesForCombination = [...tables];

            for (const table1 of tablesForCombination) {
                if (tableAvailability[table1.id] > reservationTime || !table1.combinableWith) continue;

                for (const table2Id of table1.combinableWith) {
                    const table2 = tablesForCombination.find(t => t.id === table2Id);
                    
                    if (!table2 || tableAvailability[table2.id] > reservationTime) continue;
                    
                    const totalCapacity = table1.capacity + table2.capacity;
                    if (totalCapacity >= res.numberOfPeople) {
                        possibleCombinations.push({
                            tables: [table1, table2].sort((a,b)=>parseInt(a.number) - parseInt(b.number)),
                            totalCapacity,
                            waste: totalCapacity - res.numberOfPeople,
                        });
                    }
                }
            }

            if (possibleCombinations.length > 0) {
                possibleCombinations.sort((a, b) => a.waste - b.waste);
                const bestCombination = possibleCombinations[0];
                
                assignedTableNumbers = bestCombination.tables.map(t => t.number).join(' + ');
                
                bestCombination.tables.forEach(t => {
                    tableAvailability[t.id] = reservationTime + DINING_DURATION_MINUTES;
                });
            }
        }
        
        if (assignedTableNumbers) {
            assignedReservationsMap.set(res.id, assignedTableNumbers);
        }
    }
    
    return reservations.map(res => ({
        ...res,
        assignedTable: assignedReservationsMap.get(res.id)
    }));
};

/**
 * Retrieves all reservations for a specific date and restaurant, with assigned tables.
 * @param restaurantId The ID of the restaurant.
 * @param tables The array of tables for the restaurant.
 * @param date The date to filter reservations for.
 * @returns An array of reservations with an `assignedTable` property.
 */
export function getReservationsForDate(restaurantId: string, tables: TableData[], date: Date): Reservation[] {
    const reservationsForDate = getReservationsForRestaurant(restaurantId).filter(
        r => r.date === format(date, "yyyy-MM-dd")
    );
    
    return assignTablesToReservations(reservationsForDate, tables);
}
