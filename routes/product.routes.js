const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// GET all products
router.get("/", productController.getProducts);

// ✅ CREATE product (ADMIN) WITH IMAGE
router.post(
  "/",
  verifyToken,
  upload.single("image"),   // 🔥 THIS WAS MISSING
  productController.createProduct
);

// UPDATE product
router.put(
  "/:id",
  verifyToken,
  upload.single("image"),
  productController.updateProduct
);

// DELETE product
router.delete("/:id", verifyToken, productController.deleteProduct);

module.exports = router;
