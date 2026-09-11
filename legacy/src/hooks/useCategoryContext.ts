import { useContext } from "react";
import { CategoriesContext } from "../contexts/CategoriesContext";

export const useCategoriesContext = () => {
  const ctx = useContext(CategoriesContext);
  if (!ctx)
    throw new Error(
      "useCategoriesContext must be used within a CategoriesProvider"
    );
  return ctx;
};
