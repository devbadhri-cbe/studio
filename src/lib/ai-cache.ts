
'use server';

/**
 * Retrieves a cached AI response.
 * Caching has been disabled to prevent Firestore usage.
 * @returns Null, indicating a cache miss.
 */
export async function getFromCache<T>(flowName: string, input: any): Promise<T | null> {
  // Caching is disabled. Always return null to force a fresh AI call.
  return null;
}

/**
 * Stores a new AI response.
 * Caching has been disabled to prevent Firestore usage.
 */
export async function storeInCache<T>(flowName: string, input: any, output: T): Promise<void> {
  // Caching is disabled. This function does nothing.
  return;
}
