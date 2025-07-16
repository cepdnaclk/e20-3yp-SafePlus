const awsIot = require('aws-iot-device-sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const DEVICE_COUNT = parseInt(process.argv[2]) || 10;
const INTERVAL_MS = parseInt(process.argv[3]) || 2000;
const STAGES = [
  { label: 'Ramp-Up', deviceCount: Math.floor(DEVICE_COUNT * 0.3), interval: INTERVAL_MS * 2 },
  { label: 'Steady', deviceCount: Math.floor(DEVICE_COUNT * 0.4), interval: INTERVAL_MS },
  { label: 'Ramp-Down', deviceCount: DEVICE_COUNT, interval: INTERVAL_MS / 2 }
];

const certsDir = path.resolve(__dirname, process.env.CERTS_DIR || '../../SafePlus-Backend/certificates');

function checkFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${label} not found at ${filePath}`);
    process.exit(1);
  }
}

const keyPath = path.resolve(certsDir, process.env.PRIVATE_KEY_PATH || 'private.pem.key');
const certPath = path.resolve(certsDir, process.env.CERTIFICATE_PATH || 'certificate.pem.crt');
const caPath = path.resolve(certsDir, process.env.ROOT_CA_PATH || 'AmazonRootCA1.pem');

checkFile(keyPath, 'Private Key');
checkFile(certPath, 'Certificate');
checkFile(caPath, 'Root CA');

let sent = 0;
let acked = 0;
function generateHelmetData(id) {
  const lat = 6.9271 + (Math.random() * 0.01 - 0.005);
  const lon = 79.8612 + (Math.random() * 0.01 - 0.005);

  const motionTypes = ["Walking", "Running", "Stationary", "No Motion", "Cycling"];
  const batteryStatus = ["Excellent", "Good", "Fair", "Low"];

  return {
    id: `Helmet_${id}`,
    temp: parseFloat((25 + Math.random() * 10).toFixed(1)),
    hum: parseFloat((40 + Math.random() * 30).toFixed(1)),
    acc: parseFloat((Math.random() * 10).toFixed(2)),
    gyr: parseFloat((Math.random() * 10).toFixed(2)),
    bpm: Math.random() < 0.1 ? 0.0 : parseFloat((60 + Math.random() * 60).toFixed(1)), // simulate occasional failure
    loc: [parseFloat(lat.toFixed(6)), parseFloat(lon.toFixed(6))],
    gas: parseFloat((Math.random() * 5).toFixed(2)),
    typ: motionTypes[Math.floor(Math.random() * motionTypes.length)],
    btn: Math.random() < 0.05, // 5% chance button is pressed
    imp: Math.random() < 0.02 ? "yes" : "no", // 2% impact chance
    fall: Math.random() < 0.01, // 1% fall detection
    floor: Math.floor(Math.random() * 5), // 0 to 4 floors
    alt: parseFloat((Math.random() * 100).toFixed(2)),
    battery: {
      percentage: Math.floor(Math.random() * 100),
      status: batteryStatus[Math.floor(Math.random() * batteryStatus.length)]
    },
    timestamp: Date.now()
  };
}


function simulateHelmet(id, publishInterval) {
  const clientId = `helmet-${id}-${Math.floor(Math.random() * 10000)}`;

  const device = awsIot.device({
    keyPath,
    certPath,
    caPath,
    clientId,
    host: process.env.AWS_IOT_ENDPOINT,
    protocol: 'mqtts',
    port: 8883,
  });

  device.on('connect', () => {
    setInterval(() => {
      const data = generateHelmetData(id);
      sent++;
      device.publish('helmet/data', JSON.stringify(data), { qos: 1 }, (err) => {
        if (!err) acked++;
      });
    }, publishInterval);
  });

  device.on('error', (err) => {
    console.error(`❌ Helmet ${id} error:`, err.message);
  });
}

function startStage(stage, delay = 0) {
  console.log(`\n🚀 Starting Stage: ${stage.label} (${stage.deviceCount} devices @ ${stage.interval}ms)\n`);
  for (let i = 1; i <= stage.deviceCount; i++) {
    setTimeout(() => simulateHelmet(i, stage.interval), i * 50 + delay);
  }
}

function runStages() {
  let totalDelay = 0;
  for (const stage of STAGES) {
    setTimeout(() => startStage(stage), totalDelay);
    totalDelay += stage.deviceCount * 50 + 15000;
  }
}

setInterval(() => {
  const lost = sent - acked;
  console.log(`📊 Stats – Sent: ${sent}, ACKed: ${acked}, Lost: ${lost}`);
}, 10000);

runStages();
