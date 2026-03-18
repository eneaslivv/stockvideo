import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export function relativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-ES').format(num);
}

export function formatPercentage(num: number): string {
  return `${Math.round(num * 100)}%`;
}

export function getMovementSign(type: string): string {
  switch (type) {
    case 'entry': return '+';
    case 'exit': return '-';
    case 'loss': return '-';
    case 'adjustment': return '±';
    default: return '';
  }
}

export function getMovementColor(type: string): string {
  switch (type) {
    case 'entry': return 'text-status-success';
    case 'exit': return 'text-status-warning';
    case 'loss': return 'text-status-error';
    case 'adjustment': return 'text-status-info';
    default: return 'text-text-secondary';
  }
}

export function getMovementBadgeClass(type: string): string {
  switch (type) {
    case 'entry': return 'badge-success';
    case 'exit': return 'badge-warning';
    case 'loss': return 'badge-error';
    case 'adjustment': return 'badge-info';
    default: return 'badge-accent';
  }
}

export function getSourceIcon(source: string): string {
  switch (source) {
    case 'audio': return 'mic';
    case 'video': return 'video';
    case 'manual': return 'keyboard';
    case 'quick': return 'zap';
    default: return 'circle';
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-status-success';
  if (confidence >= 0.5) return 'bg-status-warning';
  return 'bg-status-error';
}
