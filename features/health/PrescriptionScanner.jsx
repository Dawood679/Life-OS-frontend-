import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureLayout from '../../src/components/FeatureLayout';

export default function PrescriptionScanner() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // NEW: Upload Mode State
  const [recordType, setRecordType] = useState('active'); // 'active' or 'archive'

  // Extracted Data for Review & Edit
  const [extractedData, setExtractedData] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [conditions, setConditions] = useState([]); // Multiple conditions list
  const [medicines, setMedicines] = useState([]);
  const [adviceList, setAdviceList] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a valid image or PDF document.');
      return;
    }

    setSelectedFile(file);
    setError('');

    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleScanPrescription = async () => {
    if (!selectedFile) {
      setError('Please select a prescription file first.');
      return;
    }

    try {
      setIsScanning(true);
      setError('');
      setScanStepMessage('Uploading document securely to cloud...');

      const formData = new FormData();
      formData.append('prescription', selectedFile);

      const res = await fetch(`${BACKEND_URL}/health/prescriptions/scan`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      setScanStepMessage('Running AI Analysis & extracting medical data...');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to parse prescription.');
      }

      setExtractedData(data.data);
      setDoctorName(data.data.doctorName || 'Doctor');
      
      // Dynamic date handling based on upload mode (Archive vs Active)
      if (recordType === 'archive') {
        setAppointmentDate(data.data.prescriptionDate || '');
      } else {
        setAppointmentDate(data.data.followUpDate || data.data.prescriptionDate || '');
      }

      setConditions(data.data.conditions || []);
      setMedicines(data.data.medicines || []);
      setAdviceList(data.data.doctorAdvice || []);
      
      setSuccessMsg(`Prescription scanned! Please review the extracted ${recordType === 'archive' ? 'history' : 'schedules'} below.`);
    } catch (err) {
      console.error('Scan Error:', err);
      setError(err.message || 'Unable to scan the prescription file.');
    } finally {
      setIsScanning(false);
      setScanStepMessage('');
    }
  };

  // Medicine list modification
  const handleAddMedicineRow = () => {
    const today = new Date().toISOString().split('T')[0];
    setMedicines([...medicines, { name: '', dosage: '', frequency: '1+0+1', startDate: today, endDate: today }]);
  };
  const handleRemoveMedicineRow = (index) => setMedicines(medicines.filter((_, idx) => idx !== index));
  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Advice list modification
  const handleAddAdviceRow = () => setAdviceList([...adviceList, { category: 'general', instruction: '', isDailyTask: true }]);
  const handleRemoveAdviceRow = (index) => setAdviceList(adviceList.filter((_, idx) => idx !== index));
  const handleUpdateAdvice = (index, field, value) => {
    const updated = [...adviceList];
    updated[index][field] = value;
    setAdviceList(updated);
  };

  // Final confirmation to database
  const handleConfirmAndSave = async () => {
    try {
      setIsScanning(true);
      setError('');

      const payload = {
        fileUrl: extractedData.fileUrl,
        fileType: extractedData.fileType,
        doctorName,
        rawText: extractedData.rawText,
        recordType,
        conditions, // Sending multiple conditions list
        medicines: recordType === 'active' ? medicines : [],
        appointment: appointmentDate && recordType === 'active' ? { appointmentDate, doctorName } : null,
        adviceList: recordType === 'active' ? adviceList : [],
      };

      const res = await fetch(`${BACKEND_URL}/health/prescriptions/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save confirmed prescription.');

      if (recordType === 'archive') {
        navigate('/health/history');
      } else {
        navigate('/health/medicines');
      }
    } catch (err) {
      console.error('Confirmation Error:', err);
      setError(err.message || 'Failed to save confirmed data.');
    } finally {
      setIsScanning(false);
    }
  };

  const renderHero = () => (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-2 text-center md:text-left">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
          AI Prescription Engine
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold">Smart Scanner & Vault</h2>
        <p className="text-emerald-100 text-xs md:text-sm">
          Upload current prescriptions for daily reminders, or archive old ones to build your lifelong Medical Profile.
        </p>
      </div>
    </div>
  );

  return (
    <FeatureLayout
      badgeText="Health OS"
      title="Prescription Scanner"
      subtitle="AI-assisted prescription ingestion and routine extraction"
      onBack={() => navigate(-1)}
      backTooltip="Go Back"
      error={error}
      setError={setError}
      hasItems={true}
      isCreatingNew={false}
      renderHero={renderHero}
      renderTabContent={() => (
        <div className="space-y-6">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
              <span>{successMsg}</span>
              <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-900 font-bold">×</button>
            </div>
          )}

          {/* UPLOAD SECTION */}
          {!extractedData && (
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200/80 shadow-xs space-y-6">
              
              {/* TOGGLE SWITCH: Active vs Archive */}
              <div className="flex justify-center mb-4">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setRecordType('active')}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      recordType === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    ⚡ Active Treatment
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordType('archive')}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      recordType === 'archive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    🗄️ Past Record (Vault)
                  </button>
                </div>
              </div>
              
              <p className="text-center text-xs text-slate-500 max-w-md mx-auto">
                {recordType === 'active' 
                  ? "We'll extract medicines and lifestyle rules to build your daily tracking schedule."
                  : "We'll extract your health conditions to update your Health Profile without triggering daily reminders."}
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-3xl p-8 md:p-12 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20 flex flex-col items-center justify-center space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${recordType === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {recordType === 'active' ? '📄' : '🗂️'}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click or Drag prescription file here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP, and PDF documents (Max 10MB)</p>
                </div>
              </div>

              {/* File Preview */}
              {filePreview && (
                <div className="max-w-xs mx-auto border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <img src={filePreview} alt="Prescription preview" className="w-full h-48 object-cover" />
                </div>
              )}

              {selectedFile && !filePreview && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs font-semibold text-sky-800 text-center">
                  📄 PDF Selected: {selectedFile.name}
                </div>
              )}

              <button
                type="button"
                onClick={handleScanPrescription}
                disabled={!selectedFile || isScanning}
                className={`w-full hover:opacity-95 text-white py-3.5 rounded-2xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${recordType === 'active' ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-gradient-to-r from-indigo-600 to-purple-500'}`}
              >
                {isScanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>{scanStepMessage || 'Analyzing Document...'}</span>
                  </>
                ) : (
                  recordType === 'active' ? 'Scan & Extract Medicines' : 'Archive & Extract Profile'
                )}
              </button>
            </div>
          )}

          {/* VERIFICATION & EDIT SCREEN */}
          {extractedData && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {recordType === 'archive' ? 'Review Vault Data' : 'Review & Confirm Schedules'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify the extracted AI data before saving it to your LifeOS account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExtractedData(null);
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
                >
                  Discard & Upload Another
                </button>
              </div>

              {/* Shared Info: Doctor & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Doctor / Hospital Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {recordType === 'active' ? 'Next Appointment Date' : 'Record Date'}
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Multiple Conditions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">🧠 AI Identified Health Conditions ({conditions.length})</h4>
                  <button
                    type="button"
                    onClick={() => setConditions([...conditions, { name: '', type: 'chronic', summary: '' }])}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    + Add Condition
                  </button>
                </div>

                <div className="space-y-3">
                  {conditions.map((cond, idx) => (
                    <div key={idx} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <input
                          type="text"
                          value={cond.name}
                          onChange={(e) => {
                            const updated = [...conditions];
                            updated[idx].name = e.target.value;
                            setConditions(updated);
                          }}
                          placeholder="Condition name (e.g. Type 2 Diabetes)"
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400"
                        />
                        <select
                          value={cond.type}
                          onChange={(e) => {
                            const updated = [...conditions];
                            updated[idx].type = e.target.value;
                            setConditions(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-400"
                        >
                          <option value="chronic">Chronic</option>
                          <option value="temporary">Temporary</option>
                          <option value="historical_risk">Historical Risk</option>
                          <option value="unknown">Unknown</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setConditions(conditions.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 text-xs font-bold p-1 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">Summary: {cond.summary || 'No summary available.'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ONLY SHOW MEDICINES & ADVICE IN ACTIVE MODE */}
              {recordType === 'active' && (
                <>
                  {/* Medicines Checklist */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>💊 Prescribed Medicines</span>
                        <span className="text-xs font-normal text-slate-400">({medicines.length} found)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddMedicineRow}
                        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        + Add Another Medicine
                      </button>
                    </div>

                    <div className="space-y-3">
                      {medicines.map((med, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Medicine Name</label>
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dosage</label>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frequency</label>
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                            />
                          </div>
                          <div className="sm:col-span-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(idx)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold p-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifestyle / Doctor Advice */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>🏃‍♂️ Doctor's Lifestyle & Diet Rules</span>
                        <span className="text-xs font-normal text-slate-400">({adviceList.length} found)</span>
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddAdviceRow}
                        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        + Add Rule
                      </button>
                    </div>

                    <div className="space-y-3">
                      {adviceList.map((adv, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
                          <select
                            value={adv.category}
                            onChange={(e) => handleUpdateAdvice(idx, 'category', e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                          >
                            <option value="exercise">Exercise / Walk</option>
                            <option value="diet_restriction">Diet Restriction</option>
                            <option value="lifestyle">Lifestyle</option>
                            <option value="general">General</option>
                          </select>
                          <input
                            type="text"
                            value={adv.instruction}
                            onChange={(e) => handleUpdateAdvice(idx, 'instruction', e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdviceRow(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold p-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Final Confirm Button */}
              <button
                type="button"
                onClick={handleConfirmAndSave}
                disabled={isScanning}
                className={`w-full hover:opacity-95 text-white py-3.5 rounded-2xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${
                  recordType === 'active' 
                  ? 'bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600' 
                  : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isScanning 
                  ? 'Saving Data...' 
                  : recordType === 'active' 
                    ? 'Confirm & Save Active Schedules' 
                    : 'Save to Vault & Update Profile'
                }
              </button>
            </div>
          )}
        </div>
      )}
    />
  );
}