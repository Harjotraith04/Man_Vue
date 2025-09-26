const axios = require('axios');

async function debugProducts() {
  const baseUrl = 'http://localhost:4000/api';
  
  console.log('🔍 Debugging Product Search');
  console.log('===========================\n');
  
  try {
    // Check what products exist
    console.log('1. Checking all products...');
    const allProducts = await axios.get(`${baseUrl}/products`);
    console.log(`   Total products: ${allProducts.data.data?.products?.length || 0}`);
    
    if (allProducts.data.data?.products?.length > 0) {
      console.log('\n📋 Available products:');
      allProducts.data.data.products.forEach((product, i) => {
        console.log(`   ${i+1}. ${product.title}`);
        console.log(`      Category: ${product.category}`);
        console.log(`      Colors: ${product.variants?.map(v => v.color).join(', ') || 'None'}`);
        console.log('');
      });
    }
    
    // Test direct shirt search
    console.log('2. Testing shirt category search...');
    const shirtSearch = await axios.get(`${baseUrl}/products?category=shirts`);
    console.log(`   Shirts found: ${shirtSearch.data.data?.products?.length || 0}`);
    
    // Test t-shirt search
    console.log('3. Testing t-shirt category search...');
    const tshirtSearch = await axios.get(`${baseUrl}/products?category=tshirts`);
    console.log(`   T-shirts found: ${tshirtSearch.data.data?.products?.length || 0}`);
    
    // Test AI chatbot search specifically
    console.log('4. Testing AI chat directly...');
    const chatTest = await axios.post(`${baseUrl}/ai/chat`, {
      message: "shirt",
      context: []
    });
    console.log(`   Chat response products: ${chatTest.data.data?.products?.length || 0}`);
    if (chatTest.data.data?.products?.length > 0) {
      console.log(`   First product: ${chatTest.data.data.products[0].title}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugProducts();
