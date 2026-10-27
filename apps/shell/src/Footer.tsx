import { useQuery } from '@tanstack/react-query';
import { catalogPageQuery, paths } from '@acme/bff-client';

export const countries = [
  { id: 'fr', name: 'France' },
  { id: 'be', name: 'Belgique' },
];

type Props = { tenantId: string; onCountryChange: (tenantId: string) => void; zonesShown: boolean; onToggleZones: () => void };

export function Footer({ tenantId, onCountryChange, zonesShown, onToggleZones }: Props) {
  const categories = useQuery(catalogPageQuery(tenantId)).data?.categories ?? [];

  return (
    <footer className="bg-muted text-xs leading-relaxed text-muted-foreground">
      <div className="mx-auto max-w-[980px] px-5 pt-8 pb-6">
        <p className="border-b pb-4">
          Calque est une marque fictive. Les produits, prix, stocks et caractéristiques sont inventés pour ce lab de micro-frontends.
        </p>

        <div className="grid gap-8 border-b py-6 sm:grid-cols-3">
          <div>
            <h2 className="font-semibold text-foreground">Boutique</h2>
            <ul className="mt-2 space-y-1.5">
              {categories.map((category) => (
                <li key={category.slug}><a href={paths.category(category.slug)} className="hover:text-foreground hover:underline">{category.name}</a></li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2">
            <h2 className="font-semibold text-foreground">Ce lab</h2>
            <p className="mt-2 max-w-[60ch]">
              La navigation, la recherche et le sac viennent du shell (:3000). L’accueil, les catégories et les fiches produit viennent du remote catalog (:3001). Les deux appellent le BFF (:3003), qui appelle l’API (:3002).
            </p>
            <button type="button" onClick={onToggleZones} aria-pressed={zonesShown} className="mt-3 text-link hover:underline">
              {zonesShown ? 'Masquer les micro-frontends' : 'Afficher les micro-frontends sur la page'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <p>© 2026 Calque, marque fictive.</p>
          <label className="flex items-center gap-1">
            <span className="sr-only">Pays</span>
            <select
              value={tenantId}
              onChange={(event) => onCountryChange(event.target.value)}
              className="cursor-pointer bg-transparent text-foreground/80 hover:text-foreground hover:underline"
            >
              {countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}
            </select>
          </label>
        </div>
      </div>
    </footer>
  );
}
