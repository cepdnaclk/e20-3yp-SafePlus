require("dotenv").config();
const awsIot = require("aws-iot-device-sdk");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8084 }); // WebSocket server running on port 8084

// AWS IoT Core Device Connection
const device = awsIot.device({
  keyPath: process.env.PRIVATE_KEY_PATH,  
  certPath: process.env.CERTIFICATE_PATH, 
  caPath: process.env.ROOT_CA_PATH,       
  clientId: "NodeBackendClient",          
  host: process.env.AWS_IOT_ENDPOINT      
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("✅ Frontend connected to WebSocket Server");
  ws.send(JSON.stringify({ message: "Connected to WebSocket Server" }));
});

// Subscribe to AWS IoT Core
device.on("connect", () => {
  console.log("✅ Connected to AWS IoT Core");
  device.subscribe("helmet/data", (err) => {
    if (err) {
      console.error("❌ Subscription failed:", err);
    } else {
      console.log("✅ Subscribed to topic: helmet/data");
    }
  });
});

// Send IoT messages to frontend via WebSockets
device.on("message", (topic, payload) => {
  const data = JSON.parse(payload.toString());
  console.log(`📩 Data received from topic "${topic}":`, data);

  // Send the data to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

// Handle errors
device.on("error", (err) => {
  console.error("❌ AWS IoT Error:", err);
});
