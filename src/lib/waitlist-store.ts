

export interface WaitlistItem {
  id: string;
  restaurantId: string;
  name: string;
  phone: string;
  partySize: number;
  createdAt: string; // ISO 8601 date string
  status: "Aguardando" | "Chamado" | "Cancelado";
}

export type NewWaitlistItem = Omit<WaitlistItem, 'id' | 'createdAt'>;

const WAITLIST_STORAGE_KEY_PREFIX = 'waitlist-';

function getStorageKey(restaurantId: string): string {
    return `${WAITLIST_STORAGE_KEY_PREFIX}${restaurantId}`;
}

/**
 * Retrieves all waitlist items for a specific restaurant from localStorage.
 */
export function getWaitlistByRestaurant(restaurantId: string): WaitlistItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const storageKey = getStorageKey(restaurantId);
  try {
    const storedItems = window.localStorage.getItem(storageKey);
    return storedItems ? JSON.parse(storedItems) : [];
  } catch (error) {
    console.error(`Failed to parse waitlist for ${restaurantId} from localStorage`, error);
    return [];
  }
}

/**
 * Saves all waitlist items for a specific restaurant to localStorage.
 */
function saveWaitlistForRestaurant(restaurantId: string, items: WaitlistItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  const storageKey = getStorageKey(restaurantId);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('waitlistChanged'));
  } catch (error) {
    console.error(`Failed to save waitlist for ${restaurantId} to localStorage`, error);
  }
}

/**
 * Adds a new item to the waitlist for a specific restaurant.
 * @param newItem The waitlist item to add, without an ID or createdAt.
 */
export function addToWaitlist(newItem: NewWaitlistItem): void {
  const allItems = getWaitlistByRestaurant(newItem.restaurantId);
  const itemWithId: WaitlistItem = {
    ...newItem,
    id: Date.now().toString() + Math.random().toString(),
    createdAt: new Date().toISOString(),
  };
  const updatedItems = [...allItems, itemWithId];
  saveWaitlistForRestaurant(newItem.restaurantId, updatedItems);
}

/**
 * Updates the status of a waitlist item.
 * @param id The ID of the item to update.
 * @param status The new status.
 */
export function updateWaitlistStatus(restaurantId: string, id: string, status: WaitlistItem['status']): void {
  const allItems = getWaitlistByRestaurant(restaurantId);
  const updatedItems = allItems.map(item =>
    item.id === id ? { ...item, status } : item
  );
  saveWaitlistForRestaurant(restaurantId, updatedItems);
}

/**
 * Removes an item from the waitlist.
 * @param id The ID of the item to remove.
 */
export function removeFromWaitlist(restaurantId: string, id: string): void {
  const allItems = getWaitlistByRestaurant(restaurantId);
  const updatedItems = allItems.filter(item => item.id !== id);
  saveWaitlistForRestaurant(restaurantId, updatedItems);
}
