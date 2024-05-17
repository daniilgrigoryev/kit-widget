import { IndexableKeys, IsValidKey } from '@/types/helpers';

export const groupBy = <T, K extends IndexableKeys<T>>(list: T[], key: K): Record<IsValidKey<T[K]>, T[]> => {
  return list.reduce((rv, x) => {
    const value = x[key] as IsValidKey<T[K]>;
    rv[value] = rv[value] || [];
    rv[value].push(x);

    return rv;
  }, {} as Record<IsValidKey<T[K]>, T[]>);
};
