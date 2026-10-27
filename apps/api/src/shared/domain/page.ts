export type PageRequest = { page: number; pageSize: number };

export type Page<T> = PageRequest & { items: T[]; total: number };

export const paginate = <T>(items: T[], { page, pageSize }: PageRequest): Page<T> => ({
  items: items.slice((page - 1) * pageSize, page * pageSize),
  total: items.length,
  page,
  pageSize,
});
