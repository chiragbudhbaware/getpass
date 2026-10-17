
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  X,
  Download,
  CheckCircle,
  Clock,
  Ticket,
} from "lucide-react";

function QRPass({ attendee, onClose }) {
  const qrRef = useRef(null);
  const [downloaded, setDownloaded] = useState(false);

  if (!attendee) return null;

  // Match the field names returned by FastAPI
  const passCode = attendee.pass_code;
  const isCheckedIn = Boolean(attendee.checked_in);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) {
      return;
    }

    // Create a white background for a clean PNG image
    const outputCanvas = document.createElement("canvas");
    const padding = 32;

    outputCanvas.width = canvas.width + padding * 2;
    outputCanvas.height = canvas.height + padding * 2;

    const context = outputCanvas.getContext("2d");

    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    );

    context.drawImage(canvas, padding, padding);

    const link = document.createElement("a");
    link.download = `GatePass-${passCode}.png`;
    link.href = outputCanvas.toDataURL("image/png");
    link.click();

    setDownloaded(true);
  };

  return (
    <div
      className="qr-modal-overlay"
      onClick={onClose}
    >
      <section
        className="qr-pass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-pass-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="qr-modal-close"
          onClick={onClose}
          aria-label="Close QR pass"
        >
          <X size={21} />
        </button>

        <div className="qr-pass-header">
          <div className="qr-pass-logo">
            <Ticket size={23} />
          </div>

          <div>
            <h2 id="qr-pass-title">GatePass</h2>
            <p>EVENT ADMISSION PASS</p>
          </div>
        </div>

        <div className="qr-pass-event">
          <span>EVENT TICKET</span>
          <h3>Tech Connect 2026</h3>
          <p>Present this QR code at the entrance.</p>
        </div>

        <div className="qr-code-frame" ref={qrRef}>
          <QRCodeCanvas
            value={passCode}
            size={220}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#172554"
          />
        </div>

        <div className="qr-pass-attendee">
          <span>ATTENDEE NAME</span>
          <h3>{attendee.name}</h3>
          <p>{attendee.email}</p>
        </div>

        <div className="qr-pass-code">
          <span>UNIQUE PASS CODE</span>
          <strong>{passCode}</strong>
        </div>

        <div
          className={`qr-pass-status ${
            isCheckedIn ? "qr-status-checked" : "qr-status-pending"
          }`}
        >
          {isCheckedIn ? (
            <CheckCircle size={17} />
          ) : (
            <Clock size={17} />
          )}

          {isCheckedIn ? "Already checked in" : "Valid for check-in"}
        </div>

        <button
          type="button"
          className="qr-download-button"
          onClick={handleDownload}
        >
          <Download size={18} />
          {downloaded ? "Download Again" : "Download QR Code"}
        </button>

        <p className="qr-pass-footer">
          Keep your pass code private. Each pass is unique to its attendee.
        </p>
      </section>
    </div>
  );
}

export default QRPass;
