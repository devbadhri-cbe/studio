
'use client';

import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Message } from './types';

const PATIENTS_COLLECTION = 'patients';
const CHAT_SUBCOLLECTION = 'chat';

// Send a message
export const sendMessage = async (patientId: string, text: string, senderId: string): Promise<void> => {
    if (!text.trim()) {
        throw new Error("Cannot send an empty message.");
    }
    const chatCollectionRef = collection(db, PATIENTS_COLLECTION, patientId, CHAT_SUBCOLLECTION);
    await addDoc(chatCollectionRef, {
        text,
        senderId,
        timestamp: serverTimestamp(),
    });
};

// Get real-time messages
export const getMessages = (
    patientId: string,
    callback: (messages: Message[]) => void,
    onError: (error: Error) => void
): (() => void) => {
    const chatCollectionRef = collection(db, PATIENTS_COLLECTION, patientId, CHAT_SUBCOLLECTION);
    const q = query(chatCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        callback(messages);
    }, (error) => {
        console.error("Error fetching messages: ", error);
        onError(error);
    });

    return unsubscribe; // Return the unsubscribe function to be called on cleanup
};
