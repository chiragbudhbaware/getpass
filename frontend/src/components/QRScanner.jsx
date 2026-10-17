
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, AlertCircle, ScanLine, Search } from "lucide-react";
import { checkInAttendee } from "../services/api";

function QRScanner({ onCheckedIn }) {
  const [passCode, setPassCode] = useState("");
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "gatepass-qr-reader",
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Stop repeated scans while the user reviews the result.
        scanner.pause(true);
        setPassCode(decodedText.trim());
        setResult({
          type: "info",
          message: "QR code detected. Click Verify Pass to continue.",
        });
      },
      () => {
        // Ignore normal camera frames that do not contain a QR code.
      }
    );

    return () => {
      scanner.clear().catch((error) => {
        console.warn("Scanner cleanup:", error);
      });
    };
  }, []);

  async function verifyPass(event) {
    event.preventDefault();

    const code = passCode.trim();

    if (!code) {
      setResult({
        type: "error",
        message: "Scan a QR code or enter a pass code first.",
      });
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const response = await checkInAttendee(code);

      setResult({
        type: "success",
        message: response.message || "Check-in successful!",
        attendee: response.attendee,
      });

      if (onCheckedIn) {
        await onCheckedIn();
      }
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      let message = "Unable to verify this pass. Please try again.";

      if (status === 404) {
        message = "Invalid pass code. No attendee was found.";
      } else if (status === 409) {
        message = "This attendee has already checked in.";
      } else if (!error.response) {
        message = "Cannot reach the backend. Check that FastAPI is running.";
      } else if (typeof detail === "string") {
        message = detail;
      }

      setResult({
        type: "error",
        message,
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="scanner-page">
      <div className="scanner-heading">
        <div className="scanner-heading-icon">
          <ScanLine size={24} />
        </div>

        <div>
          <h2>Event Check-In</h2>
          <p>Scan an attendee's QR pass or enter the pass code manually.</p>
        </div>
      </div>

      <div className="scanner-layout">
        <div className="panel scanner-panel">
          <h3>Scan QR Code</h3>
          <p className="scanner-description">
            Allow camera access when your browser asks for permission.
          </p>

          <div id="gatepass-qr-reader" />

          <p className="scanner-help">
            Tip: Ensure the entire QR code is visible inside the scanning box.
          </p>
        </div>

        <div className="panel manual-checkin-panel">
          <div className="manual-heading-icon">
            <Search size={21} />
          </div>

          <h3>Verify Pass</h3>
          <p className="scanner-description">
            Alternatively, enter the unique pass code printed on the attendee's
            ticket.
          </p>

          <form onSubmit={verifyPass} className="manual-checkin-form">
            <label htmlFor="pass-code-input">Unique pass code</label>

            <input
              id="pass-code-input"
              value={passCode}
              onChange={(event) => setPassCode(event.target.value)}
              placeholder="e.g. GP-07F3478C"
              autoComplete="off"
              required
            />

            <button
              type="submit"
              className="primary-button full-button"
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify and Check In"}
            </button>
          </form>

          {result && (
            <div
              className={`scanner-result scanner-result-${result.type}`}
              role="status"
            >
              {result.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}

              <div>
                <strong>
                  {result.type === "success"
                    ? "Check-in successful"
                    : result.type === "info"
                      ? "QR detected"
                      : "Check-in failed"}
                </strong>

                <p>{result.message}</p>

                {result.attendee && (
                  <p>
                    Attendee: <strong>{result.attendee.name}</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default QRScanner;
