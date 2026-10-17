import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  ScanLine,
  Users,
  UserCheck,
  Ticket,
  Plus,
  Search,
  QrCode,
  ArrowUpRight,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";
import "./App.css";

const initialAttendees = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@example.com",
    passCode: "GP-A83F21D9",
    checkedIn: true,
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@example.com",
    passCode: "GP-B72C19E4",
    checkedIn: false,
  },
  {
    id: 3,
    name: "Rohan Deshmukh",
    email: "rohan@example.com",
    passCode: "GP-C91A47F2",
    checkedIn: false,
  },
];

function App() {
  const [attendees, setAttendees] = useState(initialAttendees);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [notice, setNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkedInCount = attendees.filter(
    (attendee) => attendee.checkedIn
  ).length;

  const remainingCount = attendees.length - checkedInCount;

  const filteredAttendees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attendees.filter(
      (attendee) =>
        attendee.name.toLowerCase().includes(query) ||
        attendee.email.toLowerCase().includes(query) ||
        attendee.passCode.toLowerCase().includes(query)
    );
  }, [attendees, search]);

  function handleRegister(event) {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setNotice("Please enter the attendee's name and email.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setNotice("Please enter a valid email address.");
      return;
    }

    if (
      attendees.some(
        (attendee) => attendee.email.toLowerCase() === normalizedEmail
      )
    ) {
      setNotice("This email is already registered.");
      return;
    }

    const passCode = `GP-${crypto.randomUUID()
      .replaceAll("-", "")
      .slice(0, 8)
      .toUpperCase()}`;

    const newAttendee = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passCode,
      checkedIn: false,
    };

    setAttendees((current) => [newAttendee, ...current]);
    setName("");
    setEmail("");
    setNotice("Attendee registered successfully!");
  }

  function handleCheckIn(attendeeId) {
    const attendee = attendees.find((item) => item.id === attendeeId);

    if (!attendee) return;

    if (attendee.checkedIn) {
      setNotice(`${attendee.name} has already checked in.`);
      return;
    }

    setAttendees((current) =>
      current.map((item) =>
        item.id === attendeeId ? { ...item, checkedIn: true } : item
      )
    );

    setNotice(`${attendee.name} checked in successfully!`);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <QrCode size={23} />
          </div>
          <div>
            <h1>GatePass</h1>
            <span>EVENT MANAGEMENT</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${
              activePage === "Dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("Dashboard");
              setMobileMenuOpen(false);
            }}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === "Check-In" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("Check-In");
              setMobileMenuOpen(false);
            }}
          >
            <ScanLine size={19} />
            Check-In
          </button>
        </nav>

        <div className="sidebar-event">
          <div className="event-icon">
            <CalendarDays size={20} />
          </div>
          <div>
            <strong>Tech Connect 2026</strong>
            <span>Sample event</span>
          </div>
          <span className="event-dot" />
        </div>

        <div className="sidebar-footer">
          <div className="avatar">GP</div>
          <div>
            <strong>Event Organizer</strong>
            <span>Organizer workspace</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="live-dot" />
            <span>Event dashboard</span>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">EVENT OVERVIEW</div>
              <h2>
                {activePage === "Dashboard"
                  ? "Good to see you."
                  : "Event Check-In"}
              </h2>
              <p>
                {activePage === "Dashboard"
                  ? "Manage registrations and keep your event running smoothly."
                  : "Verify attendee passes and manage entry at the door."}
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                document.getElementById("registration-form")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
            >
              <Plus size={18} />
              Add attendee
            </button>
          </section>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button
                className="icon-button"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="stats-grid">
            <StatCard
              label="Total Registered"
              value={attendees.length}
              detail="All event registrations"
              icon={<Users size={21} />}
              variant="blue"
            />
            <StatCard
              label="Checked In"
              value={checkedInCount}
              detail="Successfully admitted"
              icon={<UserCheck size={21} />}
              variant="green"
            />
            <StatCard
              label="Awaiting Entry"
              value={remainingCount}
              detail="Not checked in yet"
              icon={<Ticket size={21} />}
              variant="orange"
            />
          </section>

          <div className="content-grid">
            <section className="panel registration-panel" id="registration-form">
              <div className="panel-heading">
                <div>
                  <h3>Register attendee</h3>
                  <p>Add a guest to your event.</p>
                </div>
                <div className="heading-icon">
                  <Plus size={20} />
                </div>
              </div>

              <form onSubmit={handleRegister} className="registration-form">
                <label htmlFor="attendee-name">Full name</label>
                <input
                  id="attendee-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                />

                <label htmlFor="attendee-email">Email address</label>
                <input
                  id="attendee-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                />

                <button type="submit" className="primary-button full-button">
                  <Plus size={18} />
                  Register attendee
                </button>

                <p className="form-note">
                  <QrCode size={15} />
                  A unique pass code will be issued.
                </p>
              </form>
            </section>

            <section className="panel attendee-panel">
              <div className="panel-heading attendee-heading">
                <div>
                  <h3>Attendee registrations</h3>
                  <p>Manage registered event guests.</p>
                </div>
                <span className="count-pill">
                  {attendees.length} attendees
                </span>
              </div>

              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email or pass..."
                  aria-label="Search attendees"
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ATTENDEE</th>
                      <th>PASS CODE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendees.map((attendee) => (
                      <tr key={attendee.id}>
                        <td>
                          <div className="attendee-cell">
                            <div className="attendee-avatar">
                              {attendee.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <strong>{attendee.name}</strong>
                              <span>{attendee.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code>{attendee.passCode}</code>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              attendee.checkedIn ? "status-checked" : "status-pending"
                            }`}
                          >
                            <span />
                            {attendee.checkedIn ? "Checked in" : "Pending"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="table-action"
                            onClick={() => handleCheckIn(attendee.id)}
                            title="Demo check-in"
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredAttendees.length === 0 && (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          No attendees found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  Showing {filteredAttendees.length} of {attendees.length}{" "}
                  attendees
                </span>
                <span className="footer-indicator">
                  <span className="live-dot" />
                  Updated locally
                </span>
              </div>
            </section>
          </div>

          <footer className="page-footer">
            <span>GatePass · Event operations made simpler</span>
            <span>Built for Tech Connect 2026</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, detail, icon, variant }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${variant}`}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </article>
  );
}

export default App;

