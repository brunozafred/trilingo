import { useState, useEffect } from 'react';
import { Login } from '@/components/Login';
import { ChatInterface } from '@/components/ChatInterface';

interface User {
  name: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('trilingo_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user storage', e);
        localStorage.removeItem('trilingo_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('trilingo_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
          <div className="text-muted-foreground text-sm">Carregando Trilingo...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <ChatInterface user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
