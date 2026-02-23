const Product = require("../models/product.model");

// GET all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Price are required" });
    }

    // ✅ FIX: support BOTH file upload & image URL
    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      image = imageUrl;
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      image,
      category,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl } = req.body;

    const updateData = { name, description, price, category };

    // ✅ FIX: image update logic
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
