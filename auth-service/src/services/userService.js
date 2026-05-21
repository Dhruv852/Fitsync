/**
 * User Service — business logic for registration, login, profiles
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStore');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const USERS_FILE = 'users.json';
const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

async function getAllUsers() {
  return readJson(USERS_FILE, []);
}

async function findByEmail(email) {
  const users = await getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

async function findById(userId) {
  const users = await getAllUsers();
  return users.find((u) => u.id === userId);
}

/**
 * Register a new user with hashed password
 */
async function register({ name, email, password, height, weight }) {
  if (!name || !email || !password) {
    const err = new Error('Name, email, and password are required');
    err.status = 400;
    throw err;
  }
  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.status = 400;
    throw err;
  }

  const existing = await findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    height: height ? Number(height) : null,
    weight: weight ? Number(weight) : null,
    createdAt: new Date().toISOString(),
    streak: 0,
    lastActiveDate: null,
  };

  const users = await getAllUsers();
  users.push(user);
  await writeJson(USERS_FILE, users);

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Login — verify password and return JWT
 */
async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/** Remove sensitive fields before sending to client */
function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function getProfile(userId) {
  const user = await findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return sanitizeUser(user);
}

async function updateProfile(userId, updates) {
  const users = await getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const allowed = ['name', 'height', 'weight'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) {
      users[index][key] = key === 'name' ? updates[key] : Number(updates[key]);
    }
  });
  users[index].updatedAt = new Date().toISOString();

  await writeJson(USERS_FILE, users);
  return sanitizeUser(users[index]);
}

/** Update daily streak when user logs activity */
async function updateStreak(userId) {
  const users = await getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const today = new Date().toISOString().split('T')[0];
  const last = users[index].lastActiveDate;

  if (last === today) {
    return users[index].streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (last === yesterdayStr) {
    users[index].streak = (users[index].streak || 0) + 1;
  } else if (last !== today) {
    users[index].streak = 1;
  }

  users[index].lastActiveDate = today;
  await writeJson(USERS_FILE, users);
  return users[index].streak;
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateStreak,
  findById,
};
