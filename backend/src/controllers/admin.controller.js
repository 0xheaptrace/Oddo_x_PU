const { prisma } = require('../lib/prisma');

async function analytics(req, res, next) {
  try {
    const [userCount, tripCount, noteCount] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.tripNote.count(),
    ]);
    const topTrips = await prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        destination: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    });
    const cities = await prisma.stop.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });
    const activityCats = await prisma.activity.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    res.json({
      users: userCount,
      trips: tripCount,
      notes: noteCount,
      recentTrips: topTrips,
      topCities: cities.map((c) => ({ city: c.city, count: c._count.city })),
      activityMix: activityCats.map((a) => ({ category: a.category, count: a._count.category })),
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { analytics };
