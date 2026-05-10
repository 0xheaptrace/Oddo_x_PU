const { prisma } = require('../lib/prisma');

async function assertTripOwner(tripId, userId) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true },
  });
  return trip;
}

async function listStops(req, res, next) {
  try {
    const tripId = req.params.tripId;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const stops = await prisma.stop.findMany({
      where: { tripId },
      orderBy: { sortOrder: 'asc' },
      include: { activities: { orderBy: { startTime: 'asc' } } },
    });
    res.json({ stops });
  } catch (e) {
    next(e);
  }
}

async function createStop(req, res, next) {
  try {
    const tripId = req.params.tripId;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const maxOrder = await prisma.stop.aggregate({
      where: { tripId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const stop = await prisma.stop.create({
      data: {
        tripId,
        sortOrder,
        city: req.body.city,
        country: req.body.country ?? null,
        arrivalDate: req.body.arrivalDate ? new Date(req.body.arrivalDate) : null,
        departureDate: req.body.departureDate ? new Date(req.body.departureDate) : null,
        stayNights: req.body.stayNights != null ? Number(req.body.stayNights) : null,
        hotelName: req.body.hotelName ?? null,
        hotelNotes: req.body.hotelNotes ?? null,
        transportFromPrev: req.body.transportFromPrev ?? null,
        transportNotes: req.body.transportNotes ?? null,
        lat: req.body.lat != null ? Number(req.body.lat) : null,
        lng: req.body.lng != null ? Number(req.body.lng) : null,
      },
      include: { activities: true },
    });
    res.status(201).json({ stop });
  } catch (e) {
    next(e);
  }
}

async function updateStop(req, res, next) {
  try {
    const { tripId, stopId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const existing = await prisma.stop.findFirst({
      where: { id: stopId, tripId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    const data = {};
    const fields = [
      'city', 'country', 'stayNights', 'hotelName', 'hotelNotes',
      'transportFromPrev', 'transportNotes', 'lat', 'lng',
    ];
    for (const k of fields) {
      if (req.body[k] !== undefined) {
        if (k === 'stayNights') data[k] = req.body[k] == null ? null : Number(req.body[k]);
        else if (k === 'lat' || k === 'lng') data[k] = req.body[k] == null ? null : Number(req.body[k]);
        else data[k] = req.body[k];
      }
    }
    if (req.body.arrivalDate !== undefined) {
      data.arrivalDate = req.body.arrivalDate ? new Date(req.body.arrivalDate) : null;
    }
    if (req.body.departureDate !== undefined) {
      data.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
    }
    const stop = await prisma.stop.update({
      where: { id: stopId },
      data,
      include: { activities: true },
    });
    res.json({ stop });
  } catch (e) {
    next(e);
  }
}

async function deleteStop(req, res, next) {
  try {
    const { tripId, stopId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const r = await prisma.stop.deleteMany({
      where: { id: stopId, tripId },
    });
    if (r.count === 0) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function reorderStops(req, res, next) {
  try {
    const { tripId } = req.params;
    const { orderedIds } = req.body;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds array required' });
    }
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.stop.updateMany({
          where: { id, tripId },
          data: { sortOrder: index },
        }),
      ),
    );
    const stops = await prisma.stop.findMany({
      where: { tripId },
      orderBy: { sortOrder: 'asc' },
      include: { activities: true },
    });
    res.json({ stops });
  } catch (e) {
    next(e);
  }
}

async function createActivity(req, res, next) {
  try {
    const { tripId, stopId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const stop = await prisma.stop.findFirst({ where: { id: stopId, tripId } });
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    const activity = await prisma.activity.create({
      data: {
        stopId,
        title: req.body.title,
        category: req.body.category || 'OTHER',
        status: req.body.status || 'PLANNED',
        assignedTo: req.body.assignedTo ?? null,
        description: req.body.description ?? null,
        startTime: req.body.startTime ? new Date(req.body.startTime) : null,
        endTime: req.body.endTime ? new Date(req.body.endTime) : null,
        durationMinutes: req.body.durationMinutes != null ? Number(req.body.durationMinutes) : null,
        cost: req.body.cost != null ? Number(req.body.cost) : null,
        imageUrl: req.body.imageUrl ?? null,
        address: req.body.address ?? null,
        rating: req.body.rating != null ? Number(req.body.rating) : null,
        transportMode: req.body.transportMode ?? null,
      },
    });
    res.status(201).json({ activity });
  } catch (e) {
    next(e);
  }
}

async function updateActivity(req, res, next) {
  try {
    const { tripId, stopId, activityId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const activity = await prisma.activity.findFirst({
      where: { id: activityId, stopId },
      include: { stop: true },
    });
    if (!activity || activity.stop.tripId !== tripId) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (req.body.status !== undefined) data.status = req.body.status;
    if (req.body.assignedTo !== undefined) data.assignedTo = req.body.assignedTo;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.startTime !== undefined) data.startTime = req.body.startTime ? new Date(req.body.startTime) : null;
    if (req.body.endTime !== undefined) data.endTime = req.body.endTime ? new Date(req.body.endTime) : null;
    if (req.body.durationMinutes !== undefined) data.durationMinutes = req.body.durationMinutes == null ? null : Number(req.body.durationMinutes);
    if (req.body.cost !== undefined) data.cost = req.body.cost == null ? null : Number(req.body.cost);
    if (req.body.imageUrl !== undefined) data.imageUrl = req.body.imageUrl;
    if (req.body.address !== undefined) data.address = req.body.address;
    if (req.body.rating !== undefined) data.rating = req.body.rating == null ? null : Number(req.body.rating);
    if (req.body.transportMode !== undefined) data.transportMode = req.body.transportMode;
    const updated = await prisma.activity.update({
      where: { id: activityId },
      data,
    });
    res.json({ activity: updated });
  } catch (e) {
    next(e);
  }
}

async function addStopFromDestination(req, res, next) {
  try {
    const { tripId, destinationId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const dest = await prisma.destination.findUnique({
      where: { id: destinationId },
    });
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    const maxOrder = await prisma.stop.aggregate({
      where: { tripId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const stop = await prisma.stop.create({
      data: {
        tripId,
        sortOrder,
        city: dest.name,
        country: dest.country,
        lat: dest.lat,
        lng: dest.lng,
        hotelNotes: `Ideas for ${dest.name}: explore top attractions (${dest.attractionsCount ?? 'many'} nearby).`,
      },
      include: { activities: true },
    });
    res.status(201).json({ stop });
  } catch (e) {
    next(e);
  }
}

async function addActivityFromBrowse(req, res, next) {
  try {
    const { tripId, stopId, browseActivityId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const stop = await prisma.stop.findFirst({ where: { id: stopId, tripId } });
    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }
    const browse = await prisma.browseActivity.findUnique({
      where: { id: browseActivityId },
    });
    if (!browse) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    const activity = await prisma.activity.create({
      data: {
        stopId,
        title: browse.title,
        category: browse.category,
        status: 'PLANNED',
        description: browse.description,
        durationMinutes: browse.durationMinutes,
        cost: browse.priceEstimate != null ? Number(browse.priceEstimate) : null,
        imageUrl: browse.imageUrl,
        rating: browse.rating,
      },
    });
    res.status(201).json({ activity });
  } catch (e) {
    next(e);
  }
}

async function deleteActivity(req, res, next) {
  try {
    const { tripId, stopId, activityId } = req.params;
    if (!(await assertTripOwner(tripId, req.user.id))) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const activity = await prisma.activity.findFirst({
      where: { id: activityId, stopId },
      include: { stop: true },
    });
    if (!activity || activity.stop.tripId !== tripId) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    await prisma.activity.delete({ where: { id: activityId } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listStops,
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
  createActivity,
  updateActivity,
  deleteActivity,
  addStopFromDestination,
  addActivityFromBrowse,
};
