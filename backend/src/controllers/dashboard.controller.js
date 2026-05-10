const { prisma } = require('../lib/prisma');

function tripDurationDays(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

async function summary(req, res, next) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        stops: true,
        budgetLines: true,
      },
    });
    const upcoming = trips.filter((t) => t.status === 'UPCOMING' || (t.startDate >= now && t.status !== 'COMPLETED'));
    const recent = trips
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
    const totalSpend = trips.reduce(
      (acc, t) => acc + t.budgetLines.reduce((s, b) => s + Number(b.amount), 0),
      0,
    );
    const destinations = await prisma.destination.findMany({
      orderBy: { popularity: 'desc' },
      take: 6,
    });
    res.json({
      stats: {
        tripCount: trips.length,
        upcomingCount: upcoming.length,
        totalBudgetTracked: totalSpend,
        citiesPlanned: trips.reduce((n, t) => n + t.stops.length, 0),
      },
      upcomingTrips: upcoming.slice(0, 4).map((t) => ({
        ...t,
        budgetLines: undefined,
        stops: undefined,
        cityCount: t.stops.length,
        durationDays: tripDurationDays(t.startDate, t.endDate),
        budgetPreview: t.budgetLines.reduce((s, b) => s + Number(b.amount), 0),
      })),
      recentTrips: recent.map((t) => ({
        ...t,
        budgetLines: undefined,
        stops: undefined,
        cityCount: t.stops.length,
        durationDays: tripDurationDays(t.startDate, t.endDate),
        budgetPreview: t.budgetLines.reduce((s, b) => s + Number(b.amount), 0),
      })),
      recommendedDestinations: destinations,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { summary };
