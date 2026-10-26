
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/events";

export default function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    eventName: "",
    description: "",
    eventDate: "",
    venue: "",
  });
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState("Dashboard");
  const [message, setMessage] = useState("");

  async function loadEvents() {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (res.ok) setEvents(data);
    } catch {
      setMessage("Cannot connect to server. Check backend.");
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save(e) {
    e.preventDefault();
    try {
      const url = editId ? `${API}/${editId}` : API;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Could not save event");
        return;
      }
      setForm({ eventName: "", description: "", eventDate: "", venue: "" });
      setEditId(null);
      setPage("Dashboard");
      setMessage(editId ? "Event updated!" : "Event added!");
      loadEvents();
    } catch {
      setMessage("Server connection failed");
    }
  }

  function edit(event) {
    setForm({
      eventName: event.eventName || event.title || "",
      description: event.description || "",
      eventDate: event.eventDate
        ? new Date(event.eventDate).toISOString().slice(0, 10)
        : "",
      venue: event.venue || "",
    });
    setEditId(event._id);
    setPage("Add Event");
  }

  async function remove(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Event deleted!");
        loadEvents();
      } else setMessage("Could not delete event");
    } catch {
      setMessage("Server connection failed");
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>✦ Evently</h2>
        <p className="side-label">WORKSPACE</p>
        <button onClick={() => { setPage("Dashboard"); setMessage(""); }}>
          ▦ &nbsp; Dashboard
        </button>
        <button onClick={() => {
          setForm({ eventName: "", description: "", eventDate: "", venue: "" });
          setEditId(null);
          setPage("Add Event");
          setMessage("");
        }}>
          ＋ &nbsp; Add Event
        </button>
        <div className="side-bottom">Event Management<br />Admin Panel</div>
      </aside>

      <main className="main">
        <header>
          <div><small>EVENT MANAGEMENT / ADMIN</small>
            <h1>{page === "Dashboard" ? "Dashboard" : editId ? "Update Event" : "Create Event"}</h1>
          </div>
          <button className="primary" onClick={() => {
            setForm({ eventName: "", description: "", eventDate: "", venue: "" });
            setEditId(null); setPage("Add Event"); setMessage("");
          }}>＋ Add Event</button>
        </header>

        {message && <p className="message">{message}</p>}

        {page === "Dashboard" ? (
          <>
            <section className="welcome">
              <div><p>YOUR EVENTS, ORGANIZED</p><h2>Make every event count.</h2>
                <span>Manage your events and registrations in one place.</span></div>
              <div className="welcome-icon">✦</div>
            </section>
            <section className="stats">
              <div className="stat"><span>Total Events</span><h2>{events.length}</h2><small>Events created</small></div>
              <div className="stat"><span>Total Registrations</span><h2>{events.reduce((sum, e) => sum + (e.totalRegistrations || 0), 0)}</h2><small>Across all events</small></div>
              <div className="stat"><span>Upcoming Events</span><h2>{events.filter(e => new Date(e.eventDate) >= new Date(new Date().toDateString())).length}</h2><small>Ready to happen</small></div>
            </section>
            <section className="table-card">
              <div className="table-title"><div><h2>All Events</h2><p>View and manage your events</p></div>
                <span className="count">{events.length} events</span></div>
              <div className="table-wrap"><table>
                <thead><tr><th>EVENT</th><th>EVENT DATE</th><th>VENUE</th><th>REGISTRATIONS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {events.map((event, i) => <tr key={event._id}>
                    <td><b>{event.eventName || event.title}</b><small className="event-id">ID: {event._id?.slice(-6)}</small></td>
                    <td>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "—"}</td>
                    <td>{event.venue}</td>
                    <td><span className="count">{event.totalRegistrations || 0}</span></td>
                    <td><button className="edit" onClick={() => edit(event)}>Edit</button> <button className="delete" onClick={() => remove(event._id)}>Delete</button></td>
                  </tr>)}
                  {events.length === 0 && <tr><td colSpan="5" className="empty">No events yet. Click “Add Event” to create one!</td></tr>}
                </tbody>
              </table></div>
            </section>
          </>
        ) : (
          <section className="form-card">
            <h2>{editId ? "Edit event details" : "Event details"}</h2>
            <p>Fill in the information below.</p>
            <form onSubmit={save}>
              <label>Event Name<input name="eventName" value={form.eventName} onChange={change} placeholder="e.g. Tech Fest 2026" required /></label>
              <label>Event Description<textarea name="description" value={form.description} onChange={change} placeholder="Describe your event..." required /></label>
              <div className="form-row">
                <label>Event Date<input type="date" name="eventDate" value={form.eventDate} onChange={change} required /></label>
                <label>Venue<input name="venue" value={form.venue} onChange={change} placeholder="e.g. Main Auditorium" required /></label>
              </div>
              <div className="form-actions"><button type="button" className="cancel" onClick={() => { setPage("Dashboard"); setEditId(null); }}>Cancel</button>
                <button className="primary" type="submit">{editId ? "Save Changes" : "Create Event"}</button></div>
            </form>
          </section>
        )}
        <footer>© 2026 Evently · Event Registration Admin Panel</footer>
      </main>
    </div>
  );
}
