// File: multiHelmetSimulator.js

const awsIot = require('aws-iot-device-sdk');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { generateHelmetBatch } = require('./payloadGenerator');

const device = awsIot.device({
  keyPath: path.resolve(__dirname, process.env.PRIVATE_KEY_PATH),
  certPath: path.resolve(__dirname, process.env.CERTIFICATE_PATH),
  caPath: path.resolve(__dirname, process.env.ROOT_CA_PATH),
  clientId: 'multiHelmetSimulator',
  host: process.env.AWS_IOT_ENDPOINT,
});

const helmetCount = 10; // how many helmets per interval
const intervalMs = 3000;

device.on('connect', () => {
  console.log('✅ Connected to AWS IoT Core');

  setInterval(() => {
    const payloads = generateHelmetBatch(helmetCount);
    payloads.forEach((payload) => {
      device.publish("helmet/data", JSON.stringify(payload));
      console.log(`📤 [${payload.id}] →`, payload);
    });
  }, intervalMs);
});
