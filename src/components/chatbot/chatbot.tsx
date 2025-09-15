'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Mic, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { answerUserQuery } from '@/ai/flows/answer-user-queries';
import { processVoiceCommand } from '@/ai/flows/voice-assistant-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export type ChatbotAction = {
    type: 'INITIATE_PAYMENT' | 'BOOK_SLOT_CONFIRMED' | 'REQUIRE_MORE_INFO' | 'NONE';
    payload?: any;
}

interface ChatbotProps {
    onAction?: (action: ChatbotAction) => void;
}

export default function Chatbot({ onAction }: ChatbotProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('en-US');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSend = async (textToSend?: string) => {
    const currentInput = textToSend || input;
    if (currentInput.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await answerUserQuery({ query: currentInput });
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
  
  const playAudio = (audioDataUri: string) => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    const audio = new Audio(audioDataUri);
    audioRef.current = audio;
    audio.play();
  };

  const handleVoiceCommand = async (command: string) => {
    const userMessage: Message = { sender: 'user', text: command };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
        const response = await processVoiceCommand({ 
            command, 
            language,
            userName: user?.name || 'User' 
        });

        const botMessage: Message = { sender: 'bot', text: response.response };
        setMessages((prev) => [...prev, botMessage]);
        
        // Let the parent component handle the action
        if (response.action && response.action.type !== 'NONE' && onAction) {
            onAction(response.action);
        }

        // Convert response to speech
        if (response.response) {
            const audioResponse = await textToSpeech({ text: response.response });
            playAudio(audioResponse.audio);
        }

    } catch (error) {
        console.error('Error processing voice command:', error);
        const errorMessage: Message = { sender: 'bot', text: 'Sorry, I had trouble understanding that. Please try again.' };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      handleVoiceCommand(command);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  const toggleRecording = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  }


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: 'bot', text: 'Hello! How can I help you with your EV charging today? You can ask me questions or use the mic to book a slot.' }]);
    }
  }, [isOpen]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg"
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
            aria-expanded={isOpen}
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
            <Card className="shadow-2xl border-2 border-primary/20 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/10">
                <div className="flex items-center space-x-3">
                  <Bot className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl font-headline">ChargeSmart Assistant</CardTitle>
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
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            'max-w-xs rounded-2xl px-4 py-2',
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted rounded-bl-none'
                          )}
                        >
                          <p className="text-sm">{message.text}</p>
                        </motion.div>
                      </div>
                    ))}
                    {(isLoading || isRecording) && (
                      <div className="flex items-end space-x-2 justify-start">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot size={20} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs rounded-2xl px-4 py-2 bg-muted rounded-bl-none">
                           <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className='flex-1'>
                             <Select onValueChange={setLanguage} value={language}>
                                <SelectTrigger className="h-9">
                                    <Languages className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en-US">English</SelectItem>
                                    <SelectItem value="hi-IN">हिन्दी (Hindi)</SelectItem>
                                    <SelectItem value="mr-IN">मराठी (Marathi)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={toggleRecording}
                            className={cn(
                                "rounded-full w-10 h-10 p-0",
                                isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary"
                            )}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        >
                           <Mic className="h-5 w-5 text-primary-foreground" />
                        </Button>
                    </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Or type a question..."
                      disabled={isLoading || isRecording}
                      className="rounded-full"
                      aria-label="Your message"
                    />
                    <Button onClick={() => handleSend()} disabled={isLoading || input.trim() === ''} className="bg-accent hover:bg-accent/90 rounded-full w-10 h-10 p-0" aria-label="Send message">
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

    