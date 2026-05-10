const { prisma } = require('../lib/prisma');

async function assertTripOwner(tripId, userId) {
  return prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true },
  });
}

async function listBudget(req, res, next) {
  try {
    const { tripId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const lines = await prisma.budgetLine.findMany({
      where: { tripId },
      orderBy: { date: 'asc' },
    });
    res.json({ lines });
  } catch (e) {
    next(e);
  }
}

async function createBudgetLine(req, res, next) {
  try {
    const { tripId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const line = await prisma.budgetLine.create({
      data: {
        tripId,
        category: req.body.category || 'OTHER',
        label: req.body.label || 'Item',
        amount: Number(req.body.amount ?? 0),
        date: req.body.date ? new Date(req.body.date) : null,
      },
    });
    res.status(201).json({ line });
  } catch (e) {
    next(e);
  }
}

async function updateBudgetLine(req, res, next) {
  try {
    const { tripId, lineId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const existing = await prisma.budgetLine.findFirst({
      where: { id: lineId, tripId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Budget line not found' });
    }
    const data = {};
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.label !== undefined) data.label = req.body.label;
    if (req.body.amount !== undefined) data.amount = Number(req.body.amount);
    if (req.body.date !== undefined) data.date = req.body.date ? new Date(req.body.date) : null;
    const line = await prisma.budgetLine.update({
      where: { id: lineId },
      data,
    });
    res.json({ line });
  } catch (e) {
    next(e);
  }
}

async function deleteBudgetLine(req, res, next) {
  try {
    const { tripId, lineId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const r = await prisma.budgetLine.deleteMany({
      where: { id: lineId, tripId },
    });
    if (r.count === 0) {
      return res.status(404).json({ message: 'Budget line not found' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listBudget,
  createBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
};
