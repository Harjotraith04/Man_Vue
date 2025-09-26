const axios = require('axios');

async function debugAIResponse() {
  const baseUrl = 'http://localhost:4000/api';
  
  console.log('🔍 Debugging AI Response Generation');
  console.log('====================================\n');
  
  try {
    console.log('🧪 Testing "yes" response with proper context...\n');
    
    const context = [
      { role: 'user', content: 'blue shirt' },
      { role: 'assistant', content: 'Perfect! I have some great blue shirts in our collection. We have classic and premium blue shirts available in various styles - from casual everyday wear to more formal options. Each shirt comes in multiple color variants including blue, so you can choose the perfect shade that matches your style. Would you like me to show you the available blue shirt options?' }
    ];
    
    console.log('📝 Context being sent:');
    context.forEach((msg, i) => {
      console.log(`   ${i+1}. ${msg.role}: ${msg.content.substring(0, 100)}...`);
    });
    console.log('');
    
    console.log('📨 Sending "yes" with context...');
    const response = await axios.post(`${baseUrl}/ai/chat`, {
      message: "yes",
      context: context
    });
    
    console.log('✅ Response received:');
    console.log('   Message:', response.data.data.message.substring(0, 200) + '...');
    console.log('   Products found:', response.data.data.products?.length || 0);
    
    if (response.data.data.products?.length > 0) {
      console.log('   Product details:');
      response.data.data.products.forEach((product, i) => {
        console.log(`      ${i+1}. ${product.title} - £${product.price?.selling}`);
        console.log(`         Category: ${product.category}`);
        console.log(`         Colors: ${product.variants?.map(v => v.color).join(', ') || 'None'}`);
      });
    }
    
    // Check if response is generic or specific
    const isGeneric = response.data.data.message.includes('Could you tell me more about what you\'re looking for');
    const hasProductInfo = response.data.data.message.includes('Navy Blue') || response.data.data.message.includes('£7') || response.data.data.message.includes('t-shirt');
    
    console.log('\n📊 Analysis:');
    console.log(`   Is Generic Response: ${isGeneric}`);
    console.log(`   Contains Product Info: ${hasProductInfo}`);
    console.log(`   Products Attached: ${(response.data.data.products?.length || 0) > 0}`);
    
    if (!isGeneric && hasProductInfo) {
      console.log('✅ SUCCESS: AI is using enhanced prompts!');
    } else if (!isGeneric && (response.data.data.products?.length || 0) > 0) {
      console.log('⚠️  PARTIAL: Products found but not enough detail in response');
    } else {
      console.log('❌ ISSUE: Still getting generic responses');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugAIResponse();
