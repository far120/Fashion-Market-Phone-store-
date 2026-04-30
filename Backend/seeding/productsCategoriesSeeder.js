// seed/seedPhones.js
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env")
});

const mongoose = require("mongoose");

const Brand = require("../src/models/Brand");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");

// ======================
// DB CONNECT
// ======================
async function connectDB() {
  await mongoose.connect("mongodb://localhost:27017/FashionMarket(PhoneStore)");
  console.log("✅ DB Connected");
}

// ======================
// HELPER
// ======================
function pick(arr, i) {
  return arr[i % arr.length];
}

// ======================
// IMAGES
// ======================
const img = {
  phone: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    "https://images.unsplash.com/photo-1510557880182-3a935c8fbb67"
  ],
  tablet: [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3"
  ],
  accessories: [
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad"
  ],
  headphones: [
    "https://images.unsplash.com/photo-1518441902117-7d9c9d88d2bb"
  ],
  watch: [
    "https://images.unsplash.com/photo-1517433456452-f9633a875f6f"
  ]
};

// ======================
// MAIN SEED
// ======================
async function seed() {
  try {
    await connectDB();

    // clear old data
    await Brand.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log("🧹 Old data deleted");

    // ======================
    // BRANDS
    // ======================
    const brands = await Brand.insertMany([
      { name: "Apple" },
      { name: "Samsung" },
      { name: "Xiaomi" },
      { name: "Huawei" },
      { name: "Oppo" },
      { name: "Realme" },
      { name: "OnePlus" }
    ]);

    // ======================
    // CATEGORIES
    // ======================
    const categories = await Category.insertMany([
      { name: "Smartphones" },
      { name: "Tablets" },
      { name: "Accessories" },
      { name: "Headphones" },
      { name: "Smartwatches" }
    ]);

    // ======================
    // DESCRIPTIONS
    // ======================
    const descriptions = {
      Smartphones:
        "High-performance smartphone with powerful processor, advanced camera, and modern design.",
      Tablets:
        "Portable tablet with large display, perfect for work, entertainment, and daily use.",
      Accessories:
        "Essential mobile accessories designed for durability and convenience.",
      Headphones:
        "High-quality headphones with immersive sound and noise cancellation.",
      Smartwatches:
        "Smart wearable device with fitness tracking and smart notifications."
    };

    // ======================
    // PRODUCTS
    // ======================
    const products = [
      // Featured Phones
      {
        name: "iPhone 14 Pro",
        price: 999,
        category: categories[0]._id,
        brand: brands[0]._id,
        stock: 10,
        image: pick(img.phone, 0),
        description: descriptions.Smartphones
      },
      {
        name: "Samsung Galaxy S23",
        price: 899,
        category: categories[0]._id,
        brand: brands[1]._id,
        stock: 12,
        image: pick(img.phone, 1),
        description: descriptions.Smartphones
      },
      {
        name: "Xiaomi Redmi Note 12",
        price: 300,
        category: categories[0]._id,
        brand: brands[2]._id,
        stock: 15,
        image: pick(img.phone, 0),
        description: descriptions.Smartphones
      },

      // Auto generate products
      ...Array.from({ length: 40 }).map((_, i) => {
        const category = categories[i % categories.length];

        let imageSet = img.phone;
        if (category.name === "Tablets") imageSet = img.tablet;
        if (category.name === "Accessories") imageSet = img.accessories;
        if (category.name === "Headphones") imageSet = img.headphones;
        if (category.name === "Smartwatches") imageSet = img.watch;

        return {
          name: `${category.name} Product ${i + 1}`,
          price: 100 + i * 10,
          description: descriptions[category.name],
          category: category._id,
          brand: brands[i % brands.length]._id,
          stock: (i % 20) + 1,
          image: pick(imageSet, i)
        };
      })
    ];

    await Product.insertMany(products);

    console.log("🔥 Seeder completed successfully (Phones Store)");

    process.exit();
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
}

seed();