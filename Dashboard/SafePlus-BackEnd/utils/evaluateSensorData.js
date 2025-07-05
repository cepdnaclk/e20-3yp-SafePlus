const gasAlertTypes = ["CO", "LPG", "Smoke"];
const impactAlertTypes = ["mild", "moderate", "severe"];

function evaluateSensorData(data) {
  const alertReasons = [];

  const bpm = Number(data.bpm);
  const gas = Number(data.gas);
  const temp = Number(data.temp);
  const hum = Number(data.hum);
  const typ = data.typ;
  const imp = data.imp;
  const fall = data.fall;
  const btn = data.btn;

  const status = {
    bpmStatus: "normal",
    gasStatus: "safe",
    impactStatus: "none",
    tempStatus: "normal",
    fallStatus: "safe",
    btnStatus: "none",
  };

  if (bpm > 120) {
    status.bpmStatus = "high";
    alertReasons.push("High BPM");
  }

  if (gas > 300 || gasAlertTypes.includes(typ)) {
    status.gasStatus = "danger";
    alertReasons.push(`Gas Alert: ${typ || "Unknown type"}`);
  }

  if (impactAlertTypes.includes(imp)) {
    status.impactStatus = "warning";
    alertReasons.push(`Impact: ${imp}`);
  }

  if (temp > 37) {
    status.tempStatus = "danger";
    alertReasons.push("High Temperature");
  }

  if (fall) {
    status.fallStatus = "detected";
    alertReasons.push("Fall Detected");
  }

  if (btn) {
    status.btnStatus = "pressed";
    alertReasons.push("SOS Button Pressed");
  }

  status.overallAlert = alertReasons.length > 0;
  status.alertReasons = alertReasons;

  return {
    ...data,
    ...status,
    bpm,
    gas,
    temp,
    hum,
  };
}

module.exports = evaluateSensorData;
