// RefreshContext.js
import React, { createContext, useState, useContext, ReactNode } from "react";

interface RefreshContextProps {
  refreshFlag: boolean;
  triggerRefresh: () => void;
}

export const RefreshContext = createContext<RefreshContextProps | undefined>(
  undefined,
);

interface RefreshProviderProps {
  children?: ReactNode;
}

export const RefreshProvider = ({ children }: RefreshProviderProps) => {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const triggerRefresh = () => setRefreshFlag((prev) => !prev);

  return (
    <RefreshContext.Provider value={{ refreshFlag, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};
