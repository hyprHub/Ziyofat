import type { Category } from '../../types';

export const seedCategories: Category[] = [
  {
    id: 'cat-1',
    name: {
      uz: 'Pitsa',
      ru: 'Пицца',
      en: 'Pizza',
    },
    slug: 'pizza',
  },
  {
    id: 'cat-2',
    name: {
      uz: 'Burger',
      ru: 'Бургер',
      en: 'Burger',
    },
    slug: 'burger',
  },
  {
    id: 'cat-3',
    name: {
      uz: 'Salat',
      ru: 'Салат',
      en: 'Salad',
    },
    slug: 'salad',
  },
  {
    id: 'cat-4',
    name: {
      uz: "Sho'rva",
      ru: 'Суп',
      en: 'Soup',
    },
    slug: 'soup',
  },
  {
    id: 'cat-5',
    name: {
      uz: 'Asosiy taom',
      ru: 'Основное блюдо',
      en: 'Main Course',
    },
    slug: 'main-course',
  },
  {
    id: 'cat-6',
    name: {
      uz: 'Ichimliklar',
      ru: 'Напитки',
      en: 'Drinks',
    },
    slug: 'drinks',
  },
  {
    id: 'cat-7',
    name: {
      uz: 'Desertlar',
      ru: 'Десерты',
      en: 'Desserts',
    },
    slug: 'desserts',
  },
];
