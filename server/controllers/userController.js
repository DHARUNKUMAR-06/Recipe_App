const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if the credentials match the fixed admin credentials
    if (email === adminEmail && password === adminPassword) {
      let adminUser = await User.findOne({ email: adminEmail });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        adminUser = new User({
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        });
        await adminUser.save();
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
      }

      const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);
      return res.json({ token, user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role } });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 1. Check if the credentials match the fixed admin credentials
    if (email === adminEmail && password === adminPassword) {
      // 2. See if the admin user exists in the DB, if not, create it
      let adminUser = await User.findOne({ email: adminEmail });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        adminUser = new User({
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        });
        await adminUser.save();
      } else if (adminUser.role !== 'admin') {
        // Ensure the user has the 'admin' role
        adminUser.role = 'admin';
        await adminUser.save();
      }

      const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);
      return res.json({ token, user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role } });
    }

    // 3. If credentials didn't match the fixed ones, reject
    return res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};