import type { Restaurant } from '../../types';

export const seedRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Rayhon Restaurant',
    slug: 'rayhon',
    address: "Toshkent sh., Yunusobod t., Amir Temur ko'chasi 107",
    phone: '+998712345678',
    email: 'info@rayhon.uz',
    active: true,
  },
  {
    id: 'rest-2',
    name: 'Silk Road Cafe',
    slug: 'silk-road',
    address: "Toshkent sh., Chilonzor t., Bunyodkor ko'chasi 45",
    phone: '+998712345679',
    email: 'info@silkroad.uz',
    active: true,
  },
  {
    id: 'rest-3',
    name: 'Samarkand Palace',
    slug: 'samarkand-palace',
    address: "Samarqand sh., Registon maydoni 12",
    phone: '+998662345678',
    email: 'info@samarkandpalace.uz',
    active: true,
  },
];
