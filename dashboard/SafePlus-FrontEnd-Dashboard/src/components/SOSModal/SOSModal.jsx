// File: components/SOSModal.jsx
import "./SOSModal.css";

export default function SOSModal({ onClose, onSelect }) {
  return (
    <div className="sos-modal-backdrop">
      <div className="sos-modal-box">
        <h2>Send SOS Alert</h2>
        <p>Who should receive the alert?</p>
        <div className="sos-modal-buttons">
          <button onClick={() => onSelect("worker")}>🚨 Alert This Worker</button>
          <button onClick={() => onSelect("group")}>👥 Alert Group Around</button>
        </div>
        <button className="sos-close-btn" onClick={onClose}>✖</button>
      </div>
    </div>
  );
}
