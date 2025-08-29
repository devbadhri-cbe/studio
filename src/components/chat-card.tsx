
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Send } from 'lucide-react';
import { getMessages, sendMessage, type Message } from '@/lib/chat';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ChatCard() {
  const { profile, isDoctorLoggedIn, doctorName } = useApp();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!profile.id) return;

    setIsLoading(true);
    const unsubscribe = getMessages(profile.id, (newMessages) => {
      setMessages(newMessages);
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to get messages:", error);
      toast({
        variant: 'destructive',
        title: 'Error loading chat',
        description: 'Could not load messages. Please try again later.'
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile.id, toast]);
  
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            setTimeout(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' }), 100);
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile.id) return;

    setIsSending(true);
    const senderId = isDoctorLoggedIn ? 'doctor' : profile.id;

    try {
      await sendMessage(profile.id, newMessage, senderId);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        variant: 'destructive',
        title: 'Error Sending Message',
        description: 'Your message could not be sent. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const getSenderName = (senderId: string) => {
    if (senderId === 'doctor') return doctorName;
    if (senderId === profile.id) return profile.name;
    return 'Unknown User';
  }
  
  const doctorPhotoUrl = ''; // Placeholder for doctor's photo if available

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Secure Messaging</CardTitle>
        <CardDescription>
          {isDoctorLoggedIn ? `Communicate directly with ${profile.name}.` : `Communicate directly with ${doctorName}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 -mx-6" ref={scrollAreaRef}>
          <div className="px-6 py-4 space-y-4">
             {isLoading ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading messages...
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messages.map(message => {
                    const isSender = isDoctorLoggedIn ? message.senderId === 'doctor' : message.senderId === profile.id;
                    return (
                         <div key={message.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                            {!isSender && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile.photoUrl} />
                                    <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "max-w-xs md:max-w-md rounded-lg px-4 py-2 text-sm", 
                                isSender 
                                    ? "bg-primary text-primary-foreground rounded-br-none" 
                                    : "bg-muted rounded-bl-none"
                            )}>
                                <p>{message.text}</p>
                                <p className={cn("text-xs mt-1", isSender ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                    {message.timestamp ? format(message.timestamp.toDate(), 'PP p') : 'sending...'}
                                </p>
                            </div>
                             {isSender && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={isDoctorLoggedIn ? doctorPhotoUrl : profile.photoUrl} />
                                    <AvatarFallback>{getSenderName(message.senderId)[0]}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    )
                })
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2 border-t pt-4">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending || isLoading}
          />
          <Button type="submit" disabled={isSending || isLoading}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
