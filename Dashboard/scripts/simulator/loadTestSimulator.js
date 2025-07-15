// File: loadTestSimulator.js

const awsIot = require("aws-iot-device-sdk");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { generateHelmetData } = require('./payloadGenerator');

const NUM_DEVICES = 100;
const PUBLISH_INTERVAL_MS = 2000;

for (let i = 0; i < NUM_DEVICES; i++) {
  const device = awsIot.device({
    keyPath: path.resolve(__dirname, process.env.PRIVATE_KEY_PATH),
    certPath: path.resolve(__dirname, process.env.CERTIFICATE_PATH),
    caPath: path.resolve(__dirname, process.env.ROOT_CA_PATH),
    clientId: `HelmetSimulator_${i}`,
    host: process.env.AWS_IOT_ENDPOINT,
  });

  device.on("connect", () => {
    console.log(`✅ Device ${i} connected.`);
    setInterval(() => {
      const payload = generateHelmetData(i);
      device.publish("helmet/data", JSON.stringify(payload));
      console.log(`📤 Sent from Helmet_${i}`, payload);
    }, PUBLISH_INTERVAL_MS);
  });

  device.on("error", (err) => {
    console.error(`❌ Device ${i} error:`, err.message);
  });
}
