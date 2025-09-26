const axios = require('axios');

async function testChatbotFlow() {
  const baseUrl = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Enhanced Chatbot Flow\n');
  
  try {
    // Test 1: Initial blue shirt query
    console.log('📝 Test 1: Initial "blue shirt" query');
    const response1 = await axios.post(`${baseUrl}/ai/chat`, {
      message: "blue shirt",
      context: []
    });
    
    console.log('👤 User: blue shirt');
    console.log('🤖 Bot:', response1.data.data.message);
    console.log('📦 Products found:', response1.data.data.products?.length || 0);
    if (response1.data.data.products?.length > 0) {
      console.log('   Product:', response1.data.data.products[0].title);
    }
    console.log('');
    
    // Test 2: Follow-up "yes" response
    console.log('📝 Test 2: Follow-up "yes" response');
    const context = [
      { role: 'user', content: 'blue shirt' },
      { role: 'assistant', content: response1.data.data.message }
    ];
    
    const response2 = await axios.post(`${baseUrl}/ai/chat`, {
      message: "yes",
      context: context
    });
    
    console.log('👤 User: yes');
    console.log('🤖 Bot:', response2.data.data.message);
    console.log('📦 Products found:', response2.data.data.products?.length || 0);
    if (response2.data.data.products?.length > 0) {
      response2.data.data.products.forEach((product, i) => {
        console.log(`   ${i+1}. ${product.title} - £${product.price?.selling}`);
      });
    }
    console.log('');
    
    // Test 3: Specific "show me blue shirts" query
    console.log('📝 Test 3: "show me blue shirts" query');
    const response3 = await axios.post(`${baseUrl}/ai/chat`, {
      message: "show me blue shirts",
      context: []
    });
    
    console.log('👤 User: show me blue shirts');
    console.log('🤖 Bot:', response3.data.data.message);
    console.log('📦 Products found:', response3.data.data.products?.length || 0);
    console.log('');
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testChatbotFlow();
