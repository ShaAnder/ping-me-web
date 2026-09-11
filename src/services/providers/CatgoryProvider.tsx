import React, { useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { BASE_URL } from "../../api/config";
import { CategoriesContext } from "../../contexts/CategoriesContext";
import { CategoryInterface } from "../../@types/category";

export const CategoriesProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [categories, setCategories] = useState<CategoryInterface[]>([]);
	const [loading, setLoading] = useState(true);

	const refreshCategories = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("access_token");
			if (!token) throw new Error("No access token");
			const res = await axios.get<CategoryInterface[]>(
				`${BASE_URL}/api/categories/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setCategories(res.data);
		} catch {
			setCategories([]);
		}
		setLoading(false);
	};

	useEffect(() => {
		refreshCategories();
	}, []);

	return (
		<CategoriesContext.Provider
			value={{ categories, loading, refreshCategories }}
		>
			{children}
		</CategoriesContext.Provider>
	);
};
