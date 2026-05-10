const CITY_GUIDES = {
  mumbai: {
    key: 'mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    attractions: [
      { title: 'Gateway of India + Colaba waterfront', category: 'CULTURE', durationMinutes: 120, cost: 0 },
      { title: 'Marine Drive sunset walk', category: 'NATURE', durationMinutes: 75, cost: 0 },
      { title: 'Siddhivinayak Temple (early morning)', category: 'CULTURE', durationMinutes: 60, cost: 0 },
      { title: 'Elephanta Caves (half-day ferry trip)', category: 'ADVENTURE', durationMinutes: 300, cost: 900 },
      { title: 'Bandra café-hop + street art', category: 'FOOD', durationMinutes: 150, cost: 1200 },
    ],
    hotels: [
      { name: 'Trident, Nariman Point', area: 'Nariman Point', priceBand: 'Premium' },
      { name: 'Taj Mahal Tower', area: 'Colaba', priceBand: 'Luxury' },
      { name: 'The St. Regis Mumbai', area: 'Lower Parel', priceBand: 'Luxury' },
      { name: 'Abode Bombay', area: 'Colaba', priceBand: 'Boutique' },
      { name: 'Fariyas Hotel', area: 'Colaba', priceBand: 'Mid-range' },
    ],
    tips: [
      'Avoid peak traffic hours; plan attractions by neighborhood.',
      'Carry cash for local snacks; UPI works widely.',
    ],
  },
  goa: {
    key: 'goa',
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    attractions: [
      { title: 'Sunset at Vagator / Chapora Fort', category: 'NATURE', durationMinutes: 120, cost: 0 },
      { title: 'Old Goa churches + heritage walk', category: 'CULTURE', durationMinutes: 180, cost: 200 },
      { title: 'Beach day at Palolem', category: 'NATURE', durationMinutes: 240, cost: 0 },
      { title: 'Dolphin boat ride (morning)', category: 'ADVENTURE', durationMinutes: 90, cost: 800 },
      { title: 'Seafood dinner in Candolim', category: 'FOOD', durationMinutes: 120, cost: 1800 },
    ],
    hotels: [
      { name: 'Taj Fort Aguada', area: 'Candolim', priceBand: 'Luxury' },
      { name: 'The Leela Goa', area: 'Mobor', priceBand: 'Luxury' },
      { name: 'W Goa', area: 'Vagator', priceBand: 'Premium' },
      { name: 'Ahilya by the Sea', area: 'Nerul', priceBand: 'Boutique' },
      { name: 'Zostel Goa', area: 'Morjim / Vagator', priceBand: 'Budget' },
    ],
    tips: ['Rent a scooter only if you are comfortable; wear a helmet.', 'Plan one north + one south day.'],
  },
  kerala: {
    key: 'kerala',
    city: 'Kerala (Kochi / Alleppey)',
    state: 'Kerala',
    country: 'India',
    attractions: [
      { title: 'Fort Kochi heritage walk + Chinese nets', category: 'CULTURE', durationMinutes: 150, cost: 0 },
      { title: 'Backwaters day cruise (Alleppey)', category: 'NATURE', durationMinutes: 240, cost: 2500 },
      { title: 'Kathakali performance (evening)', category: 'CULTURE', durationMinutes: 90, cost: 600 },
      { title: 'Spice market + café stop', category: 'FOOD', durationMinutes: 120, cost: 400 },
      { title: 'Tea hills day trip (Munnar style)', category: 'NATURE', durationMinutes: 420, cost: 1800 },
    ],
    hotels: [
      { name: 'Brunton Boatyard', area: 'Fort Kochi', priceBand: 'Premium' },
      { name: 'Taj Malabar Resort & Spa', area: 'Kochi', priceBand: 'Luxury' },
      { name: 'Forte Kochi', area: 'Fort Kochi', priceBand: 'Boutique' },
      { name: 'Houseboat stay (rated operator)', area: 'Alleppey', priceBand: 'Experience' },
      { name: 'Eighth Bastion', area: 'Fort Kochi', priceBand: 'Boutique' },
    ],
    tips: ['Keep a rain layer during monsoon months.', 'Book backwater rides earlier for better boats.'],
  },
  kashmir: {
    key: 'kashmir',
    city: 'Kashmir (Srinagar / Gulmarg)',
    state: 'Jammu & Kashmir',
    country: 'India',
    attractions: [
      { title: 'Dal Lake shikara ride (sunrise)', category: 'NATURE', durationMinutes: 90, cost: 1200 },
      { title: 'Mughal Gardens (Nishat + Shalimar)', category: 'CULTURE', durationMinutes: 180, cost: 300 },
      { title: 'Gulmarg gondola (weather permitting)', category: 'ADVENTURE', durationMinutes: 240, cost: 1800 },
      { title: 'Old Srinagar market + kahwa', category: 'FOOD', durationMinutes: 120, cost: 500 },
      { title: 'Pahalgam riverside walk', category: 'NATURE', durationMinutes: 180, cost: 0 },
    ],
    hotels: [
      { name: 'The Lalit Grand Palace', area: 'Srinagar', priceBand: 'Luxury' },
      { name: 'Vivanta Dal View', area: 'Srinagar', priceBand: 'Premium' },
      { name: 'Houseboat stay (premium category)', area: 'Dal Lake', priceBand: 'Experience' },
      { name: 'Hotel Heevan', area: 'Srinagar', priceBand: 'Mid-range' },
      { name: 'Pine Spring', area: 'Gulmarg', priceBand: 'Premium' },
    ],
    tips: ['Carry warm layers even in shoulder seasons.', 'Keep buffer days for weather changes.'],
  },
  udaipur: {
    key: 'udaipur',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    attractions: [
      { title: 'City Palace complex', category: 'CULTURE', durationMinutes: 150, cost: 600 },
      { title: 'Sunset boat ride on Lake Pichola', category: 'NATURE', durationMinutes: 90, cost: 900 },
      { title: 'Jagdish Temple + old town lanes', category: 'CULTURE', durationMinutes: 90, cost: 0 },
      { title: 'Sajjangarh (Monsoon Palace) viewpoint', category: 'NATURE', durationMinutes: 120, cost: 400 },
      { title: 'Rajasthani thali dinner', category: 'FOOD', durationMinutes: 90, cost: 1200 },
    ],
    hotels: [
      { name: 'Taj Lake Palace (iconic)', area: 'Lake Pichola', priceBand: 'Luxury' },
      { name: 'The Oberoi Udaivilas', area: 'Lake Pichola', priceBand: 'Luxury' },
      { name: 'Trident Udaipur', area: 'Lake', priceBand: 'Premium' },
      { name: 'Jagat Niwas Palace', area: 'Lal Ghat', priceBand: 'Boutique' },
      { name: 'Madri Haveli', area: 'Old city', priceBand: 'Boutique' },
    ],
    tips: ['Book lake activities at golden hour.', 'Most sights are walkable around Lal Ghat.'],
  },
}

function normalizeCityKey(input) {
  const s = String(input || '').trim().toLowerCase()
  if (!s) return null
  if (s.includes('mumbai')) return 'mumbai'
  if (s.includes('goa')) return 'goa'
  if (s.includes('kashmir') || s.includes('srinagar') || s.includes('gulmarg')) return 'kashmir'
  if (s.includes('kerala') || s.includes('kochi') || s.includes('alleppey') || s.includes('alappuzha')) return 'kerala'
  if (s.includes('udaipur')) return 'udaipur'
  return null
}

module.exports = { CITY_GUIDES, normalizeCityKey }

