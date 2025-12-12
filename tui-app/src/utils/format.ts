export function formatMoney(value: number | null | undefined, showSign = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$--';
  }

  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showSign && value !== 0) {
    return value >= 0 ? `+$${formatted}` : `-$${formatted}`;
  }

  return value >= 0 ? `$${formatted}` : `-$${formatted}`;
}

export function formatPercent(value: number | null | undefined, showSign = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }

  const formatted = Math.abs(value).toFixed(2);

  if (showSign && value !== 0) {
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }

  return value >= 0 ? `${formatted}%` : `-${formatted}%`;
}

export function formatQuantity(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '--';
  }

  return value.toLocaleString('en-US');
}

export function padRight(str: string, len: number): string {
  str = String(str);
  while (str.length < len) {
    str += ' ';
  }
  return str;
}

export function padLeft(str: string, len: number): string {
  str = String(str);
  while (str.length < len) {
    str = ' ' + str;
  }
  return str;
}

export function formatRelativeTime(timestamp: number | null | undefined): string {
  if (!timestamp) return '';

  const now = Date.now();
  const date = new Date(timestamp);
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'ahora';
  }

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? 'hace 1 hora' : `hace ${diffHours} horas`;
  }

  if (diffDays < 7) {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dayName = days[date.getDay()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (diffDays === 1) {
      return `ayer ${hours}:${minutes}`;
    }

    return `el ${dayName}`;
  }

  if (diffWeeks < 4) {
    return diffWeeks === 1 ? 'hace 1 semana' : `hace ${diffWeeks} semanas`;
  }

  if (diffMonths < 12) {
    return diffMonths === 1 ? 'hace 1 mes' : `hace ${diffMonths} meses`;
  }

  return diffYears === 1 ? 'hace 1 año' : `hace ${diffYears} años`;
}
