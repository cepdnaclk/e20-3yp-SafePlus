require("dotenv").config();
const awsIot = require("aws-iot-device-sdk");
const WebSocket = require("ws");
const mongoose = require("mongoose");
// const HelmetData = require("./models/sensorData");
const express = require("express");
const app = express();
const cors = require("cors");
const HourlyStats = require("./models/HourlyStatModel");

app.use(cors());
app.use(express.json());

// Authentication routes
const workerRoutes = require("./routes/workerRoutes");
app.use("/api/workers", workerRoutes);
  
// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// WebSocket server
const wss = new WebSocket.Server({ port: 8085 });

// AWS IoT Core connection
const device = awsIot.device({
  keyPath: process.env.PRIVATE_KEY_PATH,
  certPath: process.env.CERTIFICATE_PATH,
  caPath: process.env.ROOT_CA_PATH,
  clientId: "NodeBackendClient",
  host: process.env.AWS_IOT_ENDPOINT,
});



wss.on("connection", (ws) => {
  //console.log("✅ Frontend connected to WebSocket Server");
  ws.send(JSON.stringify({ message: "Connected to WebSocket Server" }));
});

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

device.on("error", (err) => {
  console.error("❌ AWS IoT Device Error:", err);
});

device.on("close", () => {
  console.warn("⚠️ AWS IoT connection closed");
});

device.on("reconnect", () => {
  console.log("🔁 Attempting to reconnect to AWS IoT...");
});

device.on("message", (topic, payload) => {
  const data = JSON.parse(payload.toString());
  console.log(`📩 Data received from topic "${topic}":`, data);

  // Broadcast to WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

  // ROLLING STATS AGGREGATION
  const now = new Date();
  const roundedHour = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
    0
  );
  const hourValue = Math.floor(roundedHour.getTime() / (1000 * 60 * 60));

  const helmetId = data.id;

  HourlyStats.findOne({ helmetId }).sort({ hourWindowStart: -1 })
    .then((lastStats) => {
      const isImpact = data.imp === "yes";
      const isGasAlert = data.gas > 300;

      const tempVal = Number(data.temp);
      const humVal = Number(data.hum);

      if (lastStats) {
        const windowStart = new Date(lastStats.hourWindowStart);
        const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);

        if (now < windowEnd) {
          // Update existing stat
          const newCount = lastStats.count + 1;

          if (!isNaN(tempVal)) {
            lastStats.avgTemp = ((lastStats.avgTemp || 0) * lastStats.count + tempVal) / newCount;
          }

          if (!isNaN(humVal)) {
            lastStats.avgHum = ((lastStats.avgHum || 0) * lastStats.count + humVal) / newCount;
          }

          lastStats.impactCount += isImpact ? 1 : 0;
          lastStats.gasAlerts += isGasAlert ? 1 : 0;
          lastStats.count = newCount;

          return lastStats.save();
        }
      }

      // Create new rolling window
      const newStats = new HourlyStats({
        helmetId,
        hour: hourValue,
        hourWindowStart: roundedHour,
        avgTemp: !isNaN(tempVal) ? tempVal : 0,
        avgHum: !isNaN(humVal) ? humVal : 0,
        impactCount: isImpact ? 1 : 0,
        gasAlerts: isGasAlert ? 1 : 0,
        count: 1,
      });

      return newStats.save();
    })
    .then(() => {
      console.log(`✅ Rolling stats updated for helmet ${data.id}`);
    })
    .catch((err) => {
      console.error("❌ Failed to process data:", err);
    });
});
