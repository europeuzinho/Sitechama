

export interface PointTransaction {
    points: number;
    reason: string;
    date: string; // ISO 8601 date string
}

export interface UserPoints {
    userId: string;
    total: number;
    history: PointTransaction[];
}

const POINTS_STORAGE_KEY = 'userPoints';

function getAllPointsData(): Record<string, UserPoints> {
    if (typeof window === 'undefined') {
        return {};
    }
    try {
        const storedData = window.localStorage.getItem(POINTS_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : {};
    } catch (error) {
        console.error("Failed to parse points data from localStorage", error);
        return {};
    }
}

function saveAllPointsData(data: Record<string, UserPoints>): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('pointsChanged'));
    } catch (error) {
        console.error("Failed to save points data to localStorage", error);
    }
}

/**
 * Retrieves the total points for a specific user.
 * @param userId The user's unique ID.
 * @returns The total points, or 0 if not found.
 */
export function getUserPoints(userId: string): number {
    const allData = getAllPointsData();
    return allData[userId]?.total || 0;
}

/**
 * Finds a user's point data by the first 6 characters of their full ID.
 * @param shortCode The 6-character code from the user's profile.
 * @returns The UserPoints object or null if not found.
 */
export function findUserByShortCode(shortCode: string): UserPoints | null {
    if (!shortCode || shortCode.length !== 6) {
        return null;
    }
    const allData = getAllPointsData();
    for (const userId in allData) {
        if (userId.substring(0, 6).toUpperCase() === shortCode.toUpperCase()) {
            return allData[userId];
        }
    }
    return null;
}

/**
 * Adds points to a user's account.
 * @param userId The user's unique ID.
 * @param pointsToAdd The amount of points to add.
 * @param reason A description of why the points were awarded.
 */
export function addUserPoints(userId: string, pointsToAdd: number, reason: string): void {
    if (!userId) return;
    const allData = getAllPointsData();
    const userData = allData[userId] || { userId, total: 0, history: [] };

    userData.total += pointsToAdd;
    userData.history.push({
        points: pointsToAdd,
        reason,
        date: new Date().toISOString(),
    });

    allData[userId] = userData;
    saveAllPointsData(allData);
}

/**
 * Removes points from a user's account.
 * @param userId The user's unique ID.
 * @param pointsToRemove The amount of points to remove.
 * @param reason A description of why the points were removed.
 */
export function removeUserPoints(userId: string, pointsToRemove: number, reason: string): void {
    if (!userId) return;
    const allData = getAllPointsData();
    const userData = allData[userId];

    if (!userData || userData.total < pointsToRemove) {
        console.warn("Attempted to remove more points than available.");
        return; // Or handle as an error
    }

    userData.total -= pointsToRemove;
    userData.history.push({
        points: -pointsToRemove,
        reason,
        date: new Date().toISOString(),
    });

    allData[userId] = userData;
    saveAllPointsData(allData);
}


/**
 * Retrieves the point transaction history for a user.
 * @param userId The user's unique ID.
 * @returns An array of point transactions.
 */
export function getPointHistory(userId: string): PointTransaction[] {
    const allData = getAllPointsData();
    return allData[userId]?.history || [];
}
