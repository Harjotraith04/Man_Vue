const axios = require('axios');

async function testBlueShirtFlow() {
  const baseUrl = 'http://localhost:4000/api';
  
  console.log('🔍 Testing Blue Shirt Conversation Flow');
  console.log('=====================================\n');
  
  try {
    // Test 1: User says "blue shirt"
    console.log('👤 User: "blue shirt"');
    const response1 = await axios.post(`${baseUrl}/ai/chat`, {
      message: "blue shirt",
      context: []
    });
    
    console.log('🤖 Bot Response:');
    console.log(response1.data.data.message);
    console.log(`📦 Products found: ${response1.data.data.products?.length || 0}`);
    
    if (response1.data.data.products?.length > 0) {
      console.log('\n📋 Products:');
      response1.data.data.products.forEach((product, i) => {
        console.log(`   ${i+1}. ${product.title} - £${product.price?.selling} - ${product.category}`);
        if (product.variants?.length > 0) {
          console.log(`      Colors: ${product.variants.map(v => v.color).join(', ')}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Test 2: User responds with "yes"
    console.log('\n👤 User: "yes"');
    
    const context = [
      { role: 'user', content: 'blue shirt' },
      { role: 'assistant', content: response1.data.data.message }
    ];
    
    const response2 = await axios.post(`${baseUrl}/ai/chat`, {
      message: "yes",
      context: context
    });
    
    console.log('🤖 Bot Response:');
    console.log(response2.data.data.message);
    console.log(`📦 Products found: ${response2.data.data.products?.length || 0}`);
    
    if (response2.data.data.products?.length > 0) {
      console.log('\n📋 Products:');
      response2.data.data.products.forEach((product, i) => {
        console.log(`   ${i+1}. ${product.title} - £${product.price?.selling} - ${product.category}`);
        if (product.variants?.length > 0) {
          console.log(`      Colors: ${product.variants.map(v => v.color).join(', ')}`);
        }
      });
    }
    
    // Analysis
    console.log('\n' + '='.repeat(50));
    console.log('📊 ANALYSIS:');
    
    const hasProductsInSecondResponse = response2.data.data.products && response2.data.data.products.length > 0;
    const isGenericResponse = response2.data.data.message.includes('Could you tell me more about what you\'re looking for');
    
    if (hasProductsInSecondResponse && !isGenericResponse) {
      console.log('✅ SUCCESS: Follow-up "yes" response is working correctly!');
      console.log('   - Products are being shown');
      console.log('   - Response is specific to blue shirts');
    } else if (isGenericResponse) {
      console.log('❌ ISSUE: Bot is giving generic response instead of showing products');
      console.log('   - Follow-up logic is not working');
      console.log('   - Context is not being maintained');
    } else {
      console.log('⚠️  PARTIAL: Mixed results - needs investigation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the backend server is running on port 5000');
    }
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
console.log('⏳ Starting test in 3 seconds...\n');
setTimeout(testBlueShirtFlow, 3000);
