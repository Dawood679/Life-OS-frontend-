import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FeatureLayout from "../../src/components/FeatureLayout";

const TAB_KEYS = {
  TODAY: "today",
  MANAGE: "manage",
  ADVICE: "advice",
};

export default function MedicineTracker() {
  const navigate = useNavigate();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  const [activeTab, setActiveTab] = useState(TAB_KEYS.TODAY);
  const [medicines, setMedicines] = useState([]);
  const [advices, setAdvices] = useState([]);
  const [adherenceData, setAdherenceData] = useState({
    adherenceRate: 100,
    takenDoses: 0,
    totalDoses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);

  // Manual Medicine Form State
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "500mg",
    frequency: "1+0+1",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    times: ["08:00", "20:00"],
  });

  const todayStr = new Date().toISOString().split("T")[0];

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
      console.error("Fetch Medicine Error:", err);
      const errMsg = "Unable to load medications.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvices = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health/advice`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.data) setAdvices(data.data);
    } catch (err) {
      console.error("Fetch Advices Error:", err);
    }
  };

  const handleUpdateAdherence = async (medId, status) => {
    try {
      setActionLoading(medId);
      const res = await fetch(
        `${BACKEND_URL}/health/medicines/${medId}/adherence`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ date: todayStr, status }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status.");

      // Update state locally
      setMedicines((prev) =>
        prev.map((m) => (m._id === medId ? data.data : m)),
      );
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
      setError("");

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
      setNewMed({
        name: "",
        dosage: "500mg",
        frequency: "1+0+1",
        startDate: todayStr,
        endDate: todayStr,
        times: ["08:00", "20:00"],
      });
    } catch (err) {
      toast.error(err.message || "Failed to add medicine.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (id) => {
    setMedicineToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setMedicineToDelete(null);
  };

  const confirmDeleteMedicine = async () => {
    if (!medicineToDelete) return;
    
    const id = medicineToDelete;
    closeDeleteModal(); // Close modal immediately
    
    const toastId = toast.loading("Deleting medicine...");

    try {
      const res = await fetch(`${BACKEND_URL}/health/medicines/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete medicine");

      // Update state to remove the deleted medicine from UI instantly
      setMedicines((prevMedicines) =>
        prevMedicines.filter((med) => med._id !== id),
      );

      toast.success("Medicine deleted successfully!", { id: toastId });
    } catch (err) {
      console.error("Delete Medicine Error:", err);
      toast.error(err.message || "Failed to delete medicine.", { id: toastId });
    }
  };

  const renderHero = () => (
    <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-2 text-center md:text-left">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
          Prescription Routines
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold">
          Medicine Schedules
        </h2>
        <p className="text-sky-100 text-xs md:text-sm">
          Track your prescribed doses and maintain daily adherence habits.
        </p>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[140px]">
        <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">
          7-Day Adherence
        </p>
        <div className="flex items-baseline justify-center gap-1 mt-1">
          <span className="text-4xl font-black">
            {adherenceData.adherenceRate}%
          </span>
        </div>
      </div>
    </div>
  );

  const renderTodayTab = () => (
    <div className="space-y-4">
      {medicines.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
          <p className="text-3xl">💊</p>
          <p className="text-xs font-bold text-slate-700">
            No active medicines found.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(TAB_KEYS.MANAGE)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              + Add Manually
            </button>
            <button
              type="button"
              onClick={() => navigate("/health/prescriptions")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Scan Prescription
            </button>
          </div>
        </div>
      ) : (
        medicines.map((med) => {
          const todayLog = med.adherenceLogs?.find((l) => l.date === todayStr);
          const isTaken = todayLog?.status === "taken";
          const isSkipped = todayLog?.status === "skipped";

          return (
            <div
              key={med._id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg ${isTaken ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-600"}`}
                >
                  💊
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {med.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {med.dosage} •{" "}
                    <span className="font-semibold text-indigo-600">
                      {med.frequency}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Active until {med.endDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleUpdateAdherence(med._id, "taken")}
                  disabled={actionLoading === med._id}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${isTaken ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                >
                  {isTaken ? "✓ Taken" : "Mark Taken"}
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAdherence(med._id, "skipped")}
                  disabled={actionLoading === med._id}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${isSkipped ? "bg-rose-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {isSkipped ? "Skipped" : "Skip"}
                </button>
                <button
                  onClick={() => openDeleteModal(med._id)}
                  className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                  title="Delete Medicine"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderManageTab = () => (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs max-w-xl mx-auto space-y-4">
      <h3 className="font-serif font-bold text-base text-slate-900">
        Add Medicine Schedule Manually
      </h3>
      <form onSubmit={handleCreateManualMedicine} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Medicine Name
          </label>
          <input
            type="text"
            required
            value={newMed.name}
            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            placeholder="e.g. Omeprazole"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Dosage
            </label>
            <input
              type="text"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. 20mg"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Frequency
            </label>
            <input
              type="text"
              value={newMed.frequency}
              onChange={(e) =>
                setNewMed({ ...newMed, frequency: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. 1+0+1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              required
              value={newMed.startDate}
              onChange={(e) =>
                setNewMed({ ...newMed, startDate: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              End Date
            </label>
            <input
              type="date"
              required
              value={newMed.endDate}
              onChange={(e) =>
                setNewMed({ ...newMed, endDate: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={actionLoading === "create_med"}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {actionLoading === "create_med"
            ? "Saving..."
            : "Add Medicine Schedule"}
        </button>
      </form>
    </div>
  );

  const renderAdviceTab = () => (
    <div className="space-y-4">
      {advices.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
          No doctor lifestyle rules logged yet.
        </div>
      ) : (
        advices.map((adv) => (
          <div
            key={adv._id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-base font-bold">
                {adv.category === "exercise"
                  ? "🏃‍♂️"
                  : adv.category === "diet_restriction"
                    ? "🚫"
                    : "📋"}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {adv.instruction}
                </h4>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {adv.category.replace("_", " ")}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
              Active Rule
            </span>
          </div>
        ))
      )}
    </div>
  );

  const tabs = [
    { key: TAB_KEYS.TODAY, label: "Today's Schedule" },
    { key: TAB_KEYS.MANAGE, label: "Add Medicine" },
    { key: TAB_KEYS.ADVICE, label: "Doctor's Advice" },
  ];

  return (
    <>
      <FeatureLayout
        badgeText="Health OS"
        title="Medicine Tracker"
        subtitle="Track your daily doses and manage doctor-prescribed medication"
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
            {activeTab === TAB_KEYS.MANAGE && renderManageTab()}
            {activeTab === TAB_KEYS.ADVICE && renderAdviceTab()}
          </div>
        )}
      />

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Medicine?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to remove this medicine from your schedule? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMedicine}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-2xl transition shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}