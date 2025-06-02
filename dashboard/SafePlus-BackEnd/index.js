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
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(requestIp.mw());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection failed", err));

// ✅ Routes
app.use('/', require('./routes/authRoutes'));
app.use('/api/mobile/data', require('./routes/mobileData'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/workers/hourly-stats', require('./routes/mobileData'));

// ✅ Start HTTP Server
const port = 8000;
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});



// ✅ WebSocket Setup
const wss = new WebSocket.Server({ port: 8085 });

// ✅ AWS IoT Setup
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
  device.subscribe("helmet/data", (err,granted) => {
    if (err) {
      console.error("❌ AWS subscription error:", err);
    }//else{
     // console.log('✅ Subscribed:', granted);
    //}
  });
});

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
