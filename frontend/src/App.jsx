// import { useCallback, useEffect, useMemo, useState } from "react";
// import QRPass from "./components/QRPass";
// import {
//   LayoutDashboard,
//   ScanLine,
//   Users,
//   UserCheck,
//   Ticket,
//   Plus,
//   Search,
//   QrCode,
//   ArrowUpRight,
//   CalendarDays,
//   Menu,
//   X,
// } from "lucide-react";
// import {
//   getAttendees,
//   createAttendee,
//   getStats,
//   checkInAttendee,
// } from "./services/api";
// import "./App.css";

// function App() {
//   const [attendees, setAttendees] = useState([]);
//   const [stats, setStats] = useState({
//     total_registered: 0,
//     checked_in: 0,
//     remaining: 0,
//   });

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [search, setSearch] = useState("");
//   const [activePage, setActivePage] = useState("Dashboard");
//   const [notice, setNotice] = useState("");
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [checkingInId, setCheckingInId] = useState(null);

//   const filteredAttendees = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return attendees.filter(
//       (attendee) =>
//         attendee.name.toLowerCase().includes(query) ||
//         attendee.email.toLowerCase().includes(query) ||
//         attendee.pass_code.toLowerCase().includes(query)
//     );
//   }, [attendees, search]);

//   const refreshDashboard = useCallback(async () => {
//     try {
//       const [attendeeData, statsData] = await Promise.all([
//         getAttendees(),
//         getStats(),
//       ]);

//       setAttendees(attendeeData);
//       setStats(statsData);
//     } catch (error) {
//       console.error("Dashboard loading failed:", error);

//       setNotice(
//         "Unable to load dashboard. Make sure the FastAPI server is running."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     refreshDashboard();
//   }, [refreshDashboard]);

//   async function handleRegister(event) {
//     event.preventDefault();

//     if (submitting) return;

//     const normalizedName = name.trim();
//     const normalizedEmail = email.trim().toLowerCase();

//     if (normalizedName.length < 2) {
//       setNotice("Name must contain at least 2 characters.");
//       return;
//     }

//     if (!normalizedEmail) {
//       setNotice("Please enter an email address.");
//       return;
//     }

//     setSubmitting(true);
//     setNotice("");

//     try {
//       const attendee = await createAttendee({
//         name: normalizedName,
//         email: normalizedEmail,
//       });

//       setName("");
//       setEmail("");

//       await refreshDashboard();

//       setNotice(
//         `Attendee registered successfully! Pass: ${attendee.pass_code}`
//       );
//     } catch (error) {
//       console.error("Registration failed:", error);

//       const detail = error.response?.data?.detail;

//       let message = "Registration failed. Please try again.";

//       if (error.response?.status === 409) {
//         message = "This email is already registered.";
//       } else if (typeof detail === "string") {
//         message = detail;
//       } else if (error.request && !error.response) {
//         message = "Cannot reach the backend. Check that FastAPI is running.";
//       }

//       setNotice(message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   async function handleCheckIn(attendeeId) {
//     if (checkingInId !== null) return;

//     const attendee = attendees.find(
//       (item) => item.id === attendeeId
//     );

//     if (!attendee) return;

//     if (attendee.checked_in) {
//       setNotice(`${attendee.name} has already checked in.`);
//       return;
//     }

//     setCheckingInId(attendeeId);
//     setNotice("");

//     try {
//       const result = await checkInAttendee(attendee.pass_code);

//       await refreshDashboard();

//       setNotice(
//         result.message || `${attendee.name} checked in successfully!`
//       );
//     } catch (error) {
//       console.error("Check-in failed:", error);

//       const detail = error.response?.data?.detail;

//       setNotice(
//         typeof detail === "string"
//           ? detail
//           : "Check-in failed. Please try again."
//       );

//       await refreshDashboard();
//     } finally {
//       setCheckingInId(null);
//     }
//   }

//   return (
//     <div className="app-shell">
//       <aside
//         className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
//       >
//         <div className="brand">
//           <div className="brand-mark">
//             <QrCode size={23} />
//           </div>

//           <div>
//             <h1>GatePass</h1>
//             <span>EVENT MANAGEMENT</span>
//           </div>

//           <button
//             className="icon-button mobile-close"
//             onClick={() => setMobileMenuOpen(false)}
//             aria-label="Close menu"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="sidebar-label">WORKSPACE</div>

//         <nav className="sidebar-nav">
//           <button
//             className={`nav-item ${
//               activePage === "Dashboard" ? "active" : ""
//             }`}
//             onClick={() => {
//               setActivePage("Dashboard");
//               setMobileMenuOpen(false);
//             }}
//           >
//             <LayoutDashboard size={19} />
//             Dashboard
//           </button>

//           <button
//             className={`nav-item ${
//               activePage === "Check-In" ? "active" : ""
//             }`}
//             onClick={() => {
//               setActivePage("Check-In");
//               setMobileMenuOpen(false);
//             }}
//           >
//             <ScanLine size={19} />
//             Check-In
//           </button>
//         </nav>

//         <div className="sidebar-event">
//           <div className="event-icon">
//             <CalendarDays size={20} />
//           </div>

//           <div>
//             <strong>Tech Connect 2026</strong>
//             <span>Sample event</span>
//           </div>

//           <span className="event-dot" />
//         </div>

//         <div className="sidebar-footer">
//           <div className="avatar">GP</div>

//           <div>
//             <strong>Event Organizer</strong>
//             <span>Organizer workspace</span>
//           </div>
//         </div>
//       </aside>

//       <main className="main-content">
//         <header className="topbar">
//           <button
//             className="icon-button mobile-menu"
//             onClick={() => setMobileMenuOpen(true)}
//             aria-label="Open menu"
//           >
//             <Menu size={21} />
//           </button>

//           <div className="breadcrumb">
//             Workspace <span>/</span>{" "}
//             <strong>{activePage}</strong>
//           </div>

//           <div className="topbar-right">
//             <span className="live-dot" />
//             <span>Event dashboard</span>
//           </div>
//         </header>

//         <div className="page-content">
//           <section className="page-heading">
//             <div>
//               <div className="eyebrow">EVENT OVERVIEW</div>

//               <h2>
//                 {activePage === "Dashboard"
//                   ? "Good to see you."
//                   : "Event Check-In"}
//               </h2>

//               <p>
//                 {activePage === "Dashboard"
//                   ? "Manage registrations and keep your event running smoothly."
//                   : "Verify attendee passes and manage entry at the door."}
//               </p>
//             </div>

//             <button
//               className="primary-button"
//               onClick={() =>
//                 document
//                   .getElementById("registration-form")
//                   ?.scrollIntoView({
//                     behavior: "smooth",
//                     block: "center",
//                   })
//               }
//             >
//               <Plus size={18} />
//               Add attendee
//             </button>
//           </section>

//           {notice && (
//             <div className="notice" role="status">
//               <span>{notice}</span>

//               <button
//                 className="icon-button"
//                 onClick={() => setNotice("")}
//                 aria-label="Dismiss notification"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//           )}

//           <section className="stats-grid">
//             <StatCard
//               label="Total Registered"
//               value={stats.total_registered}
//               detail="All event registrations"
//               icon={<Users size={21} />}
//               variant="blue"
//             />

//             <StatCard
//               label="Checked In"
//               value={stats.checked_in}
//               detail="Successfully admitted"
//               icon={<UserCheck size={21} />}
//               variant="green"
//             />

//             <StatCard
//               label="Awaiting Entry"
//               value={stats.remaining}
//               detail="Not checked in yet"
//               icon={<Ticket size={21} />}
//               variant="orange"
//             />
//           </section>

//           <div className="content-grid">
//             <section
//               className="panel registration-panel"
//               id="registration-form"
//             >
//               <div className="panel-heading">
//                 <div>
//                   <h3>Register attendee</h3>
//                   <p>Add a guest to your event.</p>
//                 </div>

//                 <div className="heading-icon">
//                   <Plus size={20} />
//                 </div>
//               </div>

//               <form
//                 onSubmit={handleRegister}
//                 className="registration-form"
//               >
//                 <label htmlFor="attendee-name">Full name</label>

//                 <input
//                   id="attendee-name"
//                   value={name}
//                   onChange={(event) => setName(event.target.value)}
//                   placeholder="e.g. Aarav Sharma"
//                   minLength={2}
//                   maxLength={100}
//                   required
//                 />

//                 <label htmlFor="attendee-email">Email address</label>

//                 <input
//                   id="attendee-email"
//                   type="email"
//                   value={email}
//                   onChange={(event) => setEmail(event.target.value)}
//                   placeholder="name@example.com"
//                   required
//                 />

//                 <button
//                   type="submit"
//                   className="primary-button full-button"
//                   disabled={submitting}
//                 >
//                   <Plus size={18} />
//                   {submitting
//                     ? "Registering..."
//                     : "Register attendee"}
//                 </button>

//                 <p className="form-note">
//                   <QrCode size={15} />
//                   A unique pass code will be issued.
//                 </p>
//               </form>
//             </section>

//             <section className="panel attendee-panel">
//               <div className="panel-heading attendee-heading">
//                 <div>
//                   <h3>Attendee registrations</h3>
//                   <p>Manage registered event guests.</p>
//                 </div>

//                 <span className="count-pill">
//                   {stats.total_registered} attendees
//                 </span>
//               </div>

//               <div className="search-box">
//                 <Search size={18} />

//                 <input
//                   value={search}
//                   onChange={(event) => setSearch(event.target.value)}
//                   placeholder="Search name, email or pass..."
//                   aria-label="Search attendees"
//                 />
//               </div>

//               <div className="table-wrap">
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>ATTENDEE</th>
//                       <th>PASS CODE</th>
//                       <th>STATUS</th>
//                       <th>ACTION</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {loading && (
//                       <tr>
//                         <td colSpan="4" className="empty-state">
//                           Loading attendees...
//                         </td>
//                       </tr>
//                     )}

//                     {!loading &&
//                       filteredAttendees.map((attendee) => (
//                         <tr key={attendee.id}>
//                           <td>
//                             <div className="attendee-cell">
//                               <div className="attendee-avatar">
//                                 {attendee.name
//                                   .split(" ")
//                                   .map((part) => part[0])
//                                   .slice(0, 2)
//                                   .join("")
//                                   .toUpperCase()}
//                               </div>

//                               <div>
//                                 <strong>{attendee.name}</strong>
//                                 <span>{attendee.email}</span>
//                               </div>
//                             </div>
//                           </td>

//                           <td>
//                             <code>{attendee.pass_code}</code>
//                           </td>

//                           <td>
//                             <span
//                               className={`status-badge ${
//                                 attendee.checked_in
//                                   ? "status-checked"
//                                   : "status-pending"
//                               }`}
//                             >
//                               <span />
//                               {attendee.checked_in
//                                 ? "Checked in"
//                                 : "Pending"}
//                             </span>
//                           </td>

//                           <td>
//                             <button
//                               className="table-action"
//                               onClick={() =>
//                                 handleCheckIn(attendee.id)
//                               }
//                               disabled={
//                                 attendee.checked_in ||
//                                 checkingInId !== null
//                               }
//                               title={
//                                 attendee.checked_in
//                                   ? "Already checked in"
//                                   : "Check in attendee"
//                               }
//                             >
//                               <ArrowUpRight size={16} />
//                             </button>
//                           </td>
//                         </tr>
//                       ))}

//                     {!loading &&
//                       filteredAttendees.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan="4"
//                             className="empty-state"
//                           >
//                             {search.trim()
//                               ? "No matching attendees found."
//                               : "No attendees registered yet. Add your first attendee."}
//                           </td>
//                         </tr>
//                       )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="table-footer">
//                 <span>
//                   Showing {filteredAttendees.length} of{" "}
//                   {attendees.length} attendees
//                 </span>

//                 <span className="footer-indicator">
//                   <span className="live-dot" />
//                   Connected to API
//                 </span>
//               </div>
//             </section>
//           </div>

//           <footer className="page-footer">
//             <span>GatePass · Event operations made simpler</span>
//             <span>Built for Tech Connect 2026</span>
//           </footer>
//         </div>
//       </main>
//     </div>
//   );
// }

// function StatCard({ label, value, detail, icon, variant }) {
//   return (
//     <article className="stat-card">
//       <div className="stat-top">
//         <span>{label}</span>
//         <div className={`stat-icon ${variant}`}>{icon}</div>
//       </div>

//       <div className="stat-value">{value}</div>
//       <div className="stat-detail">{detail}</div>
//     </article>
//   );
// }

// export default App;



import { useCallback, useEffect, useMemo, useState } from "react";
import QRPass from "./components/QRPass";
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
import {
  getAttendees,
  createAttendee,
  getStats,
  checkInAttendee,
} from "./services/api";
import "./App.css";

function App() {
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState({
    total_registered: 0,
    checked_in: 0,
    remaining: 0,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [notice, setNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingInId, setCheckingInId] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);

  const filteredAttendees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attendees.filter(
      (attendee) =>
        attendee.name.toLowerCase().includes(query) ||
        attendee.email.toLowerCase().includes(query) ||
        attendee.pass_code.toLowerCase().includes(query)
    );
  }, [attendees, search]);

  const refreshDashboard = useCallback(async () => {
    try {
      const [attendeeData, statsData] = await Promise.all([
        getAttendees(),
        getStats(),
      ]);

      setAttendees(attendeeData);
      setStats(statsData);
    } catch (error) {
      console.error("Dashboard loading failed:", error);

      setNotice(
        "Unable to load dashboard. Make sure the FastAPI server is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  async function handleRegister(event) {
    event.preventDefault();

    if (submitting) return;

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setNotice("Name must contain at least 2 characters.");
      return;
    }

    if (!normalizedEmail) {
      setNotice("Please enter an email address.");
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      const attendee = await createAttendee({
        name: normalizedName,
        email: normalizedEmail,
      });

      setName("");
      setEmail("");

      await refreshDashboard();

      setNotice(
        `Attendee registered successfully! Pass: ${attendee.pass_code}`
      );
    } catch (error) {
      console.error("Registration failed:", error);

      const detail = error.response?.data?.detail;

      let message = "Registration failed. Please try again.";

      if (error.response?.status === 409) {
        message = "This email is already registered.";
      } else if (typeof detail === "string") {
        message = detail;
      } else if (error.request && !error.response) {
        message = "Cannot reach the backend. Check that FastAPI is running.";
      }

      setNotice(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckIn(attendeeId) {
    if (checkingInId !== null) return;

    const attendee = attendees.find(
      (item) => item.id === attendeeId
    );

    if (!attendee) return;

    if (attendee.checked_in) {
      setNotice(`${attendee.name} has already checked in.`);
      return;
    }

    setCheckingInId(attendeeId);
    setNotice("");

    try {
      const result = await checkInAttendee(attendee.pass_code);

      await refreshDashboard();

      setNotice(
        result.message || `${attendee.name} checked in successfully!`
      );
    } catch (error) {
      console.error("Check-in failed:", error);

      const detail = error.response?.data?.detail;

      setNotice(
        typeof detail === "string"
          ? detail
          : "Check-in failed. Please try again."
      );

      await refreshDashboard();
    } finally {
      setCheckingInId(null);
    }
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}
      >
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
                document
                  .getElementById("registration-form")
                  ?.scrollIntoView({
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
              value={stats.total_registered}
              detail="All event registrations"
              icon={<Users size={21} />}
              variant="blue"
            />

            <StatCard
              label="Checked In"
              value={stats.checked_in}
              detail="Successfully admitted"
              icon={<UserCheck size={21} />}
              variant="green"
            />

            <StatCard
              label="Awaiting Entry"
              value={stats.remaining}
              detail="Not checked in yet"
              icon={<Ticket size={21} />}
              variant="orange"
            />
          </section>

          <div className="content-grid">
            <section
              className="panel registration-panel"
              id="registration-form"
            >
              <div className="panel-heading">
                <div>
                  <h3>Register attendee</h3>
                  <p>Add a guest to your event.</p>
                </div>

                <div className="heading-icon">
                  <Plus size={20} />
                </div>
              </div>

              <form
                onSubmit={handleRegister}
                className="registration-form"
              >
                <label htmlFor="attendee-name">Full name</label>

                <input
                  id="attendee-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  minLength={2}
                  maxLength={100}
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

                <button
                  type="submit"
                  className="primary-button full-button"
                  disabled={submitting}
                >
                  <Plus size={18} />
                  {submitting
                    ? "Registering..."
                    : "Register attendee"}
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
                  {stats.total_registered} attendees
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
                    {loading && (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          Loading attendees...
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filteredAttendees.map((attendee) => (
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
                            <code>{attendee.pass_code}</code>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                attendee.checked_in
                                  ? "status-checked"
                                  : "status-pending"
                              }`}
                            >
                              <span />
                              {attendee.checked_in
                                ? "Checked in"
                                : "Pending"}
                            </span>
                          </td>

                          <td>
                            <div className="table-action-group">
                              <button
                                type="button"
                                className="table-action"
                                onClick={() => setSelectedAttendee(attendee)}
                                title="View QR pass"
                                aria-label={`View QR pass for ${attendee.name}`}
                              >
                                <QrCode size={16} />
                              </button>

                              <button
                                type="button"
                                className="table-action"
                                onClick={() => handleCheckIn(attendee.id)}
                                disabled={
                                  attendee.checked_in ||
                                  checkingInId !== null
                                }
                                title={
                                  attendee.checked_in
                                    ? "Already checked in"
                                    : "Check in attendee"
                                }
                                aria-label={`Check in ${attendee.name}`}
                              >
                                <ArrowUpRight size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {!loading &&
                      filteredAttendees.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="empty-state"
                          >
                            {search.trim()
                              ? "No matching attendees found."
                              : "No attendees registered yet. Add your first attendee."}
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  Showing {filteredAttendees.length} of{" "}
                  {attendees.length} attendees
                </span>

                <span className="footer-indicator">
                  <span className="live-dot" />
                  Connected to API
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

      {selectedAttendee && (
        <QRPass
          attendee={selectedAttendee}
          onClose={() => setSelectedAttendee(null)}
        />
      )}
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
