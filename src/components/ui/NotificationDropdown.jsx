import { useState, useEffect, useRef } from "react";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/notifications`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.data) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleQuickLogWater = async (id, amountMl = 250) => {
    try {
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const localDate = new Date(Date.now() - tzOffset).toISOString().split("T")[0];

      const res = await fetch(`${BACKEND_URL}/wellness/water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: localDate, amountMl }),
      });

      if (res.ok) {
        await markAsRead(id);
      }
    } catch (err) {
      console.error("Failed to quick log water:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-ink-700 hover:bg-orange-50/70 hover:text-ink-900 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="w-4 h-4 text-brand-indigo"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </div>
          <span>Notifications</span>
        </div>

        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-brand-indigo border border-indigo-200">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div className="absolute left-full bottom-0 ml-3 w-80 md:w-96 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-slate-800">
                Activity & Alerts
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 text-indigo-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-brand-indigo hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-400">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <p className="text-2xl">✨</p>
                <p className="text-xs font-semibold text-slate-600">All caught up!</p>
                <p className="text-[10px]">No new notifications at this time.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col gap-2 ${
                    !item.read
                      ? "bg-indigo-50/50 border-indigo-100/80 shadow-xs"
                      : "bg-white border-slate-100 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {item.type === "water_reminder" ? "💧" : "🔔"}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {item.message}
                        </p>
                        <span className="text-[9px] text-slate-400 font-medium mt-1 inline-block">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item._id)}
                        className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold p-1 cursor-pointer shrink-0"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </div>

                  {/* One-Click Action for Water Reminder */}
                  {item.type === "water_reminder" && !item.read && (
                    <div className="pt-2 border-t border-indigo-100/50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleQuickLogWater(item._id, 250)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 hover:opacity-95 text-white text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Drank 250ml</span> 🥛
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}