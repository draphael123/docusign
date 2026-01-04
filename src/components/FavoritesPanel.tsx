"use client";

import { useState, useEffect } from "react";
import { FavoriteSettings, getFavorites, deleteFavorite } from "@/utils/favorites";

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (favorite: FavoriteSettings) => void;
}

export default function FavoritesPanel({ isOpen, onClose, onLoad }: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<FavoriteSettings[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFavorites(getFavorites());
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    deleteFavorite(id);
    setFavorites(getFavorites());
  };

  const handleLoad = (favorite: FavoriteSettings) => {
    onLoad(favorite);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ⭐ Favorite Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Load your saved configurations
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Save your commonly used settings as favorites for quick access!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {favorite.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {favorite.documentType}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(favorite.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl"
                      title="Delete favorite"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div>
                      <span className="font-semibold">Signatory:</span>{" "}
                      {favorite.useCustomSignatory
                        ? favorite.customSignatoryName
                        : favorite.selectedSignatory}
                    </div>
                    {favorite.recipientName && (
                      <div>
                        <span className="font-semibold">Recipient:</span> {favorite.recipientName}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Saved: {new Date(favorite.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleLoad(favorite)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Load Settings
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

