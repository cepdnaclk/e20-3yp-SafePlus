const awsIot = require('aws-iot-device-sdk');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const device = awsIot.device({
  keyPath: path.resolve(__dirname, process.env.PRIVATE_KEY_PATH),
  certPath: path.resolve(__dirname, process.env.CERTIFICATE_PATH),
  caPath: path.resolve(__dirname, process.env.ROOT_CA_PATH),
  clientId: 'backend-listener',
  host: process.env.AWS_IOT_ENDPOINT,
});

device.on('connect', () => {
  console.log('✅ Backend connected to AWS IoT');
  device.subscribe('helmet/data');
});

device.on('message', (topic, message) => {
  if (topic === 'helmet/data') {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`📥 Received ${payload.id}`);
      device.publish('helmet/ack', JSON.stringify({ id: payload.id }));
    } catch (e) {
      console.error('❌ Error parsing helmet data:', e.message);
    }
  }
});
