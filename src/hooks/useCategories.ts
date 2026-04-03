import { useState, useEffect, useCallback } from 'react';
import { listCategories, createCategory, deleteCategory as apiDeleteCategory } from '@/lib/api';
import type { Category } from '@/lib/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);

  const refresh = useCallback(async () => {
    try {
      const cats = await listCategories();
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCategory = useCallback(async (name: string, icon: string) => {
    const cat = await createCategory(name, icon);
    setCategories(prev => [...prev, cat]);
    return cat;
  }, []);

  const removeCategory = useCallback(async (id: number) => {
    await apiDeleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  return { categories, selectedCategoryId, setSelectedCategoryId, addCategory, removeCategory, refresh };
}
