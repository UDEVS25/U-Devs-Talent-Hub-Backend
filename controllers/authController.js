const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * 📝 USER REGISTRATION CONTROLLER
 * Route: POST /api/auth/register
 */
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Basic Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password.'
    });
  }

  try {
    // 2. Check if user already exists in database
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address.'
      });
    }

    // 3. Hash the password securely using bcrypt (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Default role management ('intern' if not specified)
    const userRole = role || 'intern';

    // 5. Insert new user into the database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, passwordHash, userRole]
    );

    // 6. Return structured successful response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully into uDevs Talent Database!',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error during user registration.',
      error: error.message
    });
  }
};



/**
 * 🔑 USER LOGIN CONTROLLER
 * Route: POST /api/auth/login
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation check
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.'
    });
  }

  try {
    // 2. Fetch user from database via email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // 3. If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    // 4. Verify password security hash match
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    // 5. Generate Identity JWT Token (Signs user payload with Secret Key)
    const token = jwt.sign(
      { id: user.id, role: user.role, is_premium_plus: user.is_premium_plus },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 6. Return identity block to client side
    return res.status(200).json({
      success: true,
      message: 'Authentication successful! Session token generated.',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_premium_plus: user.is_premium_plus
      }
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error during user authentication.',
      error: error.message
    });
  }
};