
'use client';

import { db } from './firebase';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Message } from './types';

const PATIENTS_COLLECTION = 'patients';
const CHAT_SUBCOLLECTION = 'chat';

// CHAT FUNCTIONS
export const getChatMessages = (patientId: string, callback: (messages: Message[]) => void): (() => void) => {
    const messagesCollection = collection(db, PATIENTS_COLLECTION, patientId, CHAT_SUBCOLLECTION);
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        callback(messages);
    });

    return unsubscribe; // Return the unsubscribe function to be called on cleanup
};

export const sendMessage = async (patientId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<void> => {
    const messagesCollection = collection(db, PATIENTS_COLLECTION, patientId, CHAT_SUBCOLLECTION);
    await addDoc(messagesCollection, {
        ...message,
        timestamp: serverTimestamp(),
    });
};
