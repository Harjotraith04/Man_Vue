// MongoDB initialization script for Manvue
// This script creates the database and initial collections

// Switch to the manvue database
db = db.getSiblingDB('manvue');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        role: { enum: ['user', 'admin'] }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'category', 'price'],
      properties: {
        title: { bsonType: 'string' },
        category: { bsonType: 'string' },
        price: { bsonType: 'object' }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['orderNumber', 'user', 'items', 'pricing'],
      properties: {
        orderNumber: { bsonType: 'string' },
        user: { bsonType: 'objectId' },
        items: { bsonType: 'array' },
        pricing: { bsonType: 'object' }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.users.createIndex({ role: 1 });

db.products.createIndex({ title: 'text', description: 'text', tags: 'text' });
db.products.createIndex({ category: 1, subCategory: 1 });
db.products.createIndex({ 'price.selling': 1 });
db.products.createIndex({ 'rating.average': -1 });
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ isActive: 1, isFeatured: 1 });
db.products.createIndex({ createdAt: -1 });

db.orders.createIndex({ user: 1, createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

print('✅ Manvue database initialized successfully!');
print('📊 Collections created: users, products, orders');
print('🔍 Indexes created for optimal performance');
print('🚀 Ready for Manvue application!');
