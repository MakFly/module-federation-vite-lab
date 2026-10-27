import { useParams } from 'react-router';

// The host mounts the catalog's routes under a `:country` route (see CreateCatalogRoutes).
export function useCountry() {
  const { country } = useParams();
  if (!country) throw new Error('catalog routes must be mounted under a :country route');
  return country;
}

export const countryName: Record<string, string> = { fr: 'en France', be: 'en Belgique' };

export const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`;
