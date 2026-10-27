export const countries = [
  { id: 'fr', name: 'France' },
  { id: 'be', name: 'Belgique' },
];

export const defaultCountry = 'fr';

export const isCountry = (value: string | undefined): value is string => countries.some((country) => country.id === value);

// `/be/produit/onde` -> `/fr/produit/onde`: same page, another country's store.
export const swapCountry = (pathname: string, country: string) => pathname.replace(/^\/[^/]*/, `/${country}`);
