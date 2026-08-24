import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FeatureLayout from "../../src/components/FeatureLayout";

const TAB_KEYS = {
  TODAY: "today",
  MANAGE: "manage",
  ADVICE: "advice",
};

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MedicineTracker() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const [activeTab, setActiveTab] = useState(TAB_KEYS.TODAY);
  const [medicines, setMedicines] = useState([]);
  const [advices, setAdvices] = useState([]);
  const [adherenceData, setAdherenceData] = useState({ adherenceRate: 100, takenDoses: 0, totalDoses: 0 });
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  
  // Modals
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });
  const [editMed, setEditMed] = useState(null); // Holds data of the medicine being edited

  const todayStr = new Date().toISOString().split("T")[0];

  const defaultReminderState = { enabled: false, type: "everyday", days: [], dates: [] };

  const initialMedState = {
    name: "",
    dosage: "As directed",
    frequency: "1+0+1",
    startDate: todayStr,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    times: ["08:00"],
    reminder: { ...defaultReminderState }
  };

  const [newMed, setNewMed] = useState(initialMedState);
  const [newAdvice, setNewAdvice] = useState({ category: "general", instruction: "" });

  const [timeInput, setTimeInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    fetchMedicinesAndStats();
    fetchAdvices();
  }, []);

  const fetchMedicinesAndStats = async () => {
    try {
      setLoading(true);
      setError("");
      const [medRes, insightRes] = await Promise.all([
        fetch(`${BACKEND_URL}/health/medicines`, { credentials: "include" }),
        fetch(`${BACKEND_URL}/health/insights`, { credentials: "include" }),
      ]);
      const medJson = await medRes.json();
      const insightJson = await insightRes.json();
      if (medRes.ok && medJson.data) setMedicines(medJson.data);
      if (insightRes.ok && insightJson.data) setAdherenceData(insightJson.data);
    } catch (err) {
      toast.error("Unable to load medications.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvices = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health/advice`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.data) setAdvices(data.data);
    } catch (err) {}
  };

  const handleUpdateAdherence = async (medId, status) => {
    try {
      setActionLoading(medId);
      const res = await fetch(`${BACKEND_URL}/health/medicines/${medId}/adherence`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: todayStr, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status.");
      setMedicines((prev) => prev.map((m) => (m._id === medId ? data.data : m)));
      fetchMedicinesAndStats();
      toast.success(`Medicine marked as ${status}`);
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateManualMedicine = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding medicine to schedule...");
    try {
      setActionLoading("create_med");
      const res = await fetch(`${BACKEND_URL}/health/medicines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newMed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add medicine.");

      setMedicines([data.data, ...medicines]);
      toast.success("Medicine added successfully!", { id: toastId });
      setActiveTab(TAB_KEYS.TODAY);
      setNewMed(initialMedState);
    } catch (err) {
      toast.error(err.message || "Failed to add medicine.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  // --- EDIT EXISTING MEDICINE LOGIC ---
  const openEditModal = (medicine) => {
    setEditMed({
      _id: medicine._id,
      name: medicine.name,
      dosage: medicine.dosage || "",
      frequency: medicine.frequency || "",
      endDate: medicine.endDate || todayStr,
      times: medicine.times || [],
      reminder: medicine.reminder || { ...defaultReminderState }
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating medicine schedule...");
    try {
      setActionLoading("edit_med");
      const res = await fetch(`${BACKEND_URL}/health/medicines/${editMed._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editMed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update medicine.");

      setMedicines((prev) => prev.map((m) => (m._id === editMed._id ? data.data : m)));
      toast.success("Schedule updated successfully!", { id: toastId });
      setEditMed(null); // Close modal
    } catch (err) {
      toast.error(err.message || "Failed to update medicine.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    const { type, id } = deleteModal;
    if (!id || !type) return;
    setDeleteModal({ isOpen: false, type: null, id: null }); 
    const endpoint = type === 'medicine' ? `medicines/${id}` : `advice/${id}`;
    const toastId = toast.loading(`Deleting ${type}...`);

    try {
      const res = await fetch(`${BACKEND_URL}/health/${endpoint}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to delete ${type}`);

      if (type === 'medicine') {
        setMedicines((prev) => prev.filter((item) => item._id !== id));
      } else {
        setAdvices((prev) => prev.filter((item) => item._id !== id));
      }
      toast.success(`Deleted successfully!`, { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  // Shared Helper Functions for Time/Date Arrays
  const modifyArray = (targetObj, setTargetObj, path, item, action) => {
    const newObj = { ...targetObj };
    if (path === 'times') {
      if (action === 'add' && item && !newObj.times.includes(item)) newObj.times = [...newObj.times, item].sort();
      if (action === 'remove') newObj.times = newObj.times.filter(t => t !== item);
    } else if (path === 'dates') {
      if (action === 'add' && item && !newObj.reminder.dates.includes(item)) newObj.reminder.dates = [...newObj.reminder.dates, item].sort();
      if (action === 'remove') newObj.reminder.dates = newObj.reminder.dates.filter(d => d !== item);
    } else if (path === 'days') {
      const isSelected = newObj.reminder.days.includes(item);
      newObj.reminder.days = isSelected ? newObj.reminder.days.filter(d => d !== item) : [...newObj.reminder.days, item];
    }
    setTargetObj(newObj);
  };

  // Component rendering helpers
  const renderHero = () => (
    <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-2 text-center md:text-left">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">Prescription Routines</span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold">Medicine Schedules</h2>
        <p className="text-sky-100 text-xs md:text-sm">Track your prescribed doses and receive accurate alarms.</p>
      </div>
      <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[140px]">
        <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">7-Day Adherence</p>
        <div className="flex items-baseline justify-center gap-1 mt-1">
          <span className="text-4xl font-black">{adherenceData.adherenceRate}%</span>
        </div>
      </div>
    </div>
  );

  const renderTodayTab = () => (
    <div className="space-y-4">
      {medicines.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
          <p className="text-3xl">💊</p>
          <p className="text-xs font-bold text-slate-700">No active medicines found.</p>
        </div>
      ) : (
        medicines.map((med) => {
          const todayLog = med.adherenceLogs?.find((l) => l.date === todayStr);
          const isTaken = todayLog?.status === "taken";
          const isSkipped = todayLog?.status === "skipped";

          return (
            <div key={med._id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg ${isTaken ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-600"}`}>💊</div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {med.name} 
                    {med.reminder?.enabled && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-bold" title="Alarm Active">🔔 Active</span>}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{med.dosage} • <span className="font-semibold text-indigo-600">{med.frequency}</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">Scheduled Times: {med.times?.join(', ') || 'None set'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Adherence Buttons */}
                <button onClick={() => handleUpdateAdherence(med._id, "taken")} disabled={actionLoading === med._id} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${isTaken ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
                  {isTaken ? "✓ Taken" : "Mark Taken"}
                </button>
                <button onClick={() => handleUpdateAdherence(med._id, "skipped")} disabled={actionLoading === med._id} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${isSkipped ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {isSkipped ? "Skipped" : "Skip"}
                </button>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center ml-2 border-l border-slate-200 pl-2 gap-1">
                  <button onClick={() => openEditModal(med)} className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer" title="Config Alarm / Schedule">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                  <button onClick={() => setDeleteModal({ isOpen: true, type: 'medicine', id: med._id })} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Delete Medicine">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // Common UI for both Add and Edit forms
  const renderScheduleForm = (stateObj, setStateFunc, isEdit = false) => (
    <div className="space-y-5">
      {!isEdit && (
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medicine Name</label>
          <input type="text" required value={stateObj.name} onChange={(e) => setStateFunc({ ...stateObj, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" placeholder="e.g. Omeprazole" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dosage</label>
          <input type="text" value={stateObj.dosage} onChange={(e) => setStateFunc({ ...stateObj, dosage: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" placeholder="e.g. 20mg" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Frequency</label>
          <input type="text" value={stateObj.frequency} onChange={(e) => setStateFunc({ ...stateObj, frequency: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" placeholder="e.g. 1+0+1" />
        </div>
      </div>
      
      {/* Times Configuration */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notification Times</label>
        <div className="flex gap-2 mb-3">
          <input type="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" />
          <button type="button" onClick={() => { modifyArray(stateObj, setStateFunc, 'times', timeInput, 'add'); setTimeInput(""); }} className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-200 transition cursor-pointer">Add Time</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {stateObj.times.map((t) => (
            <span key={t} className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2">
              {t} <button type="button" onClick={() => modifyArray(stateObj, setStateFunc, 'times', t, 'remove')} className="text-indigo-400 hover:text-indigo-600 text-sm cursor-pointer">&times;</button>
            </span>
          ))}
        </div>
      </div>

      {/* Notification Settings Engine */}
      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={stateObj.reminder.enabled} onChange={(e) => setStateFunc({ ...stateObj, reminder: { ...stateObj.reminder, enabled: e.target.checked } })} className="w-4 h-4 text-indigo-600 rounded" />
          <span className="text-sm font-bold text-indigo-900">Enable Alarm Notifications</span>
        </label>
        
        {stateObj.reminder.enabled && (
          <div className="mt-4 space-y-4 border-t border-indigo-100 pt-4">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" name={`reminderType_${isEdit}`} value="everyday" checked={stateObj.reminder.type === 'everyday'} onChange={(e) => setStateFunc({ ...stateObj, reminder: { ...stateObj.reminder, type: e.target.value } })} /> Everyday
              </label>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" name={`reminderType_${isEdit}`} value="specific_days" checked={stateObj.reminder.type === 'specific_days'} onChange={(e) => setStateFunc({ ...stateObj, reminder: { ...stateObj.reminder, type: e.target.value } })} /> Specific Days
              </label>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" name={`reminderType_${isEdit}`} value="specific_dates" checked={stateObj.reminder.type === 'specific_dates'} onChange={(e) => setStateFunc({ ...stateObj, reminder: { ...stateObj.reminder, type: e.target.value } })} /> Specific Dates
              </label>
            </div>

            {stateObj.reminder.type === 'specific_days' && (
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map(day => (
                  <button type="button" key={day} onClick={() => modifyArray(stateObj, setStateFunc, 'days', day)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${stateObj.reminder.days.includes(day) ? 'bg-indigo-500 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {stateObj.reminder.type === 'specific_dates' && (
              <div>
                <div className="flex gap-2 mb-3">
                  <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" />
                  <button type="button" onClick={() => { modifyArray(stateObj, setStateFunc, 'dates', dateInput, 'add'); setDateInput(""); }} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition cursor-pointer">Add Date</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stateObj.reminder.dates.map((d) => (
                    <span key={d} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-2">
                      {d} <button type="button" onClick={() => modifyArray(stateObj, setStateFunc, 'dates', d, 'remove')} className="text-slate-400 hover:text-red-500 text-sm cursor-pointer">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { key: TAB_KEYS.TODAY, label: "Today's Schedule" },
    { key: TAB_KEYS.MANAGE, label: "Add Medicine" },
  ];

  return (
    <>
      <FeatureLayout
        badgeText="Health OS"
        title="Medicine Tracker"
        subtitle="Manage prescriptions and set accurate alarms."
        onBack={() => navigate("/dashboard")}
        loading={loading}
        error={error}
        setError={setError}
        hasItems={true}
        isCreatingNew={false}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderHero={renderHero}
        renderTabContent={() => (
          <div className="space-y-6">
            {activeTab === TAB_KEYS.TODAY && renderTodayTab()}
            {activeTab === TAB_KEYS.MANAGE && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs max-w-xl mx-auto">
                <form onSubmit={handleCreateManualMedicine} className="space-y-6">
                  {renderScheduleForm(newMed, setNewMed, false)}
                  <button type="submit" disabled={actionLoading === "create_med"} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer">
                    {actionLoading === "create_med" ? "Saving..." : "Save Medicine Schedule"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      />

      {/* EDIT MODAL */}
      {editMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                ⚙️ Configure Alarm: {editMed.name}
              </h3>
              <button onClick={() => setEditMed(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {renderScheduleForm(editMed, setEditMed, true)}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditMed(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl hover:bg-slate-200 cursor-pointer transition">Cancel</button>
                <button type="submit" disabled={actionLoading === "edit_med"} className="flex-1 py-3 bg-indigo-600 text-white text-xs font-bold rounded-2xl shadow-md hover:bg-indigo-700 cursor-pointer transition disabled:opacity-50">
                  {actionLoading === "edit_med" ? "Updating..." : "Update Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 capitalize text-center">Delete {deleteModal.type}?</h3>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })} className="flex-1 py-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}