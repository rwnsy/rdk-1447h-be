const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findAdminByEmail, createAdmin } = require("../models/adminModel");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await findAdminByEmail(email);

    if (existing) {
      return res.status(400).json({ message: "Admin sudah ada." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await createAdmin({
      email,
      password: hashedPassword,
    });

    res.json({
      message: "Admin berhasil dibuat",
      admin,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      message: "Login berhasil",
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
};
