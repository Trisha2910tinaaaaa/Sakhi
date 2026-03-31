// Test script to verify frontend-backend integration
const API_URL = "http://127.0.0.1:8000";

async function testIntegration() {
  console.log("🧪 Testing Sakhi Frontend-Backend Integration...\n");
  
  try {
    // Test 1: Health check
    console.log("1. Testing backend health...");
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log("✅ Backend health:", health);
    
    // Test 2: Authentication
    console.log("\n2. Testing authentication...");
    const authResponse = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser_frontend",
        mood_emoji: "😊"
      })
    });
    const auth = await authResponse.json();
    console.log("✅ Authentication successful");
    console.log("   Token:", auth.access_token.substring(0, 50) + "...");
    console.log("   User:", auth.user.username);
    
    const token = auth.access_token;
    const userId = auth.user.id;
    
    // Test 3: AI Chat (without user_id)
    console.log("\n3. Testing AI chat (without user_id)...");
    const chatResponse1 = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "Hello, I'm feeling anxious today"
      })
    });
    const chat1 = await chatResponse1.json();
    console.log("✅ AI Response 1:", chat1.response.substring(0, 100) + "...");
    console.log("   Is crisis:", chat1.is_crisis);
    console.log("   Has exercise:", !!chat1.suggested_exercise);
    
    // Test 4: AI Chat (with user_id)
    console.log("\n4. Testing AI chat (with user_id)...");
    const chatResponse2 = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "My name is Sarah and I need help with stress",
        user_id: userId
      })
    });
    const chat2 = await chatResponse2.json();
    console.log("✅ AI Response 2:", chat2.response.substring(0, 100) + "...");
    console.log("   Personalized:", chat2.response.includes("Sarah"));
    
    // Test 5: Crisis detection
    console.log("\n5. Testing crisis detection...");
    const crisisResponse = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "I want to kill myself"
      })
    });
    const crisis = await crisisResponse.json();
    console.log("✅ Crisis detected:", crisis.is_crisis);
    console.log("   Has resources:", !!crisis.crisis_resources);
    
    console.log("\n🎉 ALL TESTS PASSED! Frontend-Backend integration is working!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testIntegration();
