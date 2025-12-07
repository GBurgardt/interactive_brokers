export function formatMoney(value, showSign = false) {
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

export function formatPercent(value, showSign = false) {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }

  const formatted = Math.abs(value).toFixed(2);

  if (showSign && value !== 0) {
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }

  return value >= 0 ? `${formatted}%` : `-${formatted}%`;
}

export function formatQuantity(value) {
  if (value === null || value === undefined) {
    return '--';
  }

  return value.toLocaleString('en-US');
}

export function padRight(str, len) {
  str = String(str);
  while (str.length < len) {
    str += ' ';
  }
  return str;
}

export function padLeft(str, len) {
  str = String(str);
  while (str.length < len) {
    str = ' ' + str;
  }
  return str;
}
