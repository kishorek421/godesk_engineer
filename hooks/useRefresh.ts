import { RefreshContext } from '@/context/RefreshContext';
import { useContext } from "react";

const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useRefresh must be used within an AuthProvider");
  }
  return context;
};

export default useRefresh;
