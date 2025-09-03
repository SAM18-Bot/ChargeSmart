'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { answerUserQuery } from '@/ai/flows/answer-user-queries';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await answerUserQuery({ query: input });
      const botMessage: Message = { sender: 'bot', text: response.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting answer from bot:', error);
      const errorMessage: Message = { sender: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    setMessages([{ sender: 'bot', text: 'Hello! How can I help you with your EV charging today?' }]);
  }, [isOpen]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg"
          >
            {isOpen ? <X className="h-8 w-8 text-primary-foreground" /> : <Bot className="h-8 w-8 text-primary-foreground" />}
          </Button>
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 w-full max-w-sm"
          >
            <Card className="shadow-2xl border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/10">
                <div className="flex items-center space-x-3">
                  <Bot className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl font-headline">ChargeZen Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96 w-full p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-end space-x-2',
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.sender === 'bot' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot size={20} />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'max-w-xs rounded-lg px-4 py-2',
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-end space-x-2 justify-start">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot size={20} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs rounded-lg px-4 py-2 bg-muted">
                           <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask a question..."
                      disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="bg-accent hover:bg-accent/90">
                      <Send className="h-5 w-5 text-accent-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
