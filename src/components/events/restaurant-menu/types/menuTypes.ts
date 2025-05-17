
import { MenuItem } from '../types';

export interface MenuFetcherResult {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
}
