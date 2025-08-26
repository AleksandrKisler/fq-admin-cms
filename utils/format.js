export const formatMoney = (n) =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(n ?? 0);

export const formatInt = (n) =>
    new Intl.NumberFormat('ru-RU').format(Number.isFinite(n) ? n : 0);

export const formatPercent = (n) =>
    Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

export const formatDateTime = (iso) =>
    new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(iso ? new Date(iso) : new Date());
