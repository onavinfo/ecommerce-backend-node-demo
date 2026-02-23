const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    age: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    //  MULTER IMAGE
    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer", // by default every user is customer
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Users", userSchema);
