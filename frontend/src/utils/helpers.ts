import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy HH:mm', { locale: fr });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'À l instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return format(d, 'dd MMM', { locale: fr });
}

export function getSentimentColor(sentiment: string | null): string {
  switch (sentiment) {
    case 'positive': return '#4caf50';
    case 'negative': return '#f44336';
    case 'neutral': return '#9e9e9e';
    default: return '#bdbdbd';
  }
}

export function getSentimentLabel(sentiment: string | null): string {
  switch (sentiment) {
    case 'positive': return 'Positif';
    case 'negative': return 'Négatif';
    case 'neutral': return 'Neutre';
    default: return 'Non analysé';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'published': return '#4caf50';
    case 'responded': return '#2196f3';
    case 'analyzed': return '#ff9800';
    case 'pending': return '#9e9e9e';
    case 'ignored': return '#757575';
    default: return '#bdbdbd';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'published': return 'Publié';
    case 'responded': return 'Répondu';
    case 'analyzed': return 'Analysé';
    case 'pending': return 'En attente';
    case 'ignored': return 'Ignoré';
    default: return status;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
