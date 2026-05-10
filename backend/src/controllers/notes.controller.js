const { prisma } = require('../lib/prisma');

async function assertTripOwner(tripId, userId) {
  return prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true },
  });
}

async function listNotes(req, res, next) {
  try {
    const { tripId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const notes = await prisma.tripNote.findMany({
      where: { tripId },
      orderBy: [{ dayDate: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ notes });
  } catch (e) {
    next(e);
  }
}

async function createNote(req, res, next) {
  try {
    const { tripId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const note = await prisma.tripNote.create({
      data: {
        tripId,
        dayDate: req.body.dayDate ? new Date(req.body.dayDate) : null,
        title: req.body.title ?? null,
        content: req.body.content ?? '',
        reminderAt: req.body.reminderAt ? new Date(req.body.reminderAt) : null,
        contactInfo: req.body.contactInfo ?? null,
      },
    });
    res.status(201).json({ note });
  } catch (e) {
    next(e);
  }
}

async function updateNote(req, res, next) {
  try {
    const { tripId, noteId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const existing = await prisma.tripNote.findFirst({
      where: { id: noteId, tripId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Note not found' });
    }
    const data = {};
    if (req.body.dayDate !== undefined) data.dayDate = req.body.dayDate ? new Date(req.body.dayDate) : null;
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.content !== undefined) data.content = req.body.content;
    if (req.body.reminderAt !== undefined) data.reminderAt = req.body.reminderAt ? new Date(req.body.reminderAt) : null;
    if (req.body.contactInfo !== undefined) data.contactInfo = req.body.contactInfo;
    const note = await prisma.tripNote.update({
      where: { id: noteId },
      data,
    });
    res.json({ note });
  } catch (e) {
    next(e);
  }
}

async function deleteNote(req, res, next) {
  try {
    const { tripId, noteId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const r = await prisma.tripNote.deleteMany({
      where: { id: noteId, tripId },
    });
    if (r.count === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
};
