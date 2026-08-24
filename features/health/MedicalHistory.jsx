import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FeatureLayout from '../../src/components/FeatureLayout';

export default function MedicalHistory() {
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const [historyData, setHistoryData] = useState({
    prescriptions: [],
    medicines: [],
    appointments: [],
    advices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${BACKEND_URL}/health/history`, { credentials: 'include' });
      const data = await res.json();

      if (res.ok && data.data) {
        setHistoryData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch medical history.');
      }
    } catch (err) {
      console.error('History Fetch Error:', err);
      const errMsg = err.message || 'Unable to connect to server.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setPrescriptionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPrescriptionToDelete(null);
  };

  const confirmDeletePrescription = async () => {
    if (!prescriptionToDelete) return;
    
    const id = prescriptionToDelete;
    closeDeleteModal(); // Close modal immediately
    
    const toastId = toast.loading('Deleting prescription & cleaning profile...');

    try {
      const res = await fetch(`${BACKEND_URL}/health/prescriptions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete prescription');

      // Update state to remove the deleted prescription from UI instantly
      setHistoryData((prev) => ({
        ...prev,
        prescriptions: prev.prescriptions.filter((pres) => pres._id !== id)
      }));
      
      toast.success('Prescription and associated data deleted successfully!', { id: toastId });
    } catch (err) {
      console.error('Delete Prescription Error:', err);
      toast.error(err.message || 'Failed to delete prescription.', { id: toastId });
    }
  };

  const renderHero = () => (
    <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-2 text-center md:text-left">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
          Digital Health Vault
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold">Medical History & Timeline</h2>
        <p className="text-sky-100 text-xs md:text-sm">
          A secure, unified chronological timeline of all your prescription records, consultations, and doctor orders.
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

  return (
    <>
      <FeatureLayout
        badgeText="Health OS"
        title="Medical History"
        subtitle="Complete chronological timeline of your health records"
        onBack={() => navigate('/dashboard')}
        loading={loading}
        error={error}
        setError={setError}
        hasItems={true}
        isCreatingNew={false}
        renderHero={renderHero}
        renderTabContent={() => (
          <div className="space-y-8">
            {/* SECTION 1: UPCOMING APPOINTMENTS */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                <span>🩺 Upcoming Appointments</span>
                <span className="text-xs font-normal text-slate-400">({historyData.appointments.length})</span>
              </h3>

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
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">📅 {app.appointmentDate}</p>
                      {app.reason && <p className="text-[11px] text-slate-400">Reason: {app.reason}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: PRESCRIPTION ARCHIVE */}
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
                        <a
                          href={p.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          View File ↗
                        </a>
                        <button
                          onClick={() => openDeleteModal(p._id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition cursor-pointer"
                          title="Delete Prescription"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <h3 className="text-lg font-bold text-slate-900">Delete Prescription?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to delete this record? If this is an active prescription, all associated medicine schedules and advice will also be removed. This action cannot be undone.
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
                onClick={confirmDeletePrescription}
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