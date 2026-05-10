const { prisma } = require('../lib/prisma');
const { randomSlug } = require('../utils/slug');
const bcrypt = require('bcryptjs');

const tripInclude = {
  stops: {
    orderBy: { sortOrder: 'asc' },
    include: { activities: { orderBy: { startTime: 'asc' } } },
  },
  budgetLines: { orderBy: { date: 'asc' } },
  packingLists: {
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  },
  notes: { orderBy: { dayDate: 'asc' } },
};

function tripDurationDays(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

async function listTrips(req, res, next) {
  try {
    const { status, q } = req.query;
    const where = { userId: req.user.id };
    if (status && ['DRAFT', 'UPCOMING', 'COMPLETED'].includes(status)) {
      where.status = status;
    }
    if (q && String(q).trim()) {
      where.OR = [
        { name: { contains: String(q) } },
        { destination: { contains: String(q) } },
      ];
    }
    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        stops: { select: { id: true } },
        budgetLines: { select: { amount: true } },
      },
    });
    const mapped = trips.map((t) => ({
      ...t,
      cityCount: t.stops.length,
      durationDays: tripDurationDays(t.startDate, t.endDate),
      budgetPreview: t.budgetLines.reduce((s, b) => s + Number(b.amount), 0),
      stops: undefined,
      budgetLines: undefined,
    }));
    res.json({ trips: mapped });
  } catch (e) {
    next(e);
  }
}

async function getTrip(req, res, next) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user.id },
      include: tripInclude,
    });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ trip });
  } catch (e) {
    next(e);
  }
}

async function createTrip(req, res, next) {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      destination,
      coverImageUrl,
      status,
      budgetCap,
      currency,
      travelers,
    } = req.body;
    if (!name || !startDate || !endDate || !destination) {
      return res.status(400).json({ message: 'name, startDate, endDate, destination are required' });
    }
    const trip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        destination,
        coverImageUrl: coverImageUrl || null,
        status: status && ['DRAFT', 'UPCOMING', 'COMPLETED'].includes(status) ? status : 'DRAFT',
        budgetCap: budgetCap != null ? Number(budgetCap) : null,
        currency: currency ? String(currency).toUpperCase() : 'INR',
        travelers: travelers != null ? Math.max(1, Number(travelers)) : 1,
        packingLists: {
          create: { name: 'Main' },
        },
      },
      include: tripInclude,
    });
    res.status(201).json({ trip });
  } catch (e) {
    next(e);
  }
}

async function updateTrip(req, res, next) {
  try {
    const data = {};
    const allowed = [
      'name',
      'description',
      'startDate',
      'endDate',
      'destination',
      'coverImageUrl',
      'status',
      'isPublic',
      'budgetCap',
      'currency',
      'travelers',
      'shareMode',
    ];
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        if (k === 'startDate' || k === 'endDate') data[k] = new Date(req.body[k]);
        else if (k === 'budgetCap') data[k] = req.body[k] == null ? null : Number(req.body[k]);
        else if (k === 'travelers') data[k] = req.body[k] == null ? null : Math.max(1, Number(req.body[k]));
        else if (k === 'currency') data[k] = String(req.body[k]).toUpperCase();
        else data[k] = req.body[k];
      }
    }
    const trip = await prisma.trip.updateMany({
      where: { id: req.params.tripId, userId: req.user.id },
      data,
    });
    if (trip.count === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const full = await prisma.trip.findUnique({
      where: { id: req.params.tripId },
      include: tripInclude,
    });
    res.json({ trip: full });
  } catch (e) {
    next(e);
  }
}

async function deleteTrip(req, res, next) {
  try {
    const r = await prisma.trip.deleteMany({
      where: { id: req.params.tripId, userId: req.user.id },
    });
    if (r.count === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function duplicateTrip(req, res, next) {
  try {
    const source = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user.id },
      include: {
        stops: { orderBy: { sortOrder: 'asc' }, include: { activities: true } },
        budgetLines: true,
        packingLists: { include: { items: true } },
        notes: true,
      },
    });
    if (!source) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const newTrip = await prisma.$transaction(async (tx) => {
      const t = await tx.trip.create({
        data: {
          userId: req.user.id,
          name: `${source.name} (copy)`,
          description: source.description,
          startDate: source.startDate,
          endDate: source.endDate,
          destination: source.destination,
          coverImageUrl: source.coverImageUrl,
          status: 'DRAFT',
          currency: source.currency || 'INR',
          travelers: source.travelers || 1,
          shareSlug: null,
          shareMode: 'PRIVATE',
          sharePassword: null,
          isPublic: false,
          budgetCap: source.budgetCap,
        },
      });
      for (const s of source.stops) {
        const ns = await tx.stop.create({
          data: {
            tripId: t.id,
            sortOrder: s.sortOrder,
            city: s.city,
            country: s.country,
            arrivalDate: s.arrivalDate,
            departureDate: s.departureDate,
            stayNights: s.stayNights,
            hotelName: s.hotelName,
            hotelNotes: s.hotelNotes,
            transportFromPrev: s.transportFromPrev,
            transportNotes: s.transportNotes,
            lat: s.lat,
            lng: s.lng,
          },
        });
        for (const a of s.activities) {
          await tx.activity.create({
            data: {
              stopId: ns.id,
              title: a.title,
              category: a.category,
              description: a.description,
              startTime: a.startTime,
              endTime: a.endTime,
              durationMinutes: a.durationMinutes,
              cost: a.cost,
              imageUrl: a.imageUrl,
              address: a.address,
              rating: a.rating,
              transportMode: a.transportMode,
            },
          });
        }
      }
      for (const b of source.budgetLines) {
        await tx.budgetLine.create({
          data: {
            tripId: t.id,
            category: b.category,
            label: b.label,
            amount: b.amount,
            date: b.date,
          },
        });
      }
      for (const list of source.packingLists) {
        const nl = await tx.packingList.create({
          data: { tripId: t.id, name: list.name, template: list.template },
        });
        for (const it of list.items) {
          await tx.packingItem.create({
            data: {
              packingListId: nl.id,
              category: it.category,
              label: it.label,
              packed: false,
              sortOrder: it.sortOrder,
            },
          });
        }
      }
      for (const n of source.notes) {
        await tx.tripNote.create({
          data: {
            tripId: t.id,
            dayDate: n.dayDate,
            title: n.title,
            content: n.content,
            reminderAt: n.reminderAt,
            contactInfo: n.contactInfo,
          },
        });
      }
      return tx.trip.findUnique({
        where: { id: t.id },
        include: tripInclude,
      });
    });
    res.status(201).json({ trip: newTrip });
  } catch (e) {
    next(e);
  }
}

async function shareTrip(req, res, next) {
  try {
    const { mode, password } = req.body || {};
    const normalized = String(mode || 'PUBLIC').toUpperCase();
    const shareMode = ['PUBLIC', 'UNLISTED', 'PRIVATE'].includes(normalized) ? normalized : 'PUBLIC';
    const slug = shareMode === 'PRIVATE' ? null : randomSlug();
    const sharePassword =
      shareMode === 'UNLISTED' && password ? await bcrypt.hash(String(password), 10) : null;
    const updated = await prisma.trip.updateMany({
      where: { id: req.params.tripId, userId: req.user.id },
      data: {
        shareSlug: slug,
        shareMode,
        sharePassword,
        isPublic: shareMode === 'PUBLIC',
      },
    });
    if (updated.count === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.tripId },
      select: { id: true, shareSlug: true, isPublic: true, shareMode: true },
    });
    res.json({
      trip,
      publicUrl: trip.shareSlug ? `${process.env.CLIENT_ORIGIN || ''}/share/${trip.shareSlug}` : null,
    });
  } catch (e) {
    next(e);
  }
}

async function publicTrip(req, res, next) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { shareSlug: req.params.slug, shareMode: { in: ['PUBLIC', 'UNLISTED'] } },
      include: { user: { select: { name: true, avatarUrl: true } }, stops: { select: { city: true }, orderBy: { sortOrder: 'asc' } } },
    });
    if (!trip) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    // Limited public payload (request/approval required for full details)
    res.json({
      trip: {
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverImageUrl: trip.coverImageUrl,
        shareSlug: trip.shareSlug,
        shareMode: trip.shareMode,
        currency: trip.currency,
        travelers: trip.travelers,
        owner: trip.user,
        highlights: {
          cities: trip.stops.map((s) => s.city).slice(0, 5),
        },
      },
    });
  } catch (e) {
    next(e);
  }
}

async function publicTripDetails(req, res, next) {
  try {
    const password = req.query.password ? String(req.query.password) : req.body?.password ? String(req.body.password) : null;
    const trip = await prisma.trip.findFirst({
      where: { shareSlug: req.params.slug, shareMode: { in: ['PUBLIC', 'UNLISTED'] } },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        ...tripInclude,
      },
    });
    if (!trip) return res.status(404).json({ message: 'Itinerary not found' });

    const isOwner = trip.userId === req.user.id;
    const approved = await prisma.tripAccessRequest.findFirst({
      where: { tripId: trip.id, requesterId: req.user.id, status: 'APPROVED' },
      select: { id: true },
    });

    if (!isOwner && !approved) {
      // For UNLISTED, allow password-based unlock without approval
      if (trip.shareMode === 'UNLISTED') {
        if (!password) return res.status(401).json({ message: 'Password required' });
        const ok = trip.sharePassword ? await bcrypt.compare(password, trip.sharePassword) : false;
        if (!ok) return res.status(403).json({ message: 'Incorrect password' });
      } else {
        return res.status(403).json({ message: 'Access request required' });
      }
    }

    res.json({ trip });
  } catch (e) {
    next(e);
  }
}

async function listPublicTrips(req, res, next) {
  try {
    const trips = await prisma.trip.findMany({
      where: { shareMode: 'PUBLIC', shareSlug: { not: null } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        stops: { select: { id: true } },
      },
    });
    res.json({
      trips: trips.map((t) => ({
        id: t.id,
        name: t.name,
        destination: t.destination,
        description: t.description,
        startDate: t.startDate,
        endDate: t.endDate,
        coverImageUrl: t.coverImageUrl,
        shareSlug: t.shareSlug,
        currency: t.currency,
        travelers: t.travelers,
        cityCount: t.stops.length,
        owner: t.user,
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function requestTripAccess(req, res, next) {
  try {
    const { message } = req.body || {};
    const trip = await prisma.trip.findFirst({
      where: { shareSlug: req.params.slug, shareMode: 'PUBLIC' },
      select: { id: true, userId: true },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId === req.user.id) return res.status(400).json({ message: 'You already own this trip' });

    const reqRow = await prisma.tripAccessRequest.upsert({
      where: { tripId_requesterId: { tripId: trip.id, requesterId: req.user.id } },
      update: { status: 'PENDING', message: message ? String(message) : null },
      create: { tripId: trip.id, requesterId: req.user.id, status: 'PENDING', message: message ? String(message) : null },
    });
    res.status(201).json({ request: reqRow });
  } catch (e) {
    next(e);
  }
}

async function listTripRequests(req, res, next) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user.id },
      select: { id: true },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const requests = await prisma.tripAccessRequest.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    res.json({ requests });
  } catch (e) {
    next(e);
  }
}

async function respondTripRequest(req, res, next) {
  try {
    const { action } = req.body || {};
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.user.id },
      select: { id: true },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const status = String(action || '').toUpperCase();
    if (!['APPROVE', 'REJECT'].includes(status)) {
      return res.status(400).json({ message: 'action must be APPROVE or REJECT' });
    }

    const updated = await prisma.tripAccessRequest.update({
      where: { id: req.params.requestId },
      data: { status: status === 'APPROVE' ? 'APPROVED' : 'REJECTED' },
    });
    res.json({ request: updated });
  } catch (e) {
    next(e);
  }
}

async function copyPublicTrip(req, res, next) {
  try {
    const password = req.body?.password ? String(req.body.password) : null;
    const source = await prisma.trip.findFirst({
      where: { shareSlug: req.params.slug, shareMode: { in: ['PUBLIC', 'UNLISTED'] } },
      include: {
        stops: { orderBy: { sortOrder: 'asc' }, include: { activities: true } },
        budgetLines: true,
        packingLists: { include: { items: true } },
        notes: true,
      },
    });
    if (!source) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    if (source.shareMode === 'UNLISTED') {
      if (!password) return res.status(401).json({ message: 'Password required' });
      const ok = source.sharePassword ? await bcrypt.compare(password, source.sharePassword) : false;
      if (!ok) return res.status(403).json({ message: 'Incorrect password' });
    }
    const userId = req.user.id;
    const newTrip = await prisma.$transaction(async (tx) => {
      const t = await tx.trip.create({
        data: {
          userId,
          name: `${source.name} (saved copy)`,
          description: source.description,
          startDate: source.startDate,
          endDate: source.endDate,
          destination: source.destination,
          coverImageUrl: source.coverImageUrl,
          status: 'DRAFT',
          currency: source.currency || 'INR',
          travelers: source.travelers || 1,
          shareSlug: null,
          shareMode: 'PRIVATE',
          sharePassword: null,
          isPublic: false,
          budgetCap: source.budgetCap,
        },
      });
      for (const s of source.stops) {
        const ns = await tx.stop.create({
          data: {
            tripId: t.id,
            sortOrder: s.sortOrder,
            city: s.city,
            country: s.country,
            arrivalDate: s.arrivalDate,
            departureDate: s.departureDate,
            stayNights: s.stayNights,
            hotelName: s.hotelName,
            hotelNotes: s.hotelNotes,
            transportFromPrev: s.transportFromPrev,
            transportNotes: s.transportNotes,
            lat: s.lat,
            lng: s.lng,
          },
        });
        for (const a of s.activities) {
          await tx.activity.create({
            data: {
              stopId: ns.id,
              title: a.title,
              category: a.category,
              description: a.description,
              startTime: a.startTime,
              endTime: a.endTime,
              durationMinutes: a.durationMinutes,
              cost: a.cost,
              imageUrl: a.imageUrl,
              address: a.address,
              rating: a.rating,
              transportMode: a.transportMode,
            },
          });
        }
      }
      for (const b of source.budgetLines) {
        await tx.budgetLine.create({
          data: {
            tripId: t.id,
            category: b.category,
            label: b.label,
            amount: b.amount,
            date: b.date,
          },
        });
      }
      for (const list of source.packingLists) {
        const nl = await tx.packingList.create({
          data: { tripId: t.id, name: list.name, template: list.template },
        });
        for (const it of list.items) {
          await tx.packingItem.create({
            data: {
              packingListId: nl.id,
              category: it.category,
              label: it.label,
              packed: false,
              sortOrder: it.sortOrder,
            },
          });
        }
      }
      for (const n of source.notes) {
        await tx.tripNote.create({
          data: {
            tripId: t.id,
            dayDate: n.dayDate,
            title: n.title,
            content: n.content,
            reminderAt: n.reminderAt,
            contactInfo: n.contactInfo,
          },
        });
      }
      return tx.trip.findUnique({
        where: { id: t.id },
        include: tripInclude,
      });
    });
    res.status(201).json({ trip: newTrip });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  shareTrip,
  listPublicTrips,
  publicTrip,
  publicTripDetails,
  requestTripAccess,
  listTripRequests,
  respondTripRequest,
  copyPublicTrip,
  tripInclude,
};
