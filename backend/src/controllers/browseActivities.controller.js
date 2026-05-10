const { prisma } = require('../lib/prisma');

async function listBrowseActivities(req, res, next) {
  try {
    const { q, category, city, maxPrice } = req.query;
    const where = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (city && String(city).trim()) {
      where.city = { contains: String(city) };
    }
    if (maxPrice != null && maxPrice !== '') {
      where.priceEstimate = { lte: Number(maxPrice) };
    }
    if (q && String(q).trim()) {
      where.OR = [
        { title: { contains: String(q) } },
        { description: { contains: String(q) } },
      ];
    }
    const activities = await prisma.browseActivity.findMany({
      where,
      orderBy: [{ rating: 'desc' }],
      take: 80,
    });
    res.json({ activities });
  } catch (e) {
    next(e);
  }
}

module.exports = { listBrowseActivities };
