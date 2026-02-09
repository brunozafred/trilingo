import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


// Note: I am creating a simple Card component inline or I should create it separately.
// For brevity, I'll use raw divs with tailwind or quickly create a Card component.
// Let's just use raw Tailwind for the container to save file writes, 
// or better, implement the Card component as it's standard.
// I'll stick to a nice div wrapper for now to save time, unless quality demands Card.
// User asked for "UI/UX limpa e minimalista". A Card is good.

interface LoginProps {
  onLogin: (user: { name: string; email: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    // Save to localStorage
    const user = { name, email };
    localStorage.setItem('trilingo_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-lg border border-border">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {/* Logo */}
          <div className="w-24 h-24 relative mb-4">
            <img
              src="/assets/logo.png"
              alt="Trilingo Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo ao Trilingo</h2>
          <p className="text-muted-foreground">Entre para começar a aprender.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Nome
            </label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full text-lg py-6">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
