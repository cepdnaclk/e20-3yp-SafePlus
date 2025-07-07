const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

console.log("✅ ENV values:");
console.log("  PRIVATE_KEY_PATH:", process.env.PRIVATE_KEY_PATH);
console.log("  CERTIFICATE_PATH:", process.env.CERTIFICATE_PATH);
console.log("  ROOT_CA_PATH:", process.env.ROOT_CA_PATH);
console.log("  AWS_IOT_ENDPOINT:", process.env.AWS_IOT_ENDPOINT);

module.exports = {
  iot: {
    keyPath: path.resolve(__dirname, process.env.PRIVATE_KEY_PATH),
    certPath: path.resolve(__dirname, process.env.CERTIFICATE_PATH),
    caPath: path.resolve(__dirname, process.env.ROOT_CA_PATH),
    clientId: "multiHelmetSimulator",
    host: process.env.AWS_IOT_ENDPOINT,  // ✅ Should now be defined
  },
  simulation: {
    topic: 'helmet/data',
    helmetCount: 10,
    intervalMs: 5000
  }
};
