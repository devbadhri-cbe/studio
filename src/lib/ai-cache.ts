
'use server';

import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

const AI_CACHE_COLLECTION = 'ai_cache';

const db = getFirebaseDb();

/**
 * Creates a consistent, cache-safe key from a given input object.
 * It sorts keys and serializes the object to ensure the same input always produces the same key.
 */
function createCacheKey(input: any): string {
  if (typeof input !== 'object' || input === null) {
    return String(input);
  }
  const sortedKeys = Object.keys(input).sort();
  const sortedInput: { [key: string]: any } = {};
  for (const key of sortedKeys) {
    sortedInput[key] = input[key];
  }
  return JSON.stringify(sortedInput);
}


/**
 * Retrieves a cached AI response from Firestore.
 * @param flowName The name of the AI flow (e.g., 'getConditionSynopsis').
 * @param input The input object that was sent to the AI flow.
 * @returns The cached data or null if it's not in the cache.
 */
export async function getFromCache<T>(flowName: string, input: any): Promise<T | null> {
  try {
    const cacheKey = createCacheKey(input);
    const docRef = doc(db, AI_CACHE_COLLECTION, flowName, 'entries', cacheKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`[Cache HIT] for ${flowName} with key: ${cacheKey}`);
      return docSnap.data() as T;
    } else {
      console.log(`[Cache MISS] for ${flowName} with key: ${cacheKey}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting from cache for ${flowName}:`, error);
    return null; // On error, proceed as if it's a cache miss
  }
}

/**
 * Stores a new AI response in the Firestore cache.
 * @param flowName The name of the AI flow.
 * @param input The input object sent to the flow.
 * @param output The output data received from the AI.
 */
export async function storeInCache<T>(flowName: string, input: any, output: T): Promise<void> {
  try {
    const cacheKey = createCacheKey(input);
    const docRef = doc(db, AI_CACHE_COLLECTION, flowName, 'entries', cacheKey);
    await setDoc(docRef, output);
    console.log(`[Cache STORE] for ${flowName} with key: ${cacheKey}`);
  } catch (error) {
    console.error(`Error storing in cache for ${flowName}:`, error);
  }
}
