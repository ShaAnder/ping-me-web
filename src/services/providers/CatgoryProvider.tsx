import React, { useState, useEffect, ReactNode } from "react";
import { CategoriesContext } from "../../contexts/CategoriesContext";
import { CategoryInterface } from "../../@types/category";

export const CategoriesProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [categories, setCategories] = useState<CategoryInterface[]>([]);
	const [loading, setLoading] = useState(true);

	const refreshCategories = async () => {
		setCategories([
			{
				id: 1,
				name: "servers",
				description: "Your servers",
				category_icon_url: "",
			},
		]);
		setLoading(false);
	};

	useEffect(() => {
		void refreshCategories();
	}, []);

	return (
		<CategoriesContext.Provider
			value={{ categories, loading, refreshCategories }}
		>
			{children}
		</CategoriesContext.Provider>
	);
};
