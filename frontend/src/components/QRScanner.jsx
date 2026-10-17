import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  CheckCircle,
  AlertCircle,
  ScanLine,
  Search,
  RotateCcw,
} from "lucide-react";
import { checkInAttendee } from "../services/api";

function QRScanner({ onCheckedIn }) {
  const [passCode, setPassCode] = useState("");
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Prevent repeated camera detections from overwriting the current pass.
  const scanLocked = useRef(false);

useEffect(() => {
  let scanner;
  let disposed = false;

  async function initializeScanner() {
    const reader = document.getElementById("gatepass-qr-reader");

    if (!reader) return;

    reader.innerHTML = "";

    try {
      // Check whether a camera is available and permission is granted.
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });

      if (disposed) return;

      scanner = new Html5QrcodeScanner(
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
          if (disposed || scanLocked.current) return;

          scanLocked.current = true;
          setPassCode(decodedText.trim());
          setResult({
            type: "info",
            message: "QR code detected. Verify the pass to continue.",
          });
        },
        () => {
          // Ignore frames without a QR code.
        }
      );
    } catch (error) {
      console.error("Camera initialization failed:", error);

      setResult({
        type: "error",
        message:
          error.name === "NotAllowedError"
            ? "Camera permission is blocked. Allow camera access in your browser settings."
            : error.name === "NotFoundError"
              ? "No camera was found. You can still enter a pass code manually."
              : "Could not start the camera. Check browser permissions and try again.",
      });
    }
  }

  initializeScanner();

  return () => {
    disposed = true;

    if (scanner) {
      scanner.clear().catch((error) => {
        console.warn("Scanner cleanup:", error);
      });
    }
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

    if (verifying) return;

    setVerifying(true);
    setResult(null);

    try {
      const response = await checkInAttendee(code);

      setResult({
        type: "success",
        message: response.message || "Check-in successful!",
        attendee: response.attendee,
      });

      // Refresh attendee records and dashboard statistics.
      if (onCheckedIn) {
        await onCheckedIn();
      }
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      let message = "Unable to verify the pass. Please try again.";

      if (status === 404) {
        message = "Invalid pass code. No attendee was found.";
      } else if (status === 409) {
        message = "This attendee has already checked in.";
      } else if (!error.response) {
        message =
          "Cannot reach the backend. Check that FastAPI is running.";
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

  function resetScannerForm() {
    scanLocked.current = false;
    setPassCode("");
    setResult(null);
  }

  return (
    <section className="scanner-page">
      <div className="scanner-heading">
        <div className="scanner-heading-icon">
          <ScanLine size={24} />
        </div>

        <div>
          <h2>Event Check-In</h2>
          <p>
            Scan an attendee's QR pass or enter the pass code manually.
          </p>
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
            Keep the entire QR code inside the scanning box.
          </p>
        </div>

        <div className="panel manual-checkin-panel">
          <div className="manual-heading-icon">
            <Search size={21} />
          </div>

          <h3>Verify Pass</h3>

          <p className="scanner-description">
            Enter the unique pass code printed on the attendee's ticket,
            or scan the QR code.
          </p>

          <form
            onSubmit={verifyPass}
            className="manual-checkin-form"
          >
            <label htmlFor="pass-code-input">
              Unique pass code
            </label>

            <input
              id="pass-code-input"
              value={passCode}
              onChange={(event) => {
                setPassCode(event.target.value);
                setResult(null);
                scanLocked.current = true;
              }}
              placeholder="Enter or scan a pass code"
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
              aria-live="polite"
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
                      ? "QR code detected"
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

          <button
            type="button"
            className="scanner-reset-button"
            onClick={resetScannerForm}
            disabled={verifying}
          >
            <RotateCcw size={16} />
            Scan Another Pass
          </button>
        </div>
      </div>
    </section>
  );
}

export default QRScanner;
