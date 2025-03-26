import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getDatabase, ref, onValue, push, update, remove } from "firebase/database";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../styles.css";

const localizer = momentLocalizer(moment);
Modal.setAppElement("#root");

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) || false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(),
    color: "#3174ad",
  });

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const eventsRef = ref(db, `events/${user.uid}`);
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const loaded = Object.entries(data).map(([id, event]) => ({
        id,
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: false,
      }));
      setEvents(loaded);
    });
  }, [user]);

  const handleLogout = () => {
    auth.signOut().then(() => navigate("/login"));
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setFormData({ title: "", description: "", start, end, color: "#3174ad" });
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({ ...event });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return alert("Title is required");
    const db = getDatabase();
    const payload = {
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
    };

    const path = `events/${user.uid}`;
    selectedEvent
      ? update(ref(db, `${path}/${selectedEvent.id}`), payload)
      : push(ref(db, path), payload);

    setModalOpen(false);
    setSelectedEvent(null);
    setFormData({ title: "", description: "", start: new Date(), end: new Date(), color: "#3174ad" });
  };

  const handleDelete = () => {
    const db = getDatabase();
    remove(ref(db, `events/${user.uid}/${selectedEvent.id}`));
    setModalOpen(false);
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${darkMode ? "dark" : ""}`}>
        <h2>Dashboard</h2>
        <p>{user?.email}</p>
        <button onClick={() => setSettingsOpen(true)}>Settings</button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>

      {/* Main Calendar View */}
      <main className="content">
        <h2 className="mb-4">Calendar</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "day", "agenda"]}
          step={30}
          selectable
          style={{ height: 600 }}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view={currentView}
          onView={(view) => setCurrentView(view)}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({
            style: {
                  backgroundColor: event.color || "#3174ad",
                  color: "#fff",
                  borderRadius: "4px",
                  padding: "2px",
              },
            })}
          />


        {/* Modal for Creating or Editing Event */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{selectedEvent ? "Edit Event" : "Add Event"}</h3>
              <input
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <input
                type="datetime-local"
                name="start"
                value={moment(formData.start).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              />
              <input
                type="datetime-local"
                name="end"
                value={moment(formData.end).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
              />
              <select name="color" value={formData.color} onChange={handleInputChange}>
                <option value="#3174ad">Blue</option>
                <option value="#ad3131">Red</option>
                <option value="#31ad6c">Green</option>
                <option value="#ffc107">Yellow</option>
                <option value="#6f42c1">Purple</option>
              </select>
              <div className="modal-actions">
                <button onClick={handleSubmit} className="save-btn">
                  {selectedEvent ? "Update" : "Add"}
                </button>
                <button onClick={() => setModalOpen(false)} className="cancel-btn">Cancel</button>
                {selectedEvent && (
                  <button onClick={handleDelete} className="delete-btn">Delete</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        <Modal
          isOpen={settingsOpen}
          onRequestClose={() => setSettingsOpen(false)}
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <h2 className="text-xl mb-4">Settings</h2>
            <label className="setting-row">
              <span>Enable Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </label>
            <div className="flex justify-end mt-4">
              <button className="cancel-btn" onClick={() => setSettingsOpen(false)}>Close</button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default Dashboard;
