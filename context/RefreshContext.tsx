// RefreshContext.js
import React, { createContext, useState, ReactNode } from "react";

interface RefreshContextProps {
  refreshFlag: boolean;
  setRefreshFlag: any;
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
    <RefreshContext.Provider
      value={{ refreshFlag, setRefreshFlag, triggerRefresh }}
    >
      {children}
    </RefreshContext.Provider>
  );
};
