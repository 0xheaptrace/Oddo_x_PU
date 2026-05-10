const { prisma } = require('../lib/prisma');

async function listDestinations(req, res, next) {
  try {
    const { q, country } = req.query;
    const where = {};
    const and = [];
    if (country && String(country).trim()) {
      and.push({ country: { contains: String(country) } });
    }
    if (q && String(q).trim()) {
      and.push({
        OR: [
          { name: { contains: String(q) } },
          { slug: { contains: String(q).toLowerCase() } },
        ],
      });
    }
    if (and.length) where.AND = and;
    const destinations = await prisma.destination.findMany({
      where,
      orderBy: [{ popularity: 'desc' }, { name: 'asc' }],
      take: 60,
    });
    res.json({ destinations });
  } catch (e) {
    next(e);
  }
}

async function saveDestination(req, res, next) {
  try {
    const { destinationId } = req.params;
    const dest = await prisma.destination.findUnique({
      where: { id: destinationId },
    });
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { savedDestinationIds: true },
    });
    let arr = [];
    try {
      const parsed = JSON.parse(user.savedDestinationIds || '[]');
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      arr = [];
    }
    const set = new Set(arr);
    set.add(destinationId);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { savedDestinationIds: JSON.stringify([...set]) },
    });
    res.json({ saved: [...set] });
  } catch (e) {
    next(e);
  }
}

async function unsaveDestination(req, res, next) {
  try {
    const { destinationId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { savedDestinationIds: true },
    });
    let list = [];
    try {
      const parsed = JSON.parse(user.savedDestinationIds || '[]');
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
    const filtered = list.filter((id) => id !== destinationId);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { savedDestinationIds: JSON.stringify(filtered) },
    });
    res.json({ saved: filtered });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listDestinations,
  saveDestination,
  unsaveDestination,
};
