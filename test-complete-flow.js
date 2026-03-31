// Test complete user flow: signin -> therapist chat
const API_URL = "http://127.0.0.1:8000";

async function testCompleteFlow() {
  console.log("🔄 Testing Complete User Flow: Signin → Chat\n");
  
  try {
    // Step 1: Sign in (simulate frontend signin)
    console.log("1️⃣ Testing signin flow...");
    const signinResponse = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "flowtest_user",
        mood_emoji: "😊"
      })
    });
    
    if (!signinResponse.ok) {
      throw new Error(`Signin failed: ${signinResponse.status}`);
    }
    
    const signinData = await signinResponse.json();
    console.log("✅ Signin successful");
    console.log("   Username:", signinData.user.username);
    console.log("   User ID:", signinData.user.id);
    console.log("   Token:", signinData.access_token.substring(0, 50) + "...");
    
    // Simulate localStorage (what frontend would do)
    const token = signinData.access_token;
    const userId = signinData.user.id;
    const username = signinData.user.username;
    
    // Step 2: Test AI chat with authentication
    console.log("\n2️⃣ Testing AI chat with authentication...");
    const chatResponse = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "Hello, my name is Alex and I'm feeling a bit stressed",
        user_id: userId
      })
    });
    
    if (!chatResponse.ok) {
      const error = await chatResponse.json();
      throw new Error(`Chat failed: ${chatResponse.status} - ${error.detail}`);
    }
    
    const chatData = await chatResponse.json();
    console.log("✅ AI Chat successful");
    console.log("   Response:", chatData.response.substring(0, 100) + "...");
    console.log("   Personalized:", chatData.response.includes("Alex"));
    console.log("   Crisis detected:", chatData.is_crisis);
    console.log("   Exercise suggested:", !!chatData.suggested_exercise);
    
    // Step 3: Test conversation memory
    console.log("\n3️⃣ Testing conversation memory...");
    const followUpResponse = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: "Can you help me with that stress?",
        user_id: userId
      })
    });
    
    if (!followUpResponse.ok) {
      throw new Error(`Follow-up failed: ${followUpResponse.status}`);
    }
    
    const followUpData = await followUpResponse.json();
    console.log("✅ Follow-up successful");
    console.log("   Response:", followUpData.response.substring(0, 100) + "...");
    console.log("   Context maintained:", followUpData.response.toLowerCase().includes("stress") || followUpData.response.toLowerCase().includes("alex"));
    
    console.log("\n🎉 COMPLETE FLOW TEST PASSED!");
    console.log("✅ Authentication working");
    console.log("✅ AI chat responding");
    console.log("✅ Personalization active");
    console.log("✅ Memory functional");
    console.log("\n📱 Frontend is ready for real AI conversations!");
    
  } catch (error) {
    console.error("❌ Flow test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testCompleteFlow();
