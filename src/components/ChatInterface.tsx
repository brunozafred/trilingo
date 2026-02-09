import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Calendar, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ScheduleModal } from './ScheduleModal';
import { cn } from '@/lib/utils'; // utility for classnames

interface ChatInterfaceProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
}

export function ChatInterface({ user, onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá, ${user.name}! Sou o Tri. Como posso ajudar você hoje?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isBlocked) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // API call
      // Use environment variable for URL or default
      const url = import.meta.env.VITE_WEBHOOK_CHAT || 'http://localhost:5678/webhook-test/chat-trilingo';

      const response = await axios.post(url, {
        email: user.email,
        nome: user.name,
        message: newMessage.text,
      });

      // Handle response
      const botReply = response.data?.output || response.data?.message || response.data; // Flexible response handling

      // Check for block
      // Adjust logic: "Se a resposta contiver 'bloqueado'..."
      // I'll check if the string includes 'bloqueado' logic.
      const replyText = typeof botReply === 'string' ? botReply : JSON.stringify(botReply);

      if (replyText.toLowerCase().includes('bloqueado')) {
        setIsBlocked(true);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + 'bot',
            text: replyText,
            sender: 'bot',
            timestamp: new Date(),
          },
          {
            id: Date.now().toString() + 'sys',
            text: 'Sua conta foi temporariamente bloqueada.',
            sender: 'system',
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: replyText,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
          sender: 'system',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      setIsLoading(true);
      const url = import.meta.env.VITE_WEBHOOK_UNLOCK || 'http://localhost:5678/webhook-test/desbloqueio'; // Assuming unlock endpoint

      await axios.post(url, {
        email: user.email
      });

      setIsBlocked(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Sua conta foi desbloqueada! Você pode voltar a conversar.',
        sender: 'system',
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error("Unlock failed", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Erro ao desbloquear. Tente novamente mais tarde.',
        sender: 'system',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src="/assets/favicon.png" alt="Tri Bot" />
              <AvatarFallback>TB</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card bg-green-500" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground leading-none">Trilingo</h1>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
          Sair
        </Button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full items-end gap-2",
              msg.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender === 'bot' && (
              <Avatar className="h-8 w-8 mb-1">
                <AvatarImage src="/assets/favicon.png" />
                <AvatarFallback>T</AvatarFallback>
              </Avatar>
            )}

            {msg.sender === 'system' ? (
              <div className="w-full text-center my-4">
                <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">{msg.text}</span>
              </div>
            ) : (
              <div
                className={cn(
                  "relative px-4 py-3 text-sm shadow-sm max-w-[80%]",
                  msg.sender === 'user'
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-card border border-border text-card-foreground rounded-2xl rounded-tl-sm"
                )}
              >
                {msg.text}
                <span className="text-[10px] opacity-50 block text-right mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {msg.sender === 'user' && (
              <Avatar className="h-8 w-8 mb-1">
                <AvatarImage src="/assets/user_avatar.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && !isBlocked && (
          <div className="flex w-full items-end gap-2 justify-start">
            <Avatar className="h-8 w-8 mb-1">
              <AvatarImage src="/assets/favicon.png" />
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 h-2 items-center">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 bg-card/30 backdrop-blur border-t border-border">
        {isBlocked ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-2">
            <div className="flex items-center text-destructive gap-2 font-medium">
              <Lock className="w-4 h-4" />
              <span>Chat Bloqueado</span>
            </div>
            <p className="text-sm text-muted-foreground">Ops! Você está na lista de bloqueio.</p>
            <Button variant="default" onClick={handleUnlock} className="w-full max-w-sm gap-2">
              <Unlock className="w-4 h-4" />
              Solicitar Desbloqueio
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full h-10 w-10"
              onClick={() => setIsModalOpen(true)}
            >
              <Calendar className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              <span className="sr-only">Agendar</span>
            </Button>

            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="pr-12 rounded-full border-border bg-background focus-visible:ring-primary shadow-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-primary hover:bg-primary/10"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </div>
        )}
      </footer>

      {/* Modals */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={user.email}
      />
    </div>
  );
}
