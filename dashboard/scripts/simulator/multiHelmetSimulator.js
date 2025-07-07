const awsIot = require('aws-iot-device-sdk');
const { iot, simulation } = require('./config');
const { generateHelmetBatch } = require('./payloadGenerator');

console.log("🔍 IoT Connect Options:", iot);

const device = awsIot.device(iot);

device.on('connect', () => {
  console.log('✅ Connected to AWS IoT Core');

  setInterval(() => {
    const payloads = generateHelmetBatch(simulation.helmetCount);

    payloads.forEach((payload) => {
      device.publish(simulation.topic, JSON.stringify(payload));
      console.log(`📤 [${payload.id}] →`, payload);
    });
  }, simulation.intervalMs);
});
