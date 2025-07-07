function generateHelmetBatch(count) {
  const helmets = [];
  for (let i = 0; i < count; i++) {
    helmets.push({
      id: `Helmet_${(i + 1).toString()}`,
      bpm: randomInt(80, 140),
      gas: randomInt(100, 600),
      typ: ["none", "CO", "LPG", "Smoke"][Math.floor(Math.random() * 4)],
      imp: ["no", "mild", "moderate", "severe"][Math.floor(Math.random() * 4)],
      temp: parseFloat((Math.random() * 4 + 35).toFixed(1)),
      hum: randomInt(30, 80),
      fall: Math.random() < 0.2,
      btn: Math.random() < 0.1
    });
  }
  return helmets;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { generateHelmetBatch };
