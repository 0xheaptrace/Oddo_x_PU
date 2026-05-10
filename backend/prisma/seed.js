/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo12345!', 12);
  const adminHash = await bcrypt.hash('Admin12345!', 12);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@traveloop.com' },
    update: {},
    create: {
      email: 'demo@traveloop.com',
      passwordHash,
      name: 'Alex Traveler',
      language: 'en',
      preferences: JSON.stringify({ notifications: true, currency: 'INR' }),
      savedDestinationIds: '[]',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: {},
    create: {
      email: 'admin@traveloop.com',
      passwordHash: adminHash,
      name: 'Traveloop Admin',
      role: 'ADMIN',
    },
  });

  const cities = [
    // India (prioritized)
    {
      name: 'Mumbai',
      country: 'India',
      slug: 'mumbai-in',
      popularity: 100,
      avgCostPerDay: 5500,
      attractionsCount: 75,
      lat: 19.076,
      lng: 72.8777,
      weatherSummary: 'Coastal city · sunsets · iconic skyline',
      imageUrl: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&q=80',
    },
    {
      name: 'Jaipur',
      country: 'India',
      slug: 'jaipur-in',
      popularity: 99,
      avgCostPerDay: 3500,
      attractionsCount: 60,
      lat: 26.9124,
      lng: 75.7873,
      weatherSummary: 'Sunny · heritage lanes · warm evenings',
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
    },
    {
      name: 'Goa',
      country: 'India',
      slug: 'goa-in',
      popularity: 97,
      avgCostPerDay: 4500,
      attractionsCount: 52,
      lat: 15.2993,
      lng: 74.124,
      weatherSummary: 'Beach breeze · sunsets · café culture',
      imageUrl: 'https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=800&q=80',
    },
    {
      name: 'Udaipur',
      country: 'India',
      slug: 'udaipur-in',
      popularity: 96,
      avgCostPerDay: 3800,
      attractionsCount: 44,
      lat: 24.5854,
      lng: 73.7125,
      weatherSummary: 'Lakeside calm · palaces · golden hour',
      imageUrl: 'https://images.unsplash.com/photo-1625225230517-7426c1be750c?w=800&q=80',
    },
    {
      name: 'Srinagar (Kashmir)',
      country: 'India',
      slug: 'srinagar-kashmir-in',
      popularity: 98,
      avgCostPerDay: 4800,
      attractionsCount: 48,
      lat: 34.0837,
      lng: 74.7973,
      weatherSummary: 'Lakes · gardens · mountain air',
      imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80',
    },
    {
      name: 'Leh (Ladakh)',
      country: 'India',
      slug: 'leh-ladakh-in',
      popularity: 95,
      avgCostPerDay: 5200,
      attractionsCount: 35,
      lat: 34.1526,
      lng: 77.5771,
      weatherSummary: 'High-altitude · crisp air · epic roads',
      imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    },
    {
      name: 'Kochi (Kerala)',
      country: 'India',
      slug: 'kochi-kerala-in',
      popularity: 94,
      avgCostPerDay: 3200,
      attractionsCount: 40,
      lat: 9.9312,
      lng: 76.2673,
      weatherSummary: 'Backwaters · spice routes · monsoon mood',
      imageUrl: 'https://images.unsplash.com/photo-1601876812430-3c1c64e1242d?w=800&q=80',
    },
    {
      name: 'Alleppey (Kerala)',
      country: 'India',
      slug: 'alleppey-kerala-in',
      popularity: 93,
      avgCostPerDay: 3600,
      attractionsCount: 34,
      lat: 9.4981,
      lng: 76.3388,
      weatherSummary: 'Backwaters · houseboats · slow travel',
      imageUrl: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&q=80',
    },
    {
      name: 'Munnar (Kerala)',
      country: 'India',
      slug: 'munnar-kerala-in',
      popularity: 92,
      avgCostPerDay: 3300,
      attractionsCount: 30,
      lat: 10.0889,
      lng: 77.0595,
      weatherSummary: 'Tea hills · cool mornings · viewpoints',
      imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80',
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      slug: 'kyoto-jp',
      popularity: 96,
      avgCostPerDay: 120,
      attractionsCount: 42,
      lat: 35.0116,
      lng: 135.7681,
      weatherSummary: 'Mild spring · light rain possible',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    },
    {
      name: 'Lisbon',
      country: 'Portugal',
      slug: 'lisbon-pt',
      popularity: 92,
      avgCostPerDay: 95,
      attractionsCount: 38,
      lat: 38.7223,
      lng: -9.1393,
      weatherSummary: 'Sunny coastal breeze',
      imageUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80',
    },
    {
      name: 'Reykjavik',
      country: 'Iceland',
      slug: 'reykjavik-is',
      popularity: 88,
      avgCostPerDay: 180,
      attractionsCount: 28,
      lat: 64.1466,
      lng: -21.9426,
      weatherSummary: 'Cool · extended daylight season',
      imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80',
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      slug: 'barcelona-es',
      popularity: 94,
      avgCostPerDay: 110,
      attractionsCount: 55,
      lat: 41.3851,
      lng: 2.1734,
      weatherSummary: 'Warm Mediterranean evenings',
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    },
    {
      name: 'Vancouver',
      country: 'Canada',
      slug: 'vancouver-ca',
      popularity: 89,
      avgCostPerDay: 140,
      attractionsCount: 33,
      lat: 49.2827,
      lng: -123.1207,
      weatherSummary: 'Crisp air · mountain views',
      imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&q=80',
    },
    {
      name: 'Cape Town',
      country: 'South Africa',
      slug: 'cape-town-za',
      popularity: 91,
      avgCostPerDay: 85,
      attractionsCount: 47,
      lat: -33.9249,
      lng: 18.4241,
      weatherSummary: 'Ocean breeze · Table Mountain clarity',
      imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
    },
  ];

  for (const c of cities) {
    await prisma.destination.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  await prisma.browseActivity.deleteMany({});
  await prisma.browseActivity.createMany({
    data: [
      {
        title: 'Old city sunrise walk',
        category: 'CULTURE',
        city: 'Jaipur',
        country: 'India',
        description: 'Hawa Mahal lanes, chai stop, and quiet photo moments before the crowds.',
        durationMinutes: 150,
        priceEstimate: 600,
        rating: 4.85,
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80',
      },
      {
        title: 'Goa sunset beach hop',
        category: 'NATURE',
        city: 'Goa',
        country: 'India',
        description: 'Golden hour at the shoreline with a relaxed café finish.',
        durationMinutes: 180,
        priceEstimate: 1200,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=600&q=80',
      },
      {
        title: 'Ladakh stargazing night',
        category: 'ADVENTURE',
        city: 'Leh (Ladakh)',
        country: 'India',
        description: 'Clear skies, warm layers, and guided constellations in thin air.',
        durationMinutes: 120,
        priceEstimate: 900,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
      },
      {
        title: 'Sunrise temple walk',
        category: 'CULTURE',
        city: 'Kyoto',
        country: 'Japan',
        description: 'Quiet golden-hour stroll through historic lanes.',
        durationMinutes: 120,
        priceEstimate: 15,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
      },
      {
        title: 'Chef-led tasting menu',
        category: 'FOOD',
        city: 'Lisbon',
        country: 'Portugal',
        description: 'Atlantic seafood paired with regional wines.',
        durationMinutes: 180,
        priceEstimate: 95,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
      },
      {
        title: 'Glacier lagoon expedition',
        category: 'NATURE',
        city: 'Reykjavik',
        country: 'Iceland',
        description: 'Superjeep ride with geological storytelling.',
        durationMinutes: 480,
        priceEstimate: 220,
        rating: 4.95,
        imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80',
      },
      {
        title: 'Rooftop sunset session',
        category: 'NIGHTLIFE',
        city: 'Barcelona',
        country: 'Spain',
        description: 'Craft cocktails overlooking the Gothic Quarter.',
        durationMinutes: 150,
        priceEstimate: 45,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80',
      },
      {
        title: 'Coastal cycling loop',
        category: 'ADVENTURE',
        city: 'Vancouver',
        country: 'Canada',
        description: 'Seawall ride with forest and skyline vistas.',
        durationMinutes: 210,
        priceEstimate: 35,
        rating: 4.85,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
      },
      {
        title: 'Design district shopping stroll',
        category: 'SHOPPING',
        city: 'Cape Town',
        country: 'South Africa',
        description: 'Local makers, ceramics, and ocean-air cafés.',
        durationMinutes: 180,
        priceEstimate: 0,
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&q=80',
      },
    ],
  });

  await prisma.trip.deleteMany({
    where: {
      OR: [
        { userId: demo.id, name: 'Rajasthan Heritage Loop' },
        { shareSlug: 'demo-heritage-sprint' },
      ],
    },
  });

  const start = new Date();
  start.setMonth(start.getMonth() + 2);
  const end = new Date(start);
  end.setDate(end.getDate() + 9);

  const trip = await prisma.trip.create({
    data: {
      userId: demo.id,
      name: 'Rajasthan Heritage Loop',
      description: 'Fort cities, slow mornings, and lakeside evenings — with a clean timeline and cost clarity.',
      startDate: start,
      endDate: end,
      destination: 'India',
      status: 'UPCOMING',
      currency: 'INR',
      travelers: 2,
      coverImageUrl: 'https://images.unsplash.com/photo-1625225230517-7426c1be750c?w=1200&q=80',
      budgetCap: 125000,
      shareSlug: 'demo-heritage-sprint',
      shareMode: 'PUBLIC',
      sharePassword: null,
      isPublic: true,
      packingLists: {
        create: {
          name: 'Main',
          items: {
            create: [
              { category: 'DOCUMENTS', label: 'Passport', sortOrder: 0 },
              { category: 'ELECTRONICS', label: 'Universal adapter', sortOrder: 1 },
              { category: 'CLOTHING', label: 'Light layers', sortOrder: 2 },
            ],
          },
        },
      },
      budgetLines: {
        create: [
          { category: 'TRANSPORT', label: 'Trains + local cabs', amount: 18500, date: start },
          { category: 'HOTEL', label: 'Boutique stays', amount: 52000, date: start },
          { category: 'ACTIVITY', label: 'Fort tickets + guides', amount: 6200, date: start },
          { category: 'MEALS', label: 'Food estimate', amount: 14000, date: start },
        ],
      },
      notes: {
        create: [
          {
            dayDate: start,
            title: 'Arrival checklist',
            content: '- Pocket Wi‑Fi pickup\n- IC card top-up\n- ATM withdrawal limit noted',
            contactInfo: 'Hotel front desk +81 xx-xxxx-xxxx',
          },
        ],
      },
      stops: {
        create: [
          {
            sortOrder: 0,
            city: 'Jaipur',
            country: 'India',
            arrivalDate: start,
            departureDate: new Date(start.getTime() + 4 * 86400000),
            stayNights: 4,
            hotelName: 'Pink City Courtyard',
            hotelNotes: 'Ask for early check-in. Keep a shawl for evenings.',
            lat: 26.9124,
            lng: 75.7873,
            activities: {
              create: [
                {
                  title: 'Amber Fort + stepwell morning',
                  category: 'CULTURE',
                  durationMinutes: 180,
                  cost: 1200,
                  rating: 4.85,
                },
                {
                  title: 'Old city food walk',
                  category: 'FOOD',
                  durationMinutes: 150,
                  cost: 1800,
                  rating: 4.8,
                },
              ],
            },
          },
          {
            sortOrder: 1,
            city: 'Udaipur',
            country: 'India',
            arrivalDate: new Date(start.getTime() + 4 * 86400000),
            departureDate: end,
            stayNights: 5,
            hotelName: 'Lakeside Haveli Stay',
            transportFromPrev: 'Train (AC Chair) + cab',
            lat: 24.5854,
            lng: 73.7125,
            activities: {
              create: [
                {
                  title: 'City Palace + sunset boat ride',
                  category: 'CULTURE',
                  durationMinutes: 150,
                  cost: 1600,
                  rating: 4.75,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seed complete.', { demoEmail: demo.email, sampleTrip: trip.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
