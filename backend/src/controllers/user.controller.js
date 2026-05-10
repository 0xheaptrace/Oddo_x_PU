const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');

function parseJsonField(raw, fallback) {
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function getProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      language: true,
      preferences: true,
      savedDestinationIds: true,
      createdAt: true,
    },
  });
  const savedIds = parseJsonField(user.savedDestinationIds, []);
  res.json({
    user: {
      ...user,
      preferences: parseJsonField(user.preferences, {}),
      savedDestinationIds: Array.isArray(savedIds) ? savedIds : [],
    },
  });
}

async function updateProfile(req, res, next) {
  try {
    const data = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.language !== undefined) data.language = req.body.language;
    if (req.body.preferences !== undefined) {
      data.preferences =
        typeof req.body.preferences === 'string'
          ? req.body.preferences
          : JSON.stringify(req.body.preferences ?? {});
    }
    if (req.body.avatarUrl !== undefined) data.avatarUrl = req.body.avatarUrl;
    if (req.body.password) {
      data.passwordHash = await bcrypt.hash(req.body.password, 12);
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        language: true,
        preferences: true,
        savedDestinationIds: true,
      },
    });
    const savedIds = parseJsonField(user.savedDestinationIds, []);
    res.json({
      user: {
        ...user,
        preferences: parseJsonField(user.preferences, {}),
        savedDestinationIds: Array.isArray(savedIds) ? savedIds : [],
      },
    });
  } catch (e) {
    next(e);
  }
}

async function deleteAccount(req, res, next) {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
};
