const User = require("../models/user.model"); // ✅ FIX: needed for updateProfile + others
const bcrypt = require("bcryptjs");

/* ================= DASHBOARD ================= */
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, age, country, state, city, address } = req.body;

    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const updateData = {
      name,
      phone,
      age,
      country,
      state,
      city,
      address,
    };

    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Profile update failed",
    });
  }
};

/* ================= ADMIN: GET ALL CUSTOMERS ================= */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: CREATE CUSTOMER ================= */
exports.createCustomerByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, age, country, state, city, address } =
      req.body;

    // ✅ FIX: validation to prevent bcrypt crash -> 500
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileImage = req.file ? `/uploads/${req.file.filename}` : "";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      age,
      country,
      state,
      city,
      address,
      profileImage,
      role: "customer",
    });

    return res.status(201).json({
      success: true,
      message: "Customer created by admin ✅",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("CREATE CUSTOMER ERROR:", error); // ✅ helps debugging
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ADMIN: UPDATE CUSTOMER ================= */
exports.updateCustomerByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, phone, age, country, state, city, address, password } =
      req.body;

    const updateData = {
      name,
      email,
      phone,
      age,
      country,
      state,
      city,
      address,
    };

    // password optional
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // image optional
    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated ✅",
      customer: updated,
    });
  } catch (error) {
    console.log("UPDATE CUSTOMER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= ADMIN: DELETE CUSTOMER ================= */
exports.deleteCustomerByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted ✅",
    });
  } catch (error) {
    console.log("DELETE CUSTOMER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
