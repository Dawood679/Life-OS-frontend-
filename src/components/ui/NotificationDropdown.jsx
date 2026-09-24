import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, X, Check, Droplets, Sparkles, CheckCheck, Pill, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationDropdown({ compact = false }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread'

  const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
  const BACKEND_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

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
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id, e) => {
    e?.stopPropagation();
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
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleQuickLogWater = async (id, amountMl = 250, e) => {
    e?.stopPropagation();
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
        toast.success(`Logged ${amountMl}ml water! 💧`);
        await markAsRead(id);
      }
    } catch (err) {
      console.error("Failed to quick log water:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "water_reminder":
        return <Droplets className="w-4 h-4 text-sky-600" />;
      case "medicine_reminder":
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case "quiz_verified":
      case "skill_badge":
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case "todo_reminder":
      case "agenda":
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.read;
    return true;
  });

  return (
    <>
      {/* Trigger Button (Compact for Mobile Topbar / Full for Sidebar) */}
      {compact ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            fetchNotifications();
          }}
          className={`relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center ${
            isOpen ? "bg-indigo-50 text-brand-indigo" : ""
          }`}
          aria-label="Open notifications modal"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            fetchNotifications();
          }}
          className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            isOpen
              ? "bg-indigo-50 text-brand-indigo border border-indigo-200 shadow-2xs"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
          }`}
          aria-label="Open notifications modal"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <Bell className="w-4 h-4 text-brand-indigo" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </div>
            <span>Notifications</span>
          </div>

          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* PORTAL MODAL DIALOG (Centered and 100% responsive across all mobile & desktop viewports) */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-modal-title"
          >
            {/* Modal Card */}
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[600px] animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-indigo shadow-2xs">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 id="notification-modal-title" className="font-serif font-bold text-base text-slate-900">
                        Activity & Alerts
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-rose-100 text-rose-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Stay updated with scheduled reminders & system cues.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="px-2.5 py-1 text-[11px] font-bold text-brand-indigo hover:bg-indigo-50 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                    title="Close Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "all"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("unread")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "unread"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Refreshing..." : "↻ Refresh"}
                </button>
              </div>

              {/* List Content */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3 divide-y-0">
                {loading && notifications.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-slate-400 font-medium">Fetching your alerts...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto shadow-2xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {activeTab === "unread" ? "No unread alerts" : "All caught up!"}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      {activeTab === "unread"
                        ? "You have acknowledged all active notifications."
                        : "No new notifications or scheduled reminders at this moment."}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item._id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        !item.read
                          ? "bg-indigo-50/40 border-indigo-100/90 shadow-2xs"
                          : "bg-white border-slate-200/70 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            {getNotificationIcon(item.type)}
                          </span>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed break-words">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium inline-block pt-1">
                              {new Date(item.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at{" "}
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
                            onClick={(e) => markAsRead(item._id, e)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition cursor-pointer shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Quick Action for Water Reminder */}
                      {item.type === "water_reminder" && !item.read && (
                        <div className="pt-2 border-t border-indigo-100/60 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Hydration Goal: +250ml
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleQuickLogWater(item._id, 250, e)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Droplets className="w-3.5 h-3.5" />
                            <span>Drank 250ml</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {filteredNotifications.length} of {notifications.length} alerts
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}