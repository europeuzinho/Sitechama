

import type { MenuItem } from './menu-data';
import { generateCodesForRestaurant } from './redemption-codes-store';
import { addSaleToSession, addCancellationToSession } from './cash-session-store';
import { getRestaurants, updateTableStatus } from './restaurants-data';

export type PaymentMethod = 'Dinheiro' | 'Crédito' | 'Débito' | 'Pix';

export interface OrderItem {
  itemId: string;
  quantity: number;
  itemStatus: 'Lançamento' | 'Pendente' | 'Pronto' | 'Entregue' | 'Cancelado';
  department: 'Cozinha' | 'Copa';
  printGroup: string;
  createdAt: string; // ISO 8601 date string, acts as a unique ID for the item instance
  cancelledBy?: string; // Name of the employee who cancelled
  cancelledAt?: string; // ISO string
}

export interface Order {
  id: string; // Will be the same as the table ID for active orders
  tableNumber: string;
  tableId: string;
  restaurantId: string;
  items: OrderItem[];
  status: "Aberto" | "Finalizado" | "Aguardando Pagamento";
  paymentMethod?: PaymentMethod;
  total?: number;
  createdAt: string; // ISO 8601 date string
  updatedAt?: string; // ISO 8601 date string
  redemptionCode?: string;
  clientCpf?: string;
  amountPaid?: number;
  serviceFeeApplied?: boolean;
}

const ORDERS_STORAGE_KEY_PREFIX = 'orders-';

function getStorageKey(restaurantId: string): string {
    return `${ORDERS_STORAGE_KEY_PREFIX}${restaurantId}`;
}

/**
 * Retrieves all orders for a specific restaurant from localStorage.
 */
function getOrdersForRestaurant(restaurantId: string): Order[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const storageKey = getStorageKey(restaurantId);
  try {
    const storedOrders = window.localStorage.getItem(storageKey);
    return storedOrders ? JSON.parse(storedOrders) : [];
  } catch (error) {
    console.error(`Failed to parse orders for ${restaurantId} from localStorage`, error);
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

/**
 * Saves all orders for a specific restaurant to localStorage.
 */
function saveOrdersForRestaurant(restaurantId: string, orders: Order[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  const storageKey = getStorageKey(restaurantId);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('ordersChanged'));
  } catch (error) {
    console.error(`Failed to save orders for ${restaurantId} to localStorage`, error);
  }
}


/**
 * Gets all active (non-finalizado) orders for a restaurant.
 * @param restaurantId The ID of the restaurant.
 * @returns An array of active orders.
 */
export function getActiveOrdersByRestaurant(restaurantId: string): Order[] {
  return getOrdersForRestaurant(restaurantId).filter(
    (order) => order.status !== "Finalizado"
  );
}


/**
 * Gets a single order by its ID, regardless of status, for a specific restaurant.
 * @param restaurantId The ID of the restaurant.
 * @param orderId The ID of the order.
 * @returns The order object or null if not found.
 */
export function getOrderById(restaurantId: string, orderId: string): Order | null {
    const order = getOrdersForRestaurant(restaurantId).find((o) => o.id === orderId);
    return order || null;
}


/**
 * Gets an active order for a specific table for a specific restaurant.
 * @param restaurantId The ID of the restaurant.
 * @param tableId The ID of the table.
 * @returns The order object or null if not found.
 */
export function getOrderByTableId(restaurantId: string, tableId: string): Order | null {
  const allOrders = getOrdersForRestaurant(restaurantId);
  const order = allOrders.find(
    (o) => o.tableId === tableId && o.status !== "Finalizado"
  );
  return order || null;
}


/**
 * Adds a new order or updates an existing one. Returns the saved order.
 * @param orderData The order object to add or update.
 */
export function addOrUpdateOrder(orderData: Order): Order {
  const allOrders = getOrdersForRestaurant(orderData.restaurantId);
  let finalOrder = { ...orderData };

  const existingOrderIndex = allOrders.findIndex(
    (o) => o.id === finalOrder.id
  );

  if (existingOrderIndex > -1) {
    finalOrder = {
      ...allOrders[existingOrderIndex],
      ...finalOrder, // Apply new data
      items: finalOrder.items, // Ensure items list is the updated one
      updatedAt: new Date().toISOString(),
    };
    allOrders[existingOrderIndex] = finalOrder;
  } else {
    allOrders.push(finalOrder);
    updateTableStatus(finalOrder.restaurantId, finalOrder.tableId, "occupied");
  }

  saveOrdersForRestaurant(orderData.restaurantId, allOrders);
  return finalOrder;
}

/**
 * Updates the status of an entire order.
 * @param restaurantId
 * @param orderId
 * @param newStatus
 */
export function updateOrderStatus(restaurantId: string, orderId: string, newStatus: Order['status']) {
    const allOrders = getOrdersForRestaurant(restaurantId);
    const updatedOrders = allOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
    );
    saveOrdersForRestaurant(restaurantId, updatedOrders);
}


/**
 * Updates the status for a batch of items. This function now works on groups of items.
 * The originalItems array contains all instances that should be updated.
 * @param itemsToUpdate Array of objects with orderId, itemId, and createdAt.
 * @param newStatus The new status to set.
 */
export function updateOrderStatusForItems(restaurantId: string, itemsToUpdate: { orderId: string, itemId: string, createdAt: string }[], newStatus: OrderItem['itemStatus']): void {
    const allOrders = getOrdersForRestaurant(restaurantId);
    const orderItemsToUpdateMap = new Map<string, Set<string>>();

    for (const item of itemsToUpdate) {
        if (!orderItemsToUpdateMap.has(item.orderId)) {
            orderItemsToUpdateMap.set(item.orderId, new Set());
        }
        orderItemsToUpdateMap.get(item.orderId)!.add(item.createdAt);
    }

    const updatedOrders = allOrders.map(order => {
        if (orderItemsToUpdateMap.has(order.id)) {
            const itemsToUpdateInThisOrder = orderItemsToUpdateMap.get(order.id)!;
            const updatedItems = order.items.map(item => {
                if (itemsToUpdateInThisOrder.has(item.createdAt)) {
                    return { ...item, itemStatus: newStatus };
                }
                return item;
            });

            return {
                ...order,
                items: updatedItems,
                updatedAt: new Date().toISOString(),
            };
        }
        return order;
    });

    saveOrdersForRestaurant(restaurantId, updatedOrders);
}


/**
 * Sets the entire order status to "Finalizado", calculates final total, and releases the associated comanda.
 * @param orderToFinalize The complete order object with the latest items from the state.
 * @param paymentMethod The method used for payment.
 * @param shouldGenerateCode Whether a redemption code should be generated.
 * @param includeServiceFee Whether to include the 10% service fee in the final total.
 * @param clientCpf The client's CPF, if provided.
 * @param amountPaid The amount paid by the client (for cash payments).
 * @returns The finalized order object or null if there was an error.
 */
export function finalizeOrder(
  orderToFinalize: Order,
  paymentMethod: PaymentMethod,
  shouldGenerateCode: boolean,
  includeServiceFee: boolean,
  clientCpf?: string,
  amountPaid?: number
): Order | null {
  const allOrders = getOrdersForRestaurant(orderToFinalize.restaurantId);
  const orderIndex = allOrders.findIndex(o => o.id === orderToFinalize.id && o.status !== "Finalizado");

  if (orderIndex === -1) {
    console.error("Order to finalize not found or already finalized.");
    return null;
  }

  let newCode: string | undefined = undefined;
  if (shouldGenerateCode && !orderToFinalize.redemptionCode) {
      const [generated] = generateCodesForRestaurant(orderToFinalize.restaurantId, 1);
      if (generated) {
          newCode = generated.code;
      }
  }

  const menuStorageKey = `menuData-${orderToFinalize.restaurantId}`;
  const menuRaw = typeof window !== 'undefined' ? window.localStorage.getItem(menuStorageKey) : '[]';
  const menu: MenuItem[] = menuRaw ? JSON.parse(menuRaw) : [];

  const { subtotal } = getSubtotalAndFee(orderToFinalize, menu);
  const finalTotal = includeServiceFee ? subtotal * 1.10 : subtotal;

  const finalOrder: Order = {
      ...orderToFinalize,
      status: "Finalizado",
      paymentMethod,
      total: finalTotal, 
      serviceFeeApplied: includeServiceFee,
      updatedAt: new Date().toISOString(),
      redemptionCode: newCode || orderToFinalize.redemptionCode,
      clientCpf: clientCpf || orderToFinalize.clientCpf,
      amountPaid: amountPaid,
  };
  
  allOrders[orderIndex] = finalOrder;

  addSaleToSession(finalOrder);
  
  // Release the table
  updateTableStatus(finalOrder.restaurantId, finalOrder.tableId, 'available');
  
  saveOrdersForRestaurant(finalOrder.restaurantId, allOrders);
  return finalOrder;
}


/**
 * Marks a specific item in an order as 'Cancelado'.
 * @param orderId The ID of the order containing the item.
 * @param createdAt The unique creation timestamp of the item instance to cancel.
 * @param employeeName The name of the employee authorizing the cancellation.
 */
export function cancelOrderItem(restaurantId: string, orderId: string, createdAt: string, employeeName: string): void {
    const allOrders = getOrdersForRestaurant(restaurantId);
    const orderIndex = allOrders.findIndex(o => o.id === orderId && o.status !== "Finalizado");

    if (orderIndex === -1) {
        console.warn(`Order with ID ${orderId} not found or is already finalized.`);
        return;
    }

    const order = allOrders[orderIndex];
    let wasCancelled = false;
    let cancelledQuantity = 0;

    order.items = order.items.map(item => {
        if (item.createdAt === createdAt && item.itemStatus !== 'Cancelado') {
            wasCancelled = true;
            cancelledQuantity = item.quantity;
            return { 
                ...item, 
                itemStatus: 'Cancelado', 
                cancelledBy: employeeName, 
                cancelledAt: new Date().toISOString()
            };
        }
        return item;
    });

    if (wasCancelled) {
        allOrders[orderIndex] = order;
        saveOrdersForRestaurant(restaurantId, allOrders);
        addCancellationToSession(order.restaurantId, cancelledQuantity);
        
        window.dispatchEvent(new CustomEvent('orderItemCancelled', { detail: { orderId } }));
    }
}


/**
 * Calculates the subtotal for an order based on its items.
 * @param order The order object.
 * @param menu The menu data to look up prices.
 * @returns The calculated subtotal.
 */
export function calculateOrderSubtotal(order: Order, menu: MenuItem[]): number {
    if (!order || !order.items) return 0;
    const itemsToSum = order.items.filter(item => item.itemStatus !== 'Cancelado');

    if (!menu || menu.length === 0) {
        return 0; // Cannot calculate without prices
    }

    return itemsToSum.reduce((sum, orderItem) => {
        const menuItem = menu.find(m => m.id === orderItem.itemId);
        if (!menuItem) return sum;
        const priceString = String(menuItem.price).replace("R$", "").replace(",", ".").trim();
        const price = parseFloat(priceString);
        if (isNaN(price)) return sum;
        return sum + (price * orderItem.quantity);
    }, 0);
}


/**
 * Gets the subtotal and service fee for an order.
 * @param order The order object.
 * @param menu The menu data.
 * @returns An object with subtotal and serviceFee.
 */
export function getSubtotalAndFee(order: Order, menu: MenuItem[]): { subtotal: number, serviceFee: number } {
    const subtotal = calculateOrderSubtotal(order, menu);
    const serviceFee = subtotal * 0.10;
    return { subtotal, serviceFee };
}
