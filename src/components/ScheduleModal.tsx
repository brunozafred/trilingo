import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function ScheduleModal({ isOpen, onClose, userEmail }: ScheduleModalProps) {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!date) return;
    setLoading(true);
    setStatus('idle');
    try {
      // Use environment variable for URL
      const url = import.meta.env.VITE_WEBHOOK_SCHEDULE || 'http://localhost:5678/webhook-test/api/v1/agendamento';

      await axios.post(url, {
        email: userEmail,
        data: date
      });

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setDate('');
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Falha ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Agendar Sessão
          </DialogTitle>
          <DialogDescription>
            Escolha o melhor horário para estudar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="datetime"
              type="datetime-local"
              className="col-span-4"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {status === 'success' && (
            <p className="text-green-500 text-sm font-medium">Agendamento realizado com sucesso!</p>
          )}
          {status === 'error' && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !date}
            className="w-full sm:w-auto"
          >
            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
