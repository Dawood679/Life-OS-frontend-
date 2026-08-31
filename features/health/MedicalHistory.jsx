import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FeatureLayout from '../../src/components/FeatureLayout';

const TAB_KEYS = {
  TIMELINE: 'timeline',
  PROFILE: 'profile'
};

export default function MedicalHistory() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const [activeTab, setActiveTab] = useState(TAB_KEYS.TIMELINE);
  
  const [historyData, setHistoryData] = useState({
    prescriptions: [],
    medicines: [],
    appointments: [],
    advices: [],
  });
  
  const [healthProfile, setHealthProfile] = useState({
    chronicConditions: [],
    temporaryConditions: [],
    historicalRisks: []
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modals State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  // New Appointment Form State
  const [newAppointment, setNewAppointment] = useState({
    doctorName: '',
    appointmentDate: '',
    reason: '',
    reminder: { inApp: true, email: false, isNotified: false }
  });

  useEffect(() => {
    fetchHistoryAndProfile();
  }, []);

  const fetchHistoryAndProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const [historyRes, profileRes] = await Promise.all([
        fetch(`${BACKEND_URL}/health/history`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/health/profile`, { credentials: 'include' })
      ]);

      const historyJson = await historyRes.json();
      const profileJson = await profileRes.json();

      if (historyRes.ok && historyJson.data) setHistoryData(historyJson.data);
      if (profileRes.ok && profileJson.data) setHealthProfile(profileJson.data);

    } catch (err) {
      console.error('Fetch Error:', err);
      const errMsg = 'Unable to connect to server.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const openDeleteModal = (type, id) => setDeleteModal({ isOpen: true, type, id });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, type: null, id: null });

  const confirmDelete = async () => {
    const { type, id } = deleteModal;
    if (!id || !type) return;
    
    closeDeleteModal(); 
    
    const endpoint = type === 'prescription' ? `prescriptions/${id}` : `appointments/${id}`;
    const toastId = toast.loading(`Deleting ${type}...`);

    try {
      const res = await fetch(`${BACKEND_URL}/health/${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to delete ${type}`);

      if (type === 'prescription') {
        fetchHistoryAndProfile(); 
      } else {
        setHistoryData((prev) => ({
          ...prev,
          appointments: prev.appointments.filter((app) => app._id !== id)
        }));
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, { id: toastId });
    } catch (err) {
      console.error(`Delete Error:`, err);
      toast.error(err.message || `Failed to delete ${type}.`, { id: toastId });
    }
  };

  // --- CREATE APPOINTMENT LOGIC ---
  const handleCreateManualAppointment = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Scheduling appointment...");
    
    try {
      setActionLoading(true);
      
      const res = await fetch(`${BACKEND_URL}/health/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newAppointment),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to schedule appointment.");

      // Add to state and sort chronologically
      setHistoryData((prev) => {
        const updatedAppointments = [...prev.appointments, data.data];
        updatedAppointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        return { ...prev, appointments: updatedAppointments };
      });

      toast.success("Appointment scheduled successfully!", { id: toastId });
      
      // Reset and close
      setNewAppointment({ doctorName: '', appointmentDate: '', reason: '' });
      setIsAppointmentModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to schedule appointment.", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const renderHero = () => (
    <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-2 text-center md:text-left">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
          Digital Health Vault
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold">Medical Vault & Profile</h2>
        <p className="text-sky-100 text-xs md:text-sm">
          A secure chronological timeline and your AI-extracted lifelong health conditions.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/health/prescriptions')}
        className="relative z-10 px-5 py-2.5 bg-white text-indigo-900 text-xs font-bold rounded-2xl shadow-md hover:bg-slate-100 transition cursor-pointer"
      >
        + Upload Prescription
      </button>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-8">
      {/* UPCOMING APPOINTMENTS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <span>🩺 Upcoming Appointments</span>
            <span className="text-xs font-normal text-slate-400">({historyData.appointments.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsAppointmentModalOpen(true)}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 w-fit"
          >
            + Add Manually
          </button>
        </div>

        {historyData.appointments.length === 0 ? (
          <p className="text-xs text-slate-400 bg-white p-4 rounded-2xl border border-slate-200">
            No doctor appointments scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyData.appointments.map((app) => (
              <div key={app._id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">{app.doctorName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                      {app.status}
                    </span>
                    <button onClick={() => openDeleteModal('appointment', app._id)} className="text-red-400 hover:text-red-600 transition cursor-pointer" title="Delete Appointment">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium">📅 {new Date(app.appointmentDate).toLocaleString()}</p>
                {app.reason && <p className="text-[11px] text-slate-400">Reason: {app.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRESCRIPTION ARCHIVE */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
          <span>📁 Prescription Archive</span>
          <span className="text-xs font-normal text-slate-400">({historyData.prescriptions.length})</span>
        </h3>

        {historyData.prescriptions.length === 0 ? (
          <p className="text-xs text-slate-400 bg-white p-4 rounded-2xl border border-slate-200">
            No uploaded prescriptions found.
          </p>
        ) : (
          <div className="space-y-3">
            {historyData.prescriptions.map((p) => (
              <div key={p._id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg">
                    {p.fileType === 'pdf' ? '📄' : '🖼️'}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{p.doctorName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Uploaded on {new Date(p.createdAt).toLocaleDateString()} • {p.fileType.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer">
                    View File ↗
                  </a>
                  <button onClick={() => openDeleteModal('prescription', p._id)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition cursor-pointer" title="Delete Prescription">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      
      {/* CHRONIC CONDITIONS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-serif font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <span>⚠️ Chronic Conditions (Lifetime)</span>
          <span className="text-xs font-normal text-slate-400">({healthProfile.chronicConditions?.length || 0})</span>
        </h3>
        {(!healthProfile.chronicConditions || healthProfile.chronicConditions.length === 0) ? (
          <p className="text-xs text-slate-400">No chronic conditions identified.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {healthProfile.chronicConditions.map((cond, idx) => (
              <span key={idx} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
                {cond.diseaseName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* TEMPORARY CONDITIONS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-serif font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <span>🤒 Recent/Temporary Illnesses</span>
          <span className="text-xs font-normal text-slate-400">({healthProfile.temporaryConditions?.length || 0})</span>
        </h3>
        {(!healthProfile.temporaryConditions || healthProfile.temporaryConditions.length === 0) ? (
          <p className="text-xs text-slate-400">No temporary illnesses logged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {healthProfile.temporaryConditions.map((cond, idx) => (
              <span key={idx} className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold">
                {cond.diseaseName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* HISTORICAL RISKS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-serif font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
          <span>🧬 Historical Risks / Allergies</span>
          <span className="text-xs font-normal text-slate-400">({healthProfile.historicalRisks?.length || 0})</span>
        </h3>
        {(!healthProfile.historicalRisks || healthProfile.historicalRisks.length === 0) ? (
          <p className="text-xs text-slate-400">No historical risks logged.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {healthProfile.historicalRisks.map((risk, idx) => (
              <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold">
                {risk.riskName}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );

  const tabs = [
    { key: TAB_KEYS.TIMELINE, label: "History Timeline" },
    { key: TAB_KEYS.PROFILE, label: "My Health Profile" }
  ];

  return (
    <>
      <FeatureLayout
        badgeText="Health OS"
        title="Medical History"
        subtitle="Complete chronological timeline and profile"
        onBack={() => navigate(-1)}
        backTooltip="Go Back"
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
          <div className="mt-6">
            {activeTab === TAB_KEYS.TIMELINE && renderTimelineTab()}
            {activeTab === TAB_KEYS.PROFILE && renderProfileTab()}
          </div>
        )}
      />

      {/* ADD APPOINTMENT MODAL */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Appointment</h3>
              <button 
                onClick={() => setIsAppointmentModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateManualAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Doctor / Clinic Name</label>
                <input 
                  type="text" 
                  required 
                  value={newAppointment.doctorName} 
                  onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. Dr. John Doe" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={newAppointment.appointmentDate} 
                  onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason for Visit (Optional)</label>
                <input 
                  type="text" 
                  value={newAppointment.reason} 
                  onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. Routine Checkup, Fever" 
                />
              </div>

              {/* Notification Toggles */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reminder Options (24hrs before)</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newAppointment.reminder.inApp} onChange={(e) => setNewAppointment({ ...newAppointment, reminder: { ...newAppointment.reminder, inApp: e.target.checked } })} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-xs font-bold text-slate-700">In-App Notification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newAppointment.reminder.email} onChange={(e) => setNewAppointment({ ...newAppointment, reminder: { ...newAppointment.reminder, email: e.target.checked } })} className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-xs font-bold text-slate-700">Email Notification</span>
                </label>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={actionLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer disabled:opacity-50">
                  {actionLoading ? "Scheduling..." : "Save Appointment"}
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
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 capitalize">Delete {deleteModal.type}?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {deleteModal.type === 'prescription' 
                    ? "Are you sure? This will remove the document, medicine schedules, and clean up your health profile."
                    : "Are you sure you want to delete this appointment? This action cannot be undone."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-2xl transition shadow-md cursor-pointer">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}