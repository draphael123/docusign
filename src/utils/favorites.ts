export interface FavoriteSettings {
  id: string;
  name: string;
  documentType: string;
  selectedSignatory: string;
  useCustomSignatory: boolean;
  customSignatoryName?: string;
  customSignatoryTitle?: string;
  customSignatoryCompany?: string;
  customSignatoryPhone?: string;
  customSignatoryEmail?: string;
  recipientName?: string;
  recipientTitle?: string;
  recipientAddress?: string;
  subject?: string;
  fontSize: number;
  lineSpacing: number;
  createdAt: string;
}

export interface LastUsedSettings {
  documentType: string;
  selectedSignatory: string;
  useCustomSignatory: boolean;
  customSignatoryName?: string;
  customSignatoryTitle?: string;
  customSignatoryCompany?: string;
  customSignatoryPhone?: string;
  customSignatoryEmail?: string;
  fontSize: number;
  lineSpacing: number;
  lastUsedAt: string;
}

export const saveLastUsedSettings = (settings: Omit<LastUsedSettings, 'lastUsedAt'>): void => {
  const lastUsed: LastUsedSettings = {
    ...settings,
    lastUsedAt: new Date().toISOString(),
  };
  localStorage.setItem('lastUsedSettings', JSON.stringify(lastUsed));
};

export const getLastUsedSettings = (): LastUsedSettings | null => {
  const saved = localStorage.getItem('lastUsedSettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

export const saveFavorite = (favorite: Omit<FavoriteSettings, 'id' | 'createdAt'>): FavoriteSettings => {
  const favorites = getFavorites();
  const newFavorite: FavoriteSettings = {
    ...favorite,
    id: `fav-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  favorites.push(newFavorite);
  localStorage.setItem('favoriteSettings', JSON.stringify(favorites));
  return newFavorite;
};

export const getFavorites = (): FavoriteSettings[] => {
  const saved = localStorage.getItem('favoriteSettings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const deleteFavorite = (id: string): void => {
  const favorites = getFavorites();
  const filtered = favorites.filter(f => f.id !== id);
  localStorage.setItem('favoriteSettings', JSON.stringify(filtered));
};

export const updateFavorite = (id: string, updates: Partial<FavoriteSettings>): void => {
  const favorites = getFavorites();
  const index = favorites.findIndex(f => f.id === id);
  if (index !== -1) {
    favorites[index] = { ...favorites[index], ...updates };
    localStorage.setItem('favoriteSettings', JSON.stringify(favorites));
  }
};

