const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../lib/prisma');
const { signToken } = require('../utils/jwt');

const registerValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().isLength({ min: 1 }),
];

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email, password, name } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, language: true },
    });
    const token = signToken({ sub: user.id });
    res.status(201).json({ user, token });
  } catch (e) {
    next(e);
  }
}

const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
];

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const safe = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      language: user.language,
    };
    const token = signToken({ sub: user.id });
    res.json({ user: safe, token });
  } catch (e) {
    next(e);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

const forgotValidators = [body('email').isEmail().normalizeEmail()];

async function forgotPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60);
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpires: expires },
      });
    }
    res.json({
      message: 'If an account exists for this email, password reset instructions have been sent.',
      ...(process.env.NODE_ENV === 'development' && user ? { devToken: token } : {}),
    });
  } catch (e) {
    next(e);
  }
}

const resetValidators = [
  body('token').isLength({ min: 10 }),
  body('password').isLength({ min: 8 }),
];

async function resetPassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
    res.json({ message: 'Password updated. You can sign in now.' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  registerValidators,
  loginValidators,
  forgotValidators,
  resetValidators,
};
