import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Layout from "../../src/components/Layout";
import {
  Briefcase,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Columns3,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  FileText,
  UserCheck,
  Send,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default function JobTracker() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Core Applications State (Single Source of Truth)
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // View State: "kanban" | "table"
  const [currentView, setCurrentView] = useState("board");

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Modal / Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [modalTab, setModalTab] = useState("general"); // "general" | "reminders" | "networking" | "circular"

  // Bulk Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, company: "", role: "" });

  // Form State (16-Field Specification)
  const initialFormState = {
    company: "",
    roleTitle: "",
    appliedDate: new Date().toISOString().split("T")[0],
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: "medium",
    jobType: "full_time",
    source: "linkedin",
    jobUrl: "",
    status: "applied",
    interviewDate: "",
    notificationPref: "in_app",
    salaryRange: "",
    location: "remote",
    locationDetail: "",
    contactEmail: "",
    networkingName: "",
    networkingUrl: "",
    networkingNotes: "",
    rejectionCategory: "none",
    rejectionDetails: "",
    jobDescription: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // 5 Canonical Kanban Stages
  const COLUMNS = [
    { id: "wishlist", title: "Wishlist", icon: "📌", color: "sky", borderColor: "border-sky-300", bgLight: "bg-sky-50/60" },
    { id: "applied", title: "Applied", icon: "📤", color: "amber", borderColor: "border-amber-300", bgLight: "bg-amber-50/60" },
    { id: "interviewing", title: "Interviewing", icon: "🎙️", color: "indigo", borderColor: "border-indigo-300", bgLight: "bg-indigo-50/60" },
    { id: "offer", title: "Offer Received", icon: "🎉", color: "emerald", borderColor: "border-emerald-300", bgLight: "bg-emerald-50/60" },
    { id: "rejected", title: "Archived / Rejected", icon: "📦", color: "slate", borderColor: "border-slate-300", bgLight: "bg-slate-50/60" },
  ];

  // Fetch Applications on Mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/job-applications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.applications) {
        setApplications(data.applications);
      } else {
        toast.error(data.message || "Failed to load job applications.");
      }
    } catch {
      toast.error("Network error fetching job applications.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Applications Derived State (Single Source of Truth)
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (priorityFilter !== "all" && app.priority !== priorityFilter) return false;
      if (locationFilter !== "all" && app.location !== locationFilter) return false;
      if (sourceFilter !== "all" && app.source !== sourceFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const comp = (app.company || "").toLowerCase();
        const role = (app.roleTitle || "").toLowerCase();
        const loc = (app.locationDetail || "").toLowerCase();
        const contact = (app.networking?.personName || "").toLowerCase();
        const note = (app.notes || "").toLowerCase();

        return (
          comp.includes(query) ||
          role.includes(query) ||
          loc.includes(query) ||
          contact.includes(query) ||
          note.includes(query)
        );
      }

      return true;
    });
  }, [applications, statusFilter, priorityFilter, locationFilter, sourceFilter, searchQuery]);

  // Funnel & Executive Analytics Derived State
  const pipelineStats = useMemo(() => {
    const total = applications.length;
    let wishlistCount = 0;
    let appliedCount = 0;
    let interviewingCount = 0;
    let offerCount = 0;
    let rejectedCount = 0;
    let followUpDueCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    applications.forEach((app) => {
      if (app.status === "wishlist") wishlistCount++;
      else if (app.status === "applied") {
        appliedCount++;
        if (app.followUpDate) {
          const fDate = new Date(app.followUpDate).toISOString().split("T")[0];
          if (fDate <= todayStr) {
            followUpDueCount++;
          }
        }
      } else if (app.status === "interviewing") interviewingCount++;
      else if (app.status === "offer") offerCount++;
      else if (app.status === "rejected") rejectedCount++;
    });

    const activePipeline = appliedCount + interviewingCount + offerCount;
    const interviewRate = appliedCount > 0 ? Math.round((interviewingCount / appliedCount) * 100) : 0;
    const offerRate = interviewingCount > 0 ? Math.round((offerCount / interviewingCount) * 100) : 0;

    return {
      total,
      wishlistCount,
      appliedCount,
      interviewingCount,
      offerCount,
      rejectedCount,
      activePipeline,
      followUpDueCount,
      interviewRate,
      offerRate,
    };
  }, [applications]);

  // Open Create Modal
  const handleOpenCreateModal = (defaultStatus = "applied") => {
    setFormData({
      ...initialFormState,
      status: defaultStatus,
    });
    setModalMode("create");
    setSelectedAppId(null);
    setModalTab("general");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (app) => {
    setFormData({
      company: app.company || "",
      roleTitle: app.roleTitle || "",
      appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split("T")[0] : "",
      followUpDate: app.followUpDate ? new Date(app.followUpDate).toISOString().split("T")[0] : "",
      priority: app.priority || "medium",
      jobType: app.jobType || "full_time",
      source: app.source || "linkedin",
      jobUrl: app.jobUrl || "",
      status: app.status || "applied",
      interviewDate: app.interviewDate ? new Date(app.interviewDate).toISOString().split("T")[0] : "",
      notificationPref: app.notificationPref || "in_app",
      salaryRange: app.salaryRange || "",
      location: app.location || "remote",
      locationDetail: app.locationDetail || "",
      contactEmail: app.contactEmail || "",
      networkingName: app.networking?.personName || "",
      networkingUrl: app.networking?.profileUrl || "",
      networkingNotes: app.networking?.notes || "",
      rejectionCategory: app.rejectionReason?.category || "none",
      rejectionDetails: app.rejectionReason?.details || "",
      jobDescription: app.jobDescription || "",
      notes: app.notes || "",
    });
    setModalMode("edit");
    setSelectedAppId(app._id);
    setModalTab("general");
    setIsModalOpen(true);
  };

  // Form Submission (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.roleTitle.trim()) {
      toast.error("Company name and Job Title are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        company: formData.company.trim(),
        roleTitle: formData.roleTitle.trim(),
        appliedDate: formData.appliedDate || undefined,
        followUpDate: formData.followUpDate || undefined,
        priority: formData.priority,
        jobType: formData.jobType,
        source: formData.source,
        jobUrl: formData.jobUrl.trim(),
        status: formData.status,
        interviewDate: formData.interviewDate || undefined,
        notificationPref: formData.notificationPref,
        salaryRange: formData.salaryRange.trim(),
        location: formData.location,
        locationDetail: formData.locationDetail.trim(),
        contactEmail: formData.contactEmail.trim().toLowerCase(),
        networking: {
          personName: formData.networkingName.trim(),
          profileUrl: formData.networkingUrl.trim(),
          notes: formData.networkingNotes.trim(),
        },
        rejectionReason: {
          category: formData.rejectionCategory,
          details: formData.rejectionDetails.trim(),
        },
        jobDescription: formData.jobDescription.trim(),
        notes: formData.notes.trim(),
      };

      const url = modalMode === "create" ? `${BACKEND_URL}/job-applications` : `${BACKEND_URL}/job-applications/${selectedAppId}`;
      const method = modalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.application) {
        toast.success(modalMode === "create" ? "Application tracked! (+Career Score boost)" : "Application updated.");
        if (modalMode === "create") {
          setApplications((prev) => [data.application, ...prev]);
        } else {
          setApplications((prev) => prev.map((a) => (a._id === selectedAppId ? data.application : a)));
        }
        setIsModalOpen(false);
      } else {
        toast.error(data.message || "Failed to save application.");
      }
    } catch {
      toast.error("Error saving job application.");
    } finally {
      setSaving(false);
    }
  };

  // Status Change Handler (Used by both Kanban Drag & Drop and Table dropdown)
  const handleStatusChange = async (appId, newStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      const res = await fetch(`${BACKEND_URL}/job-applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.application) {
        toast.success(`Moved to ${newStatus.replace("_", " ")}`);
        // Sync full record
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? data.application : app))
        );
      } else {
        toast.error("Failed to update status on server.");
        fetchApplications(); // Rollback
      }
    } catch {
      toast.error("Network error updating status.");
      fetchApplications();
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData("text/plain", appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("text/plain");
    if (appId) {
      handleStatusChange(appId, targetStatus);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`${BACKEND_URL}/job-applications/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Application deleted.");
        setApplications((prev) => prev.filter((a) => a._id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null, company: "", role: "" });
      } else {
        toast.error("Failed to delete application.");
      }
    } catch {
      toast.error("Error deleting application.");
    }
  };

  // 1-Click AI Power Bridges
  const handleLaunchMockInterview = (app) => {
    navigate("/career/mock-interview", {
      state: {
        roleTitle: app.roleTitle || "Software Engineer",
        jobDescription: app.jobDescription || "",
      },
    });
  };

  const handleLaunchSkillGap = (app) => {
    navigate("/learning/job-match", {
      state: {
        jobTitle: app.roleTitle,
        company: app.company,
        jobDescription: app.jobDescription || "",
      },
    });
  };

  const handleLaunchResumeAnalyzer = (app) => {
    navigate("/career/resume", {
      state: {
        targetRole: app.roleTitle,
        jobDescription: app.jobDescription || "",
      },
    });
  };

  // Helper to format date safely as clean ISO string (YYYY-MM-DD)
  const formatDateValue = (dateVal) => {
    if (!dateVal) return "";
    try {
      if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        return dateVal;
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // True Native Excel (.xlsx) Export Handler (Standard 16 Columns with Auto-Widths)
  const handleExportExcel = () => {
    if (applications.length === 0) {
      toast.error("No applications to export.");
      return;
    }

    const headers = [
      "Applied Date",
      "Follow-up Date",
      "Company Name",
      "Job Title / Role",
      "Priority",
      "Job Type",
      "Source",
      "Job Link",
      "Status",
      "Interview Date",
      "Notification Preference",
      "Salary Range",
      "Location",
      "Contact Email",
      "Networking Contact",
      "Job Description",
    ];

    const rows = applications.map((app) => [
      formatDateValue(app.appliedDate),
      formatDateValue(app.followUpDate),
      app.company || "",
      app.roleTitle || "",
      app.priority || "medium",
      app.jobType || "full_time",
      app.source || "linkedin",
      app.jobUrl || "",
      app.status || "applied",
      formatDateValue(app.interviewDate),
      app.notificationPref || "in_app",
      app.salaryRange || "",
      app.location || "remote",
      app.contactEmail || "",
      app.networking?.personName || "",
      (app.jobDescription || "").replace(/\r?\n|\r/g, " "),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set professional column widths
    worksheet["!cols"] = [
      { wch: 14 }, // Applied Date
      { wch: 14 }, // Follow-up Date
      { wch: 22 }, // Company Name
      { wch: 26 }, // Role Title
      { wch: 12 }, // Priority
      { wch: 14 }, // Job Type
      { wch: 14 }, // Source
      { wch: 30 }, // Job Link
      { wch: 14 }, // Status
      { wch: 14 }, // Interview Date
      { wch: 16 }, // Notification
      { wch: 18 }, // Salary Range
      { wch: 14 }, // Location
      { wch: 24 }, // Contact Email
      { wch: 24 }, // Networking Contact
      { wch: 40 }, // Job Description
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Job Applications");

    const fileName = `LifeOS_Job_Applications_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Excel (.xlsx) file exported successfully!");
  };

  // True Native Excel (.xlsx) Sample Template Download Handler
  const handleDownloadTemplate = () => {
    const headers = [
      "Applied Date",
      "Follow-up Date",
      "Company Name",
      "Job Title / Role",
      "Priority",
      "Job Type",
      "Source",
      "Job Link",
      "Status",
      "Interview Date",
      "Notification Preference",
      "Salary Range",
      "Location",
      "Contact Email",
      "Networking Contact",
      "Job Description",
    ];

    const todayStr = new Date().toISOString().split("T")[0];
    const followUpStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const interviewStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const sampleRows = [
      [
        todayStr,
        followUpStr,
        "Google",
        "Senior Frontend Engineer",
        "high",
        "full_time",
        "linkedin",
        "https://careers.google.com/jobs/results/123",
        "applied",
        "",
        "in_app",
        "$140k - $160k / yr",
        "remote",
        "recruiter@google.com",
        "Sarah Jenkins (Tech Recruiter)",
        "Must have 4+ years of React, TypeScript, Performance optimization and distributed web apps experience.",
      ],
      [
        todayStr,
        followUpStr,
        "Brain Station 23",
        "Full Stack Node.js Developer",
        "medium",
        "full_time",
        "bdjobs",
        "https://bdjobs.com/job/456",
        "interviewing",
        interviewStr,
        "both",
        "৳90,000 - ৳120,000 / mo",
        "hybrid",
        "hr@brainstation-23.com",
        "Tanvir Hasan (Engineering Lead)",
        "Experience with NestJS, MongoDB, Microservices, and Redis caching.",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    worksheet["!cols"] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 22 },
      { wch: 26 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 30 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 14 },
      { wch: 24 },
      { wch: 24 },
      { wch: 40 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, "LifeOS_Job_Applications_Template.xlsx");
    toast.success("Excel (.xlsx) sample template downloaded!");
  };

  // Universal File Picker & Parser for .xlsx, .xls, and .csv
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target.result;
        const workbook = XLSX.read(buffer, {
          type: "array",
          cellDates: true,
          dateNF: "yyyy-mm-dd",
        });

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          toast.error("The selected Excel workbook has no sheets.");
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        if (!rawRows || rawRows.length <= 1) {
          toast.error("The selected file is empty or has no data rows.");
          return;
        }

        const cleanStr = (val) => {
          if (val === null || val === undefined) return "";
          let s = String(val).trim();
          s = s.replace(/^="?|"?$/g, "").replace(/^["']|["']$/g, "").trim();
          return s;
        };

        const parsedRows = [];
        for (let i = 1; i < rawRows.length; i++) {
          const cols = rawRows[i].map(cleanStr);
          // Check if row has meaningful data
          if (cols.some((c) => c.length > 0)) {
            parsedRows.push({
              appliedDate: cols[0] || new Date().toISOString().split("T")[0],
              followUpDate: cols[1] || "",
              company: cols[2] || cols[0],
              roleTitle: cols[3] || cols[1],
              priority: (cols[4] || "medium").toLowerCase(),
              jobType: (cols[5] || "full_time").toLowerCase(),
              source: (cols[6] || "linkedin").toLowerCase(),
              jobUrl: cols[7] || "",
              status: (cols[8] || "applied").toLowerCase(),
              interviewDate: cols[9] || "",
              notificationPref: (cols[10] || "in_app").toLowerCase(),
              salaryRange: cols[11] || "",
              location: (cols[12] || "remote").toLowerCase(),
              contactEmail: cols[13] || "",
              networkingContact: cols[14] || "",
              jobDescription: cols[15] || "",
            });
          }
        }

        if (parsedRows.length === 0) {
          toast.error("Could not parse valid application rows. Please check file format.");
          return;
        }

        setImportPreviewData(parsedRows);
        setIsImportModalOpen(true);
      } catch (err) {
        console.error("Excel parse error:", err);
        toast.error("Error reading file. Please upload a valid Excel (.xlsx/.xls) or CSV file.");
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = null; // reset input
  };

  // Submit Bulk Import Payload
  const handleConfirmImport = async () => {
    if (importPreviewData.length === 0) return;
    try {
      setIsImporting(true);
      const res = await fetch(`${BACKEND_URL}/job-applications/bulk-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: importPreviewData }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Applications successfully imported!");
        setIsImportModalOpen(false);
        setImportPreviewData([]);
        fetchApplications();
      } else {
        toast.error(data.message || "Failed to import applications.");
      }
    } catch {
      toast.error("Network error during bulk import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn pb-16 font-sans text-slate-800 text-left">
      {/* Hidden File Input for Excel (.xlsx, .xls) and CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
      />

      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Go Back"
            >
              ←
            </button>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase tracking-wider">
              CareerOS Pipeline
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-slate-900 tracking-tight">
            Job Application Tracker
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Manage your recruitment stages from wishlist to offers with 1-click tailored AI mock interviews and gap analysis.
          </p>
        </div>

        {/* View Mode Switcher & Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dual View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setCurrentView("board")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === "board"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Pipeline Board</span>
            </button>
            <button
              onClick={() => setCurrentView("table")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === "table"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel Table</span>
            </button>
          </div>

          {/* Excel / Spreadsheet Suite Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Export all records as Microsoft Excel (.xlsx) file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Download Sample Excel (.xlsx) Template"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Template</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Bulk import applications from Excel (.xlsx/.xls) or CSV"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenCreateModal("applied")}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Job</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE PIPELINE CONVERSION FUNNEL BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Tracked */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tracked</p>
          <p className="text-2xl font-serif font-black text-slate-900">{pipelineStats.total}</p>
          <span className="text-[10px] text-slate-400">Opportunities</span>
        </div>

        {/* Applied */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Submissions</p>
          <p className="text-2xl font-serif font-black text-amber-900">{pipelineStats.appliedCount}</p>
          <span className="text-[10px] text-amber-600">Awaiting response</span>
        </div>

        {/* In Interview */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/20 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">In Interview</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-serif font-black text-indigo-900">{pipelineStats.interviewingCount}</p>
            <span className="text-[10px] font-bold text-indigo-600">{pipelineStats.interviewRate}% rate</span>
          </div>
          <span className="text-[10px] text-indigo-600">Active screening/tech</span>
        </div>

        {/* Offers Received */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Offers Won</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-serif font-black text-emerald-900">{pipelineStats.offerCount}</p>
            <span className="text-[10px] font-bold text-emerald-600">{pipelineStats.offerRate}% conv</span>
          </div>
          <span className="text-[10px] text-emerald-600">Closing stage</span>
        </div>

        {/* Follow-up Alerts */}
        <div className={`bg-white p-4 rounded-2xl border shadow-2xs space-y-1 ${
          pipelineStats.followUpDueCount > 0
            ? "border-rose-300 bg-rose-50/30 text-rose-900 animate-pulse"
            : "border-slate-200/80"
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Follow-ups Due</p>
          <p className={`text-2xl font-serif font-black ${pipelineStats.followUpDueCount > 0 ? "text-rose-600" : "text-slate-800"}`}>
            {pipelineStats.followUpDueCount}
          </p>
          <span className="text-[10px] text-slate-400">{pipelineStats.followUpDueCount > 0 ? "Action required!" : "All up to date"}</span>
        </div>

        {/* Career Life Score Boost */}
        <div className="bg-gradient-to-br from-indigo-500 to-sky-500 text-white p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-100">Career Velocity</p>
          <p className="text-2xl font-serif font-black text-white">Active 🚀</p>
          <span className="text-[10px] text-sky-100">+1.0 unit / application</span>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role, city, or contact name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Archived</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">⭐ High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Workplaces</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="linkedin">LinkedIn</option>
            <option value="bdjobs">Bdjobs</option>
            <option value="company_website">Company Website</option>
            <option value="referral">Referral</option>
            <option value="facebook">Facebook</option>
          </select>

          {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || locationFilter !== "all" || sourceFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setLocationFilter("all");
                setSourceFilter("all");
              }}
              className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {currentView === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = filteredApplications.filter((app) => app.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`rounded-3xl p-3.5 border ${col.borderColor} ${col.bgLight} min-h-[500px] flex flex-col space-y-3 shadow-2xs transition`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1.5 pt-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <span>{col.icon}</span>
                    <span>{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-extrabold border border-slate-200">
                      {colApps.length}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenCreateModal(col.id)}
                    className="p-1 rounded-lg hover:bg-white text-slate-500 transition cursor-pointer"
                    title={`Add job to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container with Sleek Column Scroll & Scale Control */}
                <div className="space-y-3 flex-1 max-h-[640px] overflow-y-auto pr-1">
                  {colApps.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center space-y-1">
                      <span className="text-base">📭</span>
                      <span>No jobs in {col.title}</span>
                    </div>
                  ) : (
                    <>
                      {colApps.slice(0, 10).map((app) => {
                        const isFollowUpDue =
                          app.status === "applied" &&
                          app.followUpDate &&
                          new Date(app.followUpDate).toISOString().split("T")[0] <=
                            new Date().toISOString().split("T")[0];

                        return (
                          <div
                            key={app._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, app._id)}
                            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition cursor-grab active:cursor-grabbing space-y-3 group"
                          >
                            {/* Top Row: Company, Priority, Status Dropdown */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5 min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 truncate block">
                                  {app.company}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                                  {app.roleTitle}
                                </h4>
                              </div>

                              {app.priority === "high" && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase shrink-0">
                                  ⭐ High
                                </span>
                              )}
                            </div>

                            {/* Metadata Tags: Location, Salary, Source */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                                {app.location === "remote" ? "🌐 Remote" : app.location === "hybrid" ? "🏢 Hybrid" : "📍 Onsite"}
                              </span>

                              {app.salaryRange && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                                  {app.salaryRange}
                                </span>
                              )}

                              {app.source && (
                                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 capitalize font-medium">
                                  {app.source.replace("_", " ")}
                                </span>
                              )}
                            </div>

                            {/* Applied / Follow-up Alert Notification */}
                            {isFollowUpDue && (
                              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>⚠️ Follow-up Due Today!</span>
                              </div>
                            )}

                            {/* Interview Scheduled Badge */}
                            {app.interviewDate && app.status === "interviewing" && (
                              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>Round: {new Date(app.interviewDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                              </div>
                            )}

                            {/* Networking Contact */}
                            {app.networking?.personName && (
                              <div className="text-[10px] text-slate-600 flex items-center gap-1 truncate">
                                <span className="text-slate-400">Contact:</span>
                                <span className="font-semibold">{app.networking.personName}</span>
                              </div>
                            )}

                            {/* Rejection Category Tag if in Rejected Column */}
                            {app.status === "rejected" && app.rejectionReason?.category && app.rejectionReason.category !== "none" && (
                              <div className="text-[10px] text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 font-medium">
                                Reason: {app.rejectionReason.category.replace(/_/g, " ")}
                              </div>
                            )}

                            {/* 1-Click AI Power Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <button
                                type="button"
                                onClick={() => handleLaunchMockInterview(app)}
                                className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-95 text-white text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs active:scale-[0.98]"
                              >
                                <span>🎙️ Practice Interview ➔</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleLaunchSkillGap(app)}
                                  className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-semibold transition cursor-pointer"
                                >
                                  🎯 Gap Match
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleLaunchResumeAnalyzer(app)}
                                  className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 text-[10px] font-semibold transition cursor-pointer"
                                >
                                  📄 Resume
                                </button>
                              </div>
                            </div>

                            {/* Card Footer: Date, External Link, Edit, Delete */}
                            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                              <span>
                                {app.appliedDate
                                  ? new Date(app.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                  : "No date"}
                              </span>

                              <div className="flex items-center gap-1">
                                {app.jobUrl && (
                                  <a
                                    href={app.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 hover:text-indigo-600 transition"
                                    title="Open Job Link"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                <button
                                  onClick={() => handleOpenEditModal(app)}
                                  className="p-1 hover:text-slate-700 transition cursor-pointer"
                                  title="Edit Job"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() =>
                                    setDeleteModal({
                                      isOpen: true,
                                      id: app._id,
                                      company: app.company,
                                      role: app.roleTitle,
                                    })
                                  }
                                  className="p-1 hover:text-rose-600 transition cursor-pointer"
                                  title="Delete Job"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Bridge to Table View if more than 10 cards */}
                      {colApps.length > 10 && (
                        <div className="pt-2 pb-1">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter(col.id);
                              setCurrentView("table");
                            }}
                            className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 shadow-2xs transition text-[11px] font-bold text-indigo-700 flex items-center justify-between group cursor-pointer"
                          >
                            <span>+{colApps.length - 10} more in {col.title}</span>
                            <span className="text-[10px] bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white text-indigo-800 px-2 py-0.5 rounded-lg transition">
                              View in Table ➔
                            </span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: EXCEL / SPREADSHEET TABLE MODE */}
      {currentView === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-3 pl-5">Applied Date</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Role Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Job Type</th>
                  <th className="p-3">Salary Range</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Follow-up Date</th>
                  <th className="p-3">Interview Date</th>
                  <th className="p-3">Networking Contact</th>
                  <th className="p-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-slate-400">
                      No applications match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 pl-5 whitespace-nowrap text-slate-600 font-mono">
                        {app.appliedDate ? new Date(app.appliedDate).toISOString().split("T")[0] : "-"}
                      </td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{app.company}</td>
                      <td className="p-3 font-medium text-slate-800 whitespace-nowrap">{app.roleTitle}</td>
                      <td className="p-3 whitespace-nowrap">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className="px-2 py-1 bg-slate-100 rounded-lg text-[11px] font-bold capitalize cursor-pointer border border-slate-200"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Archived</option>
                        </select>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            app.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : app.priority === "low"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {app.priority || "medium"}
                        </span>
                      </td>
                      <td className="p-3 capitalize text-slate-600 whitespace-nowrap">
                        {(app.jobType || "full_time").replace("_", " ")}
                      </td>
                      <td className="p-3 font-semibold text-emerald-700 whitespace-nowrap">{app.salaryRange || "-"}</td>
                      <td className="p-3 capitalize text-slate-600 whitespace-nowrap">{app.location || "remote"}</td>
                      <td className="p-3 capitalize text-slate-600 whitespace-nowrap">
                        {(app.source || "linkedin").replace("_", " ")}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap font-mono">
                        {app.followUpDate ? new Date(app.followUpDate).toISOString().split("T")[0] : "-"}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap font-mono">
                        {app.interviewDate ? new Date(app.interviewDate).toISOString().split("T")[0] : "-"}
                      </td>
                      <td className="p-3 text-slate-600 whitespace-nowrap">{app.networking?.personName || "-"}</td>
                      <td className="p-3 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click AI Power Buttons */}
                          <button
                            onClick={() => handleLaunchMockInterview(app)}
                            className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Launch AI Mock Interview with JD"
                          >
                            <span>🎙️ Practice</span>
                          </button>

                          <button
                            onClick={() => handleLaunchSkillGap(app)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                            title="Analyze Skill Gaps & Compatibility"
                          >
                            <span>🎯 Match</span>
                          </button>

                          <button
                            onClick={() => handleLaunchResumeAnalyzer(app)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                            title="Tailor Resume & Pitch"
                          >
                            <span>📄 Resume</span>
                          </button>

                          {/* Quick Edit & Delete */}
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                id: app._id,
                                company: app.company,
                                role: app.roleTitle,
                              })
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT DRAWER / MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-slate-900">
                  {modalMode === "create" ? "Add New Job Application" : "Edit Application Record"}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in candidate and circular details to maintain automated follow-up reminders and AI interview bridges.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex border-b border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setModalTab("general")}
                className={`pb-2.5 px-3 font-bold transition cursor-pointer border-b-2 ${
                  modalTab === "general"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                1. General Details
              </button>
              <button
                type="button"
                onClick={() => setModalTab("reminders")}
                className={`pb-2.5 px-3 font-bold transition cursor-pointer border-b-2 ${
                  modalTab === "reminders"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                2. Dates & Alerts
              </button>
              <button
                type="button"
                onClick={() => setModalTab("networking")}
                className={`pb-2.5 px-3 font-bold transition cursor-pointer border-b-2 ${
                  modalTab === "networking"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                3. Networking & Contact
              </button>
              <button
                type="button"
                onClick={() => setModalTab("circular")}
                className={`pb-2.5 px-3 font-bold transition cursor-pointer border-b-2 ${
                  modalTab === "circular"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                4. Job Circular & AI
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* TAB 1: GENERAL DETAILS */}
              {modalTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g., Google, Brain Station 23, Shopify..."
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Job Title / Target Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.roleTitle}
                        onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                        placeholder="e.g., Senior Full Stack Engineer, Node.js Intern..."
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Pipeline Stage
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      >
                        <option value="wishlist">📌 Wishlist</option>
                        <option value="applied">📤 Applied</option>
                        <option value="interviewing">🎙️ Interviewing</option>
                        <option value="offer">🎉 Offer Received</option>
                        <option value="rejected">📦 Archived / Rejected</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Priority Level
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      >
                        <option value="high">⭐ High (Dream Job)</option>
                        <option value="medium">Medium (Target Option)</option>
                        <option value="low">Low (Safety / Backup)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Job Type
                      </label>
                      <select
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      >
                        <option value="full_time">Full-Time</option>
                        <option value="part_time">Part-Time</option>
                        <option value="contractual">Contractual</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Work Arrangement
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      >
                        <option value="remote">🌐 Remote</option>
                        <option value="hybrid">🏢 Hybrid</option>
                        <option value="onsite">📍 Onsite</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        value={formData.salaryRange}
                        onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                        placeholder="e.g., $120k - $140k/yr or ৳90k/mo"
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Source Channel
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="bdjobs">Bdjobs</option>
                        <option value="company_website">Company Website</option>
                        <option value="referral">Referral / Networking</option>
                        <option value="facebook">Facebook</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Job Posting URL
                    </label>
                    <input
                      type="url"
                      value={formData.jobUrl}
                      onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                      placeholder="https://linkedin.com/jobs/view/..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DATES & ALERTS */}
              {modalTab === "reminders" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Applied Date
                      </label>
                      <input
                        type="date"
                        value={formData.appliedDate}
                        onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                        <span>Follow-up Reminder Date</span>
                        <span className="text-[10px] text-indigo-600 font-normal">Auto: Applied + 7 days</span>
                      </label>
                      <input
                        type="date"
                        value={formData.followUpDate}
                        onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Interview Round Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={formData.interviewDate}
                        onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Notification Channel
                      </label>
                      <select
                        value={formData.notificationPref}
                        onChange={(e) => setFormData({ ...formData, notificationPref: e.target.value })}
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      >
                        <option value="in_app">In-App Navbar Alert</option>
                        <option value="email">Email Notification</option>
                        <option value="both">Both (In-App & Email)</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NETWORKING & CONTACT */}
              {modalTab === "networking" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Networking Contact Person
                      </label>
                      <input
                        type="text"
                        value={formData.networkingName}
                        onChange={(e) => setFormData({ ...formData, networkingName: e.target.value })}
                        placeholder="e.g., Sarah Jenkins (Recruiter / Hiring Manager)"
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Company / Recruiter Email
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="recruiter@company.com"
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Contact LinkedIn or Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.networkingUrl}
                      onChange={(e) => setFormData({ ...formData, networkingUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/recruiter-profile"
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Networking / Outreach Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.networkingNotes}
                      onChange={(e) => setFormData({ ...formData, networkingNotes: e.target.value })}
                      placeholder="e.g., Connected on LinkedIn, sent cold intro on Monday, promised referral..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: JOB CIRCULAR & AI BRIDGES */}
              {modalTab === "circular" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Full Job Description / Requirements</span>
                      <span className="text-[10px] text-indigo-600 font-normal">Used to power 1-click tailored AI Mock Interviews</span>
                    </label>
                    <textarea
                      rows={6}
                      value={formData.jobDescription}
                      onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                      placeholder="Paste the target job requirements, qualifications, and responsibilities here..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white leading-relaxed"
                    />
                  </div>

                  {formData.status === "rejected" && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                          Structured Rejection Category
                        </label>
                        <select
                          value={formData.rejectionCategory}
                          onChange={(e) => setFormData({ ...formData, rejectionCategory: e.target.value })}
                          className="w-full p-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none"
                        >
                          <option value="none">Select Reason...</option>
                          <option value="dsa_round">DSA / Problem Solving Round</option>
                          <option value="system_design">System Design & Architecture</option>
                          <option value="technical_depth">Technical Stack Depth</option>
                          <option value="experience_mismatch">Years of Experience Mismatch</option>
                          <option value="culture_fit">Behavioral / Culture Fit</option>
                          <option value="salary_mismatch">Salary / Compensation Expectation</option>
                          <option value="no_response_ghosted">No Response / Ghosted</option>
                          <option value="other">Other Reason</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                          Feedback & Notes
                        </label>
                        <input
                          type="text"
                          value={formData.rejectionDetails}
                          onChange={(e) => setFormData({ ...formData, rejectionDetails: e.target.value })}
                          placeholder="e.g., Struggled with dynamic programming and indexing question..."
                          className="w-full p-2.5 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      General Personal Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional comments..."
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:opacity-95 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? "Saving..." : modalMode === "create" ? "Add to Pipeline ➔" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT PREVIEW MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Bulk Import ({importPreviewData.length} Rows)</h3>
                <p className="text-xs text-slate-500">
                  Review the parsed job applications below. Duplicate company + role pairs will be merged automatically.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-60">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5 pl-4">Company</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Salary</th>
                    <th className="p-2.5">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importPreviewData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 pl-4 font-bold text-slate-900">{row.company}</td>
                      <td className="p-2.5 text-slate-700">{row.roleTitle}</td>
                      <td className="p-2.5 capitalize">{row.status}</td>
                      <td className="p-2.5">{row.salaryRange || "-"}</td>
                      <td className="p-2.5 capitalize">{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:opacity-95 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isImporting ? "Importing..." : `Import ${importPreviewData.length} Applications ➔`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-left">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-lg font-bold">
              🗑️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Delete Job Application?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-slate-700">{deleteModal.role}</span> at{" "}
                <span className="font-semibold text-slate-700">{deleteModal.company}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null, company: "", role: "" })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}
