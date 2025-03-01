require("dotenv").config();
const awsIot = require("aws-iot-device-sdk");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const HelmetData = require("./models/sensorData");

// MongoDB connection using Mongoose
mongoose.connect("mongodb://localhost:27017/", {
})
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

const wss = new WebSocket.Server({ port: 8085 });

// AWS IoT Core Device Connection
const device = awsIot.device({
  keyPath: process.env.PRIVATE_KEY_PATH,
  certPath: process.env.CERTIFICATE_PATH,
  caPath: process.env.ROOT_CA_PATH,
  clientId: "NodeBackendClient",
  host: process.env.AWS_IOT_ENDPOINT,
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

  // Insert data into MongoDB using Mongoose model
  const helmetData = new HelmetData(data);
  helmetData.save()
    .then(() => {
      console.log("✅ Data inserted into MongoDB");
    })
    .catch((err) => {
      console.error("❌ Failed to insert data into MongoDB:", err);
    });
});

// Handle errors
device.on("error", (err) => {
  console.error("❌ AWS IoT Error:", err);
});
