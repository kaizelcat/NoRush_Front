import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext(undefined);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addToFavorites = (route) => {
    setFavorites((prev) => [...prev, route]);
  };

  const removeFromFavorites = (routeId) => {
    setFavorites((prev) => prev.filter((route) => route.id !== routeId));
  };

  const isFavorite = (routeId) => {
    return favorites.some((route) => route.id === routeId);
  };

  const updateCustomName = (routeId, customName) => {
    setFavorites((prev) =>
      prev.map((route) =>
        route.id === routeId ? { ...route, customName } : route
      )
    );
  };

  const reorderFavorites = (fromIndex, toIndex) => {
    setFavorites((prev) => {
      const newFavorites = [...prev];
      const [removed] = newFavorites.splice(fromIndex, 1);
      newFavorites.splice(toIndex, 0, removed);
      return newFavorites;
    });
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        updateCustomName,
        reorderFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
