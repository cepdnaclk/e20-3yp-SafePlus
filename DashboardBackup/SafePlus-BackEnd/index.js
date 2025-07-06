require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const requestIp = require('request-ip');
const mongoose = require('mongoose');
const awsIot = require('aws-iot-device-sdk');
const WebSocket = require('ws');
const HourlyStats = require('./models/HourlyStatModel');

const app = express();
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true);

    // List of allowed exact origins
    const allowedOrigins = [
      'http://localhost:5173',
      'https://safeplus.netlify.app',
      'https://686a95bbb955e90008219eb8--quiet-zabaione-c6e293.netlify.app'
    ];

    if (allowedOrigins.includes(origin) || origin.endsWith('.safeplus.netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

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
app.post('/api/sos', (req, res) => {
  const { helmetId } = req.body;
  if (!helmetId) return res.status(400).json({ error: "Helmet ID required" });

  const topic = `helmet/alert`;
  const message = JSON.stringify({"alert":"ALERT"});  // <-- JSON string

  device.publish(topic, message, (err) => {
    if (err) return res.status(500).json({ error: "Failed to send SOS" });
    return res.status(200).json({ message: "SOS sent successfully" });
  });
});




// Start HTTP Server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

app.get('/', (req, res) => {
  res.send('✅ SafePlus backend is running!');
});

const wss = new WebSocket.Server({ port: 8085 });

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
