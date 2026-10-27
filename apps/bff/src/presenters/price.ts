import type { MoneyDto, PriceView } from '@acme/contracts';

const formatters = new Map<string, Intl.NumberFormat>();

// Formatting (locale, currency) is a screen concern: it lives in the BFF, not in the API.
export const presentPrice = ({ amountCents, currency }: MoneyDto, locale = 'fr-FR'): PriceView => {
  const key = `${locale}:${currency}`;
  if (!formatters.has(key)) formatters.set(key, new Intl.NumberFormat(locale, { style: 'currency', currency }));

  return { amountCents, currency, formatted: formatters.get(key)!.format(amountCents / 100) };
};
