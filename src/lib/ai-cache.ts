
'use server';

/**
 * A simple in-memory cache to reduce redundant AI calls during a server's lifetime.
 * This is not a persistent cache and will be cleared on server restart.
 */
const cache = new Map<string, any>();

/**
 * Creates a stable, string-based key from a flow name and its input object.
 * @param flowName The name of the AI flow.
 * @param input The input object for the flow.
 * @returns A unique string key for caching.
 */
function getCacheKey(flowName: string, input: any): string {
  try {
    // Sort object keys to ensure {a:1, b:2} and {b:2, a:1} produce the same key
    const sortedInput = Object.keys(input)
      .sort()
      .reduce((obj: { [key: string]: any }, key) => {
        obj[key] = input[key];
        return obj;
      }, {});
      
    return `${flowName}::${JSON.stringify(sortedInput)}`;
  } catch (e) {
    console.error("Failed to generate cache key:", e);
    // Fallback to a less stable key if JSON.stringify fails
    return `${flowName}::${String(input)}`;
  }
}

/**
 * Retrieves a cached AI response.
 * @returns The cached item or null if not found.
 */
export async function getFromCache<T>(flowName: string, input: any): Promise<T | null> {
  const key = getCacheKey(flowName, input);
  const cached = cache.get(key);
  if (cached) {
    console.log(`[CACHE HIT] For flow: ${flowName}`);
    return cached as T;
  }
  console.log(`[CACHE MISS] For flow: ${flowName}`);
  return null;
}

/**
 * Stores a new AI response in the in-memory cache.
 */
export async function storeInCache<T>(flowName: string, input: any, output: T): Promise<void> {
  const key = getCacheKey(flowName, input);
  cache.set(key, output);
  console.log(`[CACHE SET] For flow: ${flowName}`);
  return;
}
