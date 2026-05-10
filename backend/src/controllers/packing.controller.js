const { prisma } = require('../lib/prisma');

async function assertTripOwner(tripId, userId) {
  return prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true },
  });
}

async function listPacking(req, res, next) {
  try {
    const { tripId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const packingLists = await prisma.packingList.findMany({
      where: { tripId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    res.json({ packingLists });
  } catch (e) {
    next(e);
  }
}

async function createPackingItem(req, res, next) {
  try {
    const { tripId, listId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const list = await prisma.packingList.findFirst({
      where: { id: listId, tripId },
    });
    if (!list) {
      return res.status(404).json({ message: 'Packing list not found' });
    }
    const maxOrder = await prisma.packingItem.aggregate({
      where: { packingListId: listId },
      _max: { sortOrder: true },
    });
    const item = await prisma.packingItem.create({
      data: {
        packingListId: listId,
        category: req.body.category || 'OTHER',
        label: req.body.label || 'Item',
        packed: Boolean(req.body.packed),
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
    res.status(201).json({ item });
  } catch (e) {
    next(e);
  }
}

async function updatePackingItem(req, res, next) {
  try {
    const { tripId, listId, itemId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const item = await prisma.packingItem.findFirst({
      where: { id: itemId, packingListId: listId },
      include: { packingList: true },
    });
    if (!item || item.packingList.tripId !== tripId) {
      return res.status(404).json({ message: 'Item not found' });
    }
    const data = {};
    if (req.body.label !== undefined) data.label = req.body.label;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.packed !== undefined) data.packed = Boolean(req.body.packed);
    const updated = await prisma.packingItem.update({
      where: { id: itemId },
      data,
    });
    res.json({ item: updated });
  } catch (e) {
    next(e);
  }
}

async function deletePackingItem(req, res, next) {
  try {
    const { tripId, listId, itemId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const item = await prisma.packingItem.findFirst({
      where: { id: itemId, packingListId: listId },
      include: { packingList: true },
    });
    if (!item || item.packingList.tripId !== tripId) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await prisma.packingItem.delete({ where: { id: itemId } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function applyTemplate(req, res, next) {
  try {
    const { tripId, listId } = req.params;
    const template = req.body.template || 'weekend';
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const list = await prisma.packingList.findFirst({
      where: { id: listId, tripId },
    });
    if (!list) {
      return res.status(404).json({ message: 'Packing list not found' });
    }
    const templates = {
      weekend: [
        ['CLOTHING', 'Comfortable shoes'],
        ['CLOTHING', 'Light jacket'],
        ['DOCUMENTS', 'ID / passport'],
        ['ELECTRONICS', 'Phone charger'],
        ['TOILETRIES', 'Toothbrush'],
      ],
      business: [
        ['CLOTHING', 'Blazer'],
        ['DOCUMENTS', 'Business cards'],
        ['ELECTRONICS', 'Laptop'],
        ['TOILETRIES', 'Travel-size toiletries'],
      ],
    };
    const rows = templates[template] || templates.weekend;
    let order = (await prisma.packingItem.aggregate({
      where: { packingListId: listId },
      _max: { sortOrder: true },
    }))._max.sortOrder ?? -1;
    const created = [];
    for (const [category, label] of rows) {
      order += 1;
      created.push(
        await prisma.packingItem.create({
          data: {
            packingListId: listId,
            category,
            label,
            packed: false,
            sortOrder: order,
          },
        }),
      );
    }
    await prisma.packingList.update({
      where: { id: listId },
      data: { template },
    });
    res.status(201).json({ items: created });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listPacking,
  createPackingItem,
  updatePackingItem,
  deletePackingItem,
  applyTemplate,
};
