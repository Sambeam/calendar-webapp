import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Modal from "react-modal";
import {
  getDatabase,
  ref,
  push,
  update,
  remove,
  onValue,
} from "firebase/database";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles.css";

const localizer = momentLocalizer(moment);
if (process.env.NODE_ENV !== 'test') {
  Modal.setAppElement("#root");
}


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [firebaseEvents, setFirebaseEvents] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [recurrenceModalOpen, setRecurrenceModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteMode, setDeleteMode] = useState("single");
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) || false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
    color: "#3174ad",
  });

  const [recurrence, setRecurrence] = useState({
    frequency: "weekly",
    interval: 1,
    days: [],
    endDate: "",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      else setUser(u);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const eventsRef = ref(db, `events/${user.uid}`);
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setFirebaseEvents(data);

      const loaded = [];

      Object.entries(data).forEach(([id, e]) => {
        const startDate = new Date(e.start);
        const duration = new Date(e.end) - startDate;

        if (e.recurrence?.days?.length > 0 && e.recurrence.endDate) {
          let current = new Date(startDate);
          const endRec = new Date(e.recurrence.endDate);

          while (current <= endRec) {
            if (e.recurrence.days.includes(current.getDay())) {
              const instanceStart = new Date(current);
              const instanceEnd = new Date(current.getTime() + duration);
              loaded.push({
                ...e,
                id: `${id}-${current.toISOString()}`,
                baseId: id,
                start: instanceStart,
                end: instanceEnd,
              });
            }
            current.setDate(current.getDate() + 1);
          }
        } else {
          loaded.push({ ...e, id, start: new Date(e.start), end: new Date(e.end) });
        }
      });

      setEvents(loaded);
    });
  }, [user]);

  const handleLogout = () => auth.signOut().then(() => navigate("/login"));

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setFormData({ title: "", description: "", start, end, color: "#3174ad" });
    setRecurrence({ frequency: "weekly", interval: 1, days: [], endDate: "" });
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      start: event.start,
      end: event.end,
      color: event.color || "#3174ad",
    });
    setRecurrence(event.recurrence || {
      frequency: "weekly",
      interval: 1,
      days: [],
      endDate: "",
    });
    setDeleteMode("single");
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return alert("Title is required");

    const db = getDatabase();
    const eventsRef = ref(db, `events/${user.uid}`);
    const payload = {
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
    };

    if (recurrence.days?.length > 0) {
      payload.recurrence = recurrence;
    }

    const isEditing = selectedEvent !== null;
    const eventId = selectedEvent?.baseId || selectedEvent?.id;

    if (isEditing && firebaseEvents[eventId]) {
      update(ref(db, `events/${user.uid}/${eventId}`), payload);
    } else {
      push(eventsRef, payload);
    }

    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = () => {
    const db = getDatabase();
    const targetId = selectedEvent?.baseId || selectedEvent?.id;

    if (deleteMode === "all") {
      remove(ref(db, `events/${user.uid}/${targetId}`));
    } else {
      // Soft delete from UI only
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    }

    setModalOpen(false);
    setSelectedEvent(null);
  };

  const toggleDay = (day) => {
    setRecurrence((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h2 className="text-xl font-bold mb-1">Dashboard</h2>
          <p className="text-sm">{user?.email}</p>
        </div>
        <div className="mt-auto">
          <button onClick={() => setSettingsOpen(true)} className="mb-2">Settings</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Calendar */}
      <main className="content">
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day", "agenda"]}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color || "#3174ad",
                color: "white",
              },
            })}
          />
        </div>
      </main>

      {/* Event Modal */}
      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} className="modal" overlayClassName="modal-overlay">
        <h3 className="text-lg font-bold mb-3">{selectedEvent ? "Edit Event" : "Add Event"}</h3>
        <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} />
        <input type="datetime-local" name="start" value={moment(formData.start).format("YYYY-MM-DDTHH:mm")} onChange={(e) => setFormData({ ...formData, start: e.target.value })} />
        <input type="datetime-local" name="end" value={moment(formData.end).format("YYYY-MM-DDTHH:mm")} onChange={(e) => setFormData({ ...formData, end: e.target.value })} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange}></textarea>
        <select name="color" value={formData.color} onChange={handleInputChange}>
          <option value="#3174ad">Blue</option>
          <option value="#ad3131">Red</option>
          <option value="#31ad6c">Green</option>
        </select>
        <button onClick={() => setRecurrenceModalOpen(true)} className="mt-2">Recurrence Settings</button>
        <div className="flex justify-between mt-4">
          {selectedEvent && (
            <>
              <select value={deleteMode} onChange={(e) => setDeleteMode(e.target.value)}>
                <option value="single">Delete This Only</option>
                <option value="all">Delete All</option>
              </select>
              <button className="delete-btn" onClick={handleDelete}>Delete</button>
            </>
          )}
          <button className="cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="save-btn" onClick={handleSubmit}>{selectedEvent ? "Update" : "Add"}</button>
        </div>
      </Modal>

      {/* Recurrence Modal */}
      <Modal isOpen={recurrenceModalOpen} onRequestClose={() => setRecurrenceModalOpen(false)} className="modal" overlayClassName="modal-overlay">
        <h3 className="text-lg font-semibold mb-2">Recurrence</h3>
        <label>Frequency</label>
        <select value={recurrence.frequency} onChange={(e) => setRecurrence({ ...recurrence, frequency: e.target.value })}>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
        <label className="mt-2">Interval</label>
        <input type="number" min="1" value={recurrence.interval} onChange={(e) => setRecurrence({ ...recurrence, interval: parseInt(e.target.value) })} />
        <label className="mt-2">Days</label>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <label key={d}>
              <input type="checkbox" checked={recurrence.days.includes(d)} onChange={() => toggleDay(d)} />
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]}
            </label>
          ))}
        </div>
        <label className="mt-2">End Date</label>
        <input type="date" value={recurrence.endDate} onChange={(e) => setRecurrence({ ...recurrence, endDate: e.target.value })} />
        <button className="save-btn mt-3" onClick={() => setRecurrenceModalOpen(false)}>Save Recurrence</button>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={settingsOpen} onRequestClose={() => setSettingsOpen(false)} className="modal" overlayClassName="modal-overlay">
        <h3 className="text-lg font-semibold mb-3">Settings</h3>
        <label className="block">
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode((prev) => !prev)} />
          Enable Dark Mode
        </label>
        <button className="cancel-btn mt-3" onClick={() => setSettingsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default Dashboard;
