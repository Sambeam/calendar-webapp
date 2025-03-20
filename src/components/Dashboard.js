import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import "../styles.css";

Modal.setAppElement("#root");

const Dashboard = ({ user, setUser }) => {
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem("events")) || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState({ title: "", start: "", end: "" });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) || false);
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem("notifications")) || false);

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  // ✅ **Handle Clicking a Date to Add an Event**
  const handleDateClick = (info) => {
    setEventData({ title: "", start: info.dateStr, end: info.dateStr });
    setSelectedEvent(null);
    setModalOpen(true);
  };

  // ✅ **Handle Clicking an Event to Edit/Delete**
  const handleEventClick = (info) => {
    const event = events.find((e) => e.id === info.event.id);
    setEventData(event);
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // ✅ **Handle Saving an Event (New or Edited)**
const handleEventSubmit = () => {
  if (!eventData.title.trim()) {
    alert("Event title cannot be empty!");
    return;
  }

  // ✅ Ensure Correct Date & Time Format
  const startDateTime = eventData.start + (eventData.startTime ? `T${eventData.startTime}` : "T00:00");
  const endDateTime = eventData.end + (eventData.endTime ? `T${eventData.endTime}` : "T23:59");

  const newEvent = {
    id: selectedEvent ? selectedEvent.id : String(Date.now()),
    title: eventData.title,
    start: startDateTime,
    end: endDateTime,
    description: eventData.description || "",
    color: eventData.color || "#007bff",
  };

  if (selectedEvent) {
    // Editing existing event
    setEvents(events.map((e) => (e.id === selectedEvent.id ? newEvent : e)));
  } else {
    // Adding new event
    setEvents([...events, newEvent]);
  }

  setModalOpen(false);
};


  // ✅ **Handle Deleting an Event**
  const handleEventDelete = () => {
    setEvents(events.filter((e) => e.id !== selectedEvent.id));
    setModalOpen(false);
  };

  // ✅ **Handle Logout**
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className={`sidebar ${darkMode ? "dark" : ""}`}>
        <h2 className="sidebar-title">Dashboard</h2>
        <nav>
          <ul>
            <li><button onClick={() => setSettingsOpen(true)}>Settings</button></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </ul>
        </nav>
      </div>

      {/* Calendar */}
      <div className="content">
        <h2 className="welcome-text">Welcome, {user.email}</h2>
        <div className={`calendar-container ${darkMode ? "dark" : ""}`}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            editable
            selectable
            events={events.map(event => ({
              ...event,
              backgroundColor: event.color || "#007bff", // ✅ Apply selected color
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={(info) => {
              setEvents(events.map((e) => (e.id === info.event.id ? { ...e, start: info.event.startStr, end: info.event.endStr } : e)));
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
          />
        </div>
      </div>

      {/* ✅ Event Modal */}
      {/* ✅ Updated Event Modal */}
<Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} className="modal" overlayClassName="modal-overlay">
  <div className="modal-content">
    <h3 className="text-lg font-bold mb-3">{selectedEvent ? "Edit Event" : "Add Event"}</h3>
    
    {/* Event Title */}
    <label className="block text-gray-700 dark:text-gray-300">Event Title</label>
    <input
      type="text"
      placeholder="Enter event title"
      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
      value={eventData.title}
      onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
      required
    />

    {/* Event Date & Time */}
    <div className="flex gap-2 mt-3">
      <div className="flex-1">
        <label className="block text-gray-700 dark:text-gray-300">Start Date</label>
        <input
          type="date"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          value={eventData.start}
          onChange={(e) => setEventData({ ...eventData, start: e.target.value })}
        />
      </div>
      <div className="flex-1">
        <label className="block text-gray-700 dark:text-gray-300">Start Time</label>
        <input
          type="time"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          value={eventData.startTime || ""}
          onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
        />
      </div>
    </div>

    <div className="flex gap-2 mt-3">
      <div className="flex-1">
        <label className="block text-gray-700 dark:text-gray-300">End Date</label>
        <input
          type="date"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          value={eventData.end}
          onChange={(e) => setEventData({ ...eventData, end: e.target.value })}
        />
      </div>
      <div className="flex-1">
        <label className="block text-gray-700 dark:text-gray-300">End Time</label>
        <input
          type="time"
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          value={eventData.endTime || ""}
          onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
        />
      </div>
    </div>

    {/* Event Description */}
    <label className="block text-gray-700 dark:text-gray-300 mt-3">Description</label>
    <textarea
      rows="3"
      placeholder="Enter event details"
      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
      value={eventData.description || ""}
      onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
    ></textarea>

    {/* Event Color Selector */}
    <label className="block text-gray-700 dark:text-gray-300 mt-3">Event Color</label>
    <select
      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
      value={eventData.color || "#007bff"}
      onChange={(e) => setEventData({ ...eventData, color: e.target.value })}
    >
      <option value="#007bff">Blue</option>
      <option value="#28a745">Green</option>
      <option value="#dc3545">Red</option>
      <option value="#ffc107">Yellow</option>
      <option value="#6f42c1">Purple</option>
    </select>

    {/* Buttons */}
    <div className="flex justify-end gap-2 mt-5">
      {selectedEvent && (
        <button onClick={handleEventDelete} className="delete-btn px-4 py-2">
          Delete
        </button>
      )}
      <button onClick={() => setModalOpen(false)} className="cancel-btn px-4 py-2">
        Cancel
      </button>
      <button onClick={handleEventSubmit} className="save-btn px-4 py-2">
        {selectedEvent ? "Update Event" : "Add Event"}
      </button>
    </div>
  </div>
</Modal>


      {/* ✅ Settings Modal */}
      <Modal isOpen={settingsOpen} onRequestClose={() => setSettingsOpen(false)} className="modal" overlayClassName="modal-overlay">
        <div className="modal-content">
          <h3>Settings</h3>
          <label>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            Dark Mode
          </label>
          <br />
          <label>
            <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
            Enable Notifications
          </label>
          <br />
          <button onClick={() => setSettingsOpen(false)} className="cancel-btn">Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
