
'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/app-context';
import { getChatMessages, sendMessage } from '@/lib/firestore';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ChatInterfaceProps {
    patientId: string;
}

export function ChatInterface({ patientId }: ChatInterfaceProps) {
    const { isDoctorLoggedIn, profile } = useApp();
    const { toast } = useToast();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSending, setIsSending] = React.useState(false);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    const senderId = isDoctorLoggedIn ? 'doctor' : profile.id;

    React.useEffect(() => {
        setIsLoading(true);
        const unsubscribe = getChatMessages(patientId, (newMessages) => {
            setMessages(newMessages);
            setIsLoading(false);
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, [patientId]);

    React.useEffect(() => {
        // Auto-scroll to bottom
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !senderId) return;

        setIsSending(true);
        try {
            await sendMessage(patientId, {
                text: newMessage.trim(),
                senderId: senderId,
            });
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to send message. Please try again.',
            });
        } finally {
            setIsSending(false);
        }
    };
    
    const formatTimestamp = (timestamp: any): string => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate();
            return format(date, 'h:mm a');
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef as any}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                                    message.senderId === senderId
                                        ? 'ml-auto bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                )}
                            >
                                <p>{message.text}</p>
                                <span className={cn("text-xs self-end", message.senderId === senderId ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                    {formatTimestamp(message.timestamp)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
            <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="relative">
                    <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        className="min-h-[48px] resize-none pr-16"
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" className="absolute top-3 right-3 w-8 h-8" disabled={!newMessage.trim() || isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
