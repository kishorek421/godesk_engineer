import { LocationContext } from "@/context/LocationContext";
import { useContext } from "react";

const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within an LocationProvider");
  }
  return context;
};

export default useLocation;
