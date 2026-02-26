/**
 * Auth Service
 * Business logic for registration and login
 */
const bcrypt    = require('bcryptjs');
const UserModel = require('../models/userModel');
const { signToken } = require('../utils/jwt');

const AuthService = {
  /**
   * Register a new customer
   */
  async register({ firstName, lastName, email, password, phone, address }) {
    // Check duplicate email
    const existing = await UserModel.findByEmail(email);
    if (existing) throw { status: 409, message: 'Email already registered' };

    const hashed = await bcrypt.hash(password, 12);
    const userId = await UserModel.create({
      firstName, lastName, email,
      password: hashed, phone, address,
      role: 'customer'
    });
    return userId;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw { status: 401, message: 'Invalid email or password' };

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw { status: 401, message: 'Invalid email or password' };

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return {
      token,
      user: {
        id:        user.id,
        firstName: user.first_name,
        lastName:  user.last_name,
        email:     user.email,
        role:      user.role
      }
    };
  },

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };
    const { password: _, ...safe } = user;
    return safe;
  }
};

module.exports = AuthService;
