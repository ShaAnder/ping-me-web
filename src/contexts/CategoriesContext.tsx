import { createContext } from "react";
import { CategoryInterface } from "../@types/category";

export interface CategoriesContextType {
  categories: CategoryInterface[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
}

export const CategoriesContext = createContext<
  CategoriesContextType | undefined
>(undefined);
