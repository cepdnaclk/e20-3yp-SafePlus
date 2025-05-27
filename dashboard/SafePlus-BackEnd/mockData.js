// mockData.js
const sampleData = [
  {
    temperature: 36.5,
    humidity: 45,
    acc_magnitude: 0.5,
    gyro_magnitude: 0.3,
    heart_rate: 5,
    gasvalues: 300,
    button: false,
    impact: "none",
    location: { lat: 6.9271, lng: 79.8612 },
    timestamp: new Date()
  },
  {
    temperature: 30.0,
    humidity: 50,
    acc_magnitude: 0.7,
    gyro_magnitude: 0.5,
    heart_rate: 78,
    gasvalues: 350,
    button: true,
    impact: "minor",
    location: { lat: 6.9275, lng: 79.8620 },
    timestamp: new Date(Date.now() - 60000)
  },
  {
    temperature: 35.0,
    humidity: 50,
    acc_magnitude: 0.75,
    gyro_magnitude: 0.5,
    heart_rate: 79,
    gasvalues: 350,
    button: false,
    impact: "minor",
    location: { lat: 6.9275, lng: 79.8620 },
    timestamp: new Date(Date.now() - 120000)
  },
  // add more entries here
];

module.exports = sampleData;
