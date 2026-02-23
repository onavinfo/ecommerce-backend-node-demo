const mongoose = require("mongoose");
const Product = require("../models/product.model");

const MONGO_URI = "mongodb+srv://akashbhatoa0706_db_user:9VsKxwS2mDhAjeqp@cluster0.afgppil.mongodb.net/first-project-testing";

(async () => {
  await mongoose.connect(MONGO_URI);

  await Product.deleteMany();

  await Product.insertMany([
    {
      name: "Smart Watch",
      description: "Modern smart watch with fitness tracking and notifications.",
      price: 1999,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
      category: "Gadgets",
    },
    {
      name: "Wireless Headphones",
      description: "High quality wireless headphones with deep bass.",
      price: 1499,
      image: "https://images.unsplash.com/photo-1518441311803-9b0678b75f56?w=1200&q=80",
      category: "Audio",
    },
    {
      name: "Backpack",
      description: "Durable backpack for travel and daily use.",
      price: 999,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      category: "Accessories",
    },
  ]);

  console.log("✅ Products seeded");
  process.exit(0);
})();
