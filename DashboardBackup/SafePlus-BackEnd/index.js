require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const requestIp = require('request-ip');
const mongoose = require('mongoose');
const awsIot = require('aws-iot-device-sdk');
const WebSocket = require('ws');
const HourlyStats = require('./models/HourlyStatModel');
const Alert = require("./models/Alert");
const http = require("http");
const fs = require('fs');

['PRIVATE_KEY_PATH', 'CERTIFICATE_PATH', 'ROOT_CA_PATH'].forEach((env) => {
  const path = process.env[env];
  console.log(`Checking file: ${env} -> ${path}`);
  if (path && fs.existsSync(path)) {
    console.log(`✅ File exists: ${path}`);
  } else {
    console.log(`❌ File NOT found: ${path}`);
  }
});


console.log("🔍 AWS ENV CHECK:");
console.log("PRIVATE_KEY_PATH:", process.env.PRIVATE_KEY_PATH);
console.log("CERTIFICATE_PATH:", process.env.CERTIFICATE_PATH);
console.log("ROOT_CA_PATH:", process.env.ROOT_CA_PATH);
console.log("AWS_IOT_ENDPOINT:", process.env.AWS_IOT_ENDPOINT);


console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Exists" : "Missing");
console.log("MONGO_URL:", process.env.MONGO_URL ? "Exists" : "Missing");


const app = express();
// CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5173',
      'https://safeplus.netlify.app',
      'https://quiet-zabaione-c6e293.netlify.app'
    ];
    if (allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.options("*", cors());

app.use(requestIp.mw());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection failed", err));

  // Routes

app.use('/api/user', require('./routes/twoFactorRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/workers/hourly-stats', require('./routes/MobileData'));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.post('/api/sos', (req, res) => {
  const { helmetId } = req.body;
  if (!helmetId) return res.status(400).json({ error: "Helmet ID required" });

  const topic = `helmet/alert`;
  const message = JSON.stringify({"alert":"ALERT"});

  device.publish(topic, message, (err) => {
    if (err) return res.status(500).json({ error: "Failed to send SOS" });
    return res.status(200).json({ message: "SOS sent successfully" });
  });
});

const message = JSON.stringify()


app.get('/', (req, res) => {
  res.send('✅ SafePlus backend is running!');
});

// Create shared HTTP server
const server = http.createServer(app);
const port = process.env.PORT || 8000;
const host = '0.0.0.0'; 

server.listen(port, host,() => {
  console.log(`✅ Server + WebSocket running on port ${port}`);
});



// Attach WebSocket server to HTTP server
const wss = new WebSocket.Server({ server });

// AWS IoT Setup
const device = awsIot.device({
  keyPath: process.env.PRIVATE_KEY_PATH,
  certPath: process.env.CERTIFICATE_PATH,
  caPath: process.env.ROOT_CA_PATH,
  clientId: "NodeBackendClient",
  host: process.env.AWS_IOT_ENDPOINT,
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ message: "Connected to WebSocket Server" }));
});



device.on("connect", () => {
    console.log("✅ Connected to AWS IoT");
  device.subscribe("helmet/data", (err) => {
    if (err) {console.error("❌ AWS subscription error:", err);}
    else {console.log("✅ Subscribed to helmet/data topic");}
  });
  device.subscribe("helmet/alert", (err) => {
    if (err) {console.error("❌ AWS subscription error:", err);}
    else {console.log("✅ Subscribed to helmet/alert topic");}
  });

});
device.on("error", (error) => {
  console.error("❌ AWS IoT error:", error);
}
);
device.on("close", () => {
  console.log("❌ AWS IoT connection closed");
});
device.on("offline", () => {
  console.log("❌ AWS IoT device is offline");
});
device.on("reconnect", () => {
  console.log("✅ AWS IoT device reconnected");});

device.on('error', function (error) {
  console.error('❌ AWS IoT error occurred:', error);
});


device.on("message", (topic, payload) => {
  const data = JSON.parse(payload.toString());
  const now = new Date();
  const roundedHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
  const hourValue = Math.floor(roundedHour.getTime() / (1000 * 60 * 60));
  const helmetId = data.id;

    // Detect alerts
  const alerts = [];

  if (data.bpmStatus === "high") {
    alerts.push({ type: "bpm", value: data.bpm });
  }
  if (data.gasStatus === "danger") {
    alerts.push({ type: "gas", value: data.gas });
  }
  if (data.impactStatus === "warning") {
    alerts.push({ type: "impact", value: data.imp });
  }
  if (data.tempStatus === "danger") {
    alerts.push({ type: "temp", value: data.temp });
  }
  if (data.fallStatus === "detected") {
    alerts.push({ type: "fall", value: data.fall });
  }

  // Save alerts to DB
  alerts.forEach((alert) => {
    const alertDoc = new Alert({
      helmetId,
      alertType: alert.type,
      alertValue: alert.value,
      alertTime: now,
    });
    alertDoc.save().catch((err) =>
      console.error("❌ Failed to save alert:", err)
    );
  });

  // WebSocket broadcast
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

  HourlyStats.findOne({ helmetId }).sort({ hourWindowStart: -1 })
    .then(lastStats => {
      const isImpact = data.imp === "impact";
      const isGasAlert = data.gas > 300;
      const tempVal = Number(data.temp);
      const humVal = Number(data.hum);

      if (lastStats && now < new Date(lastStats.hourWindowStart.getTime() + 60 * 60 * 1000)) {
        const newCount = lastStats.count + 1;
        if (!isNaN(tempVal)) {
          lastStats.avgTemp = ((lastStats.avgTemp || 0) * lastStats.count + tempVal) / newCount;
        }
        if (!isNaN(humVal)) {
          lastStats.avgHum = ((lastStats.avgHum || 0) * lastStats.count + humVal) / newCount;
        }
        lastStats.impactCount += isImpact ? 1 : 0;
        lastStats.gasAlertCount += isGasAlert ? 1 : 0;
        lastStats.count = newCount;
        return lastStats.save();
      }

      const newStats = new HourlyStats({
        helmetId,
        hour: hourValue,
        hourWindowStart: roundedHour,
        avgTemp: !isNaN(tempVal) ? tempVal : 0,
        avgHum: !isNaN(humVal) ? humVal : 0,
        impactCount: isImpact ? 1 : 0,
        gasAlertCount: isGasAlert ? 1 : 0,
        count: 1,
      });

      return newStats.save();
    })
    .catch(err => {
      console.error("❌ Error saving hourly stats:", err);
    });
});


function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

app.post("/api/sos", (req, res) => {
  const { helmetId, mode } = req.body;
  if (!helmetId || !mode) return res.status(400).json({ error: "Missing fields" });

  const topic = `helmet/alert`;
  const message = JSON.stringify({ alert: "ALERT", helmetId });

  if (mode === "worker") {
    device.publish(topic, message, (err) => {
      if (err) return res.status(500).json({ error: "Failed to send SOS" });
      return res.status(200).json({ message: "SOS sent to worker" });
    });
  }

  else if (mode === "group") {
    const center = helmetLocationMap[helmetId];
    if (!center) return res.status(404).json({ error: "Helmet location not found" });

    const RADIUS_METERS = 20;
    const nearby = Object.entries(helmetLocationMap)
      .filter(([id, loc]) => {
        if (id === helmetId) return false;
        const dist = getDistanceMeters(center, loc);
        return dist <= RADIUS_METERS;
      })
      .map(([id]) => id);

    const allIds = [helmetId, ...nearby];

    allIds.forEach(id => {
      const msg = JSON.stringify({ alert: "ALERT", helmetId: id });
      device.publish(topic, msg);
    });

    console.log(`🚨 Group SOS sent to:`, allIds);
    res.status(200).json({ message: "Group SOS sent", helmets: allIds });
  }

  else {
    return res.status(400).json({ error: "Invalid mode" });
  }
});
