import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  // Mode & Tab States
  const [activeTab, setActiveTab] = useState("info"); // "info" | "resume" | "security"
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Alert States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Data States
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    dateOfBirth: "",
    gender: "",
    institution: "",
    degree: "",
    major: "",
    studentId: "",
    graduationYear: "",
    jobTitle: "",
    company: "",
    experience: "",
    skills: "",
    linkedin: "",
    country: "",
    city: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeMeta, setResumeMeta] = useState(null); // { fileName, uploadedAt, size }
  const [resumeUploading, setResumeUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Load User Data
  useEffect(() => {
    fetch(`${BACKEND_URL}/profile`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const u = data.user || data.profile || data;
        if (u) {
          setUser(u);
          setFormData({
            name: u.name || "",
            phone: u.phone || "",
            bio: u.bio || "",
            dateOfBirth: u.dateOfBirth?.split("T")[0] || "",
            gender: u.gender || "",
            institution: u.institution || "",
            degree: u.degree || "",
            major: u.major || "",
            studentId: u.studentId || "",
            graduationYear: u.graduationYear || "",
            jobTitle: u.jobTitle || "",
            company: u.company || "",
            experience: u.experience || "",
            skills: u.skills?.join(", ") || "",
            linkedin: u.linkedin || "",
            country: u.country || "",
            city: u.city || "",
          });
          if (u.resume) {
            setResumeMeta(u.resume); // { fileName, url, uploadedAt, size }
          }
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setInitialLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch(`${BACKEND_URL}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          graduationYear: formData.graduationYear
            ? Number(formData.graduationYear)
            : undefined,
          experience: formData.experience
            ? Number(formData.experience)
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to update profile.");
        return;
      }
      setSuccess("Profile details saved successfully!");
      setUser((prev) => ({
        ...prev,
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }));
      setIsEditing(false);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (!/\d/.test(passwordData.newPassword)) {
      setPasswordError("Password must contain at least one number");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/profile/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.message || "Failed to change password.");
        return;
      }

      setPasswordSuccess("Password security key updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setPasswordError("Unable to connect to server. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Resume Upload Handler
  const handleResumeSelect = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.type.includes("word")) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should not exceed 5MB.");
      return;
    }
    setResumeFile(file);
    setError("");
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setResumeUploading(true);
    setError("");
    setSuccess("");

    const uploadData = new FormData();
    uploadData.append("resume", resumeFile);

    try {
      const res = await fetch(`${BACKEND_URL}/profile/resume`, {
        method: "POST",
        credentials: "include",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to upload resume document.");
        return;
      }

      setSuccess("Resume uploaded successfully!");
      setResumeMeta(data.resume || {
        fileName: resumeFile.name,
        uploadedAt: new Date().toISOString(),
        size: (resumeFile.size / (1024 * 1024)).toFixed(2) + " MB",
      });
      setResumeFile(null);
    } catch {
      setError("Unable to upload resume. Please try again.");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to remove your resume?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/profile/resume`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setResumeMeta(null);
        setSuccess("Resume deleted successfully.");
      } else {
        setError("Failed to delete resume document.");
      }
    } catch {
      setError("Server error when deleting resume.");
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Loading user profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-pink/30 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* PROFILE HEADER & COVER BANNER */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Top Decorative Gradient */}
          <div className="h-36 md:h-44 bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-2 left-6 text-white/20 font-serif text-6xl font-bold select-none">
              ProfileOS
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-6 md:px-8 pb-6 relative pt-0 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-14 md:-mt-16">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-amber-400 p-1 shadow-xl shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white font-serif text-3xl md:text-4xl font-bold uppercase">
                  {user?.name ? user.name.slice(0, 2) : "US"}
                </div>
              </div>

              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                    {user?.name || "Member Profile"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-200/60">
                    Verified Candidate
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {user?.jobTitle ? `${user.jobTitle} ${user.company ? `@ ${user.company}` : ""}` : "Candidate Profile"}
                  {user?.city ? ` • ${user.city}, ${user.country}` : ""}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end pt-2 md:pt-0">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setError("");
                  setSuccess("");
                  if (activeTab !== "info") setActiveTab("info");
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white text-xs font-semibold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 210.382 0 0113 0z" />
                </svg>
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="px-6 md:px-8 border-t border-slate-100 flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3.5 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "info"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              👤 Profile Overview
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`py-3.5 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "resume"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              📄 Resume & CV
              {resumeMeta && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-3.5 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "security"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              🔒 Security & Password
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        {(error || success) && (
          <div
            className={`px-4 py-3 rounded-2xl text-xs flex items-center justify-between border transition-all ${
              error
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            <span className="font-medium">{error || success}</span>
            <button
              onClick={() => {
                setError("");
                setSuccess("");
              }}
              className="font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* TAB 1: PROFILE INFO & EDITING */}
        {activeTab === "info" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
            {!isEditing ? (
              /* VIEW MODE */
              <div className="space-y-8">
                {/* Bio Summary Card */}
                {user?.bio && (
                  <div className="p-5 rounded-2xl bg-orange-50/30 border border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      About Candidate
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}

                {/* Grid Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <span>📌</span> Personal Information
                    </h3>
                    <div className="space-y-2.5">
                      <DisplayRow label="Full Name" value={user?.name} />
                      <DisplayRow label="Phone Number" value={user?.phone} />
                      <DisplayRow label="Date of Birth" value={user?.dateOfBirth?.split("T")[0]} />
                      <DisplayRow label="Gender" value={user?.gender} />
                      <DisplayRow label="Location" value={user?.city && user?.country ? `${user.city}, ${user.country}` : user?.country || user?.city} />
                    </div>
                  </div>

                  {/* Career & Experience */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <span>💼</span> Work & Career
                    </h3>
                    <div className="space-y-2.5">
                      <DisplayRow label="Job Title" value={user?.jobTitle} />
                      <DisplayRow label="Company" value={user?.company} />
                      <DisplayRow label="Total Experience" value={user?.experience ? `${user.experience} Years` : null} />
                      <DisplayRow label="LinkedIn Profile" value={user?.linkedin} isLink={true} />
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <span>🎓</span> Education & Academic
                    </h3>
                    <div className="space-y-2.5">
                      <DisplayRow label="Institution" value={user?.institution} />
                      <DisplayRow label="Degree" value={user?.degree} />
                      <DisplayRow label="Major / Field" value={user?.major} />
                      <DisplayRow label="Student ID" value={user?.studentId} />
                      <DisplayRow label="Graduation Year" value={user?.graduationYear} />
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                      <span>⚡</span> Verified Skills
                    </h3>
                    {Array.isArray(user?.skills) && user.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {user.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No skills added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE FORM */
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                {/* Personal Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Full Name">
                      <input name="name" value={formData.name} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Phone Number">
                      <input name="phone" value={formData.phone} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Date of Birth">
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Gender">
                      <select name="gender" value={formData.gender} onChange={handleChange} className={formInputClass}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer not to say">Prefer not to say</option>
                      </select>
                    </FormField>
                  </div>
                  <FormField label="Bio / Executive Summary">
                    <textarea name="bio" rows={3} value={formData.bio} onChange={handleChange} className={formInputClass} placeholder="Briefly introduce yourself, career objectives, or key highlights..." />
                  </FormField>
                </div>

                {/* Work & Career Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Work & Professional Experience
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Current Job Title">
                      <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Company Name">
                      <input name="company" value={formData.company} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Years of Experience">
                      <input type="number" name="experience" value={formData.experience} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Skills (Comma separated)">
                      <input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python, Figma" className={formInputClass} />
                    </FormField>
                  </div>
                  <FormField label="LinkedIn Profile URL">
                    <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" className={formInputClass} />
                  </FormField>
                </div>

                {/* Academic Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Academic Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Institution / University">
                      <input name="institution" value={formData.institution} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Degree">
                      <input name="degree" value={formData.degree} onChange={handleChange} placeholder="B.Sc, M.Sc, B.A." className={formInputClass} />
                    </FormField>
                    <FormField label="Major / Concentration">
                      <input name="major" value={formData.major} onChange={handleChange} placeholder="Computer Science" className={formInputClass} />
                    </FormField>
                    <FormField label="Student ID">
                      <input name="studentId" value={formData.studentId} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="Graduation Year">
                      <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className={formInputClass} />
                    </FormField>
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Country">
                      <input name="country" value={formData.country} onChange={handleChange} className={formInputClass} />
                    </FormField>
                    <FormField label="City">
                      <input name="city" value={formData.city} onChange={handleChange} className={formInputClass} />
                    </FormField>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: RESUME & DOCUMENT UPLOADER */}
        {activeTab === "resume" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Resume & CV Document Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your latest resume to auto-fill AI job match applications and skill gap assessments.
              </p>
            </div>

            {/* Existing Uploaded Resume Card */}
            {resumeMeta ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xl shrink-0">
                    📄
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {resumeMeta.fileName || "Uploaded_Resume.pdf"}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {resumeMeta.size ? `${resumeMeta.size} • ` : ""}
                      Uploaded on {new Date(resumeMeta.uploadedAt || Date.now()).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {resumeMeta.url && (
                    <a
                      href={resumeMeta.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                    >
                      Download PDF
                    </a>
                  )}
                  <button
                    onClick={handleDeleteResume}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              </div>
            ) : null}

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleResumeSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-slate-200 bg-slate-50/30 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleResumeSelect(e.target.files?.[0])}
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold shadow-xs">
                📤
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to upload or drag & drop resume
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, DOCX (Max limit: 5MB)
                </p>
              </div>
            </div>

            {/* Selected File Stage Ready for Upload */}
            {resumeFile && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📎</span>
                  <div>
                    <p className="text-xs font-bold text-indigo-900">{resumeFile.name}</p>
                    <p className="text-[10px] text-indigo-600">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setResumeFile(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResumeUpload}
                    disabled={resumeUploading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {resumeUploading ? "Uploading..." : "Confirm Upload"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD CHANGE */}
        {activeTab === "security" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Update Account Security
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure your account is protected by setting a strong, multi-character password.
              </p>
            </div>

            {(passwordError || passwordSuccess) && (
              <div
                className={`p-3.5 rounded-2xl text-xs ${
                  passwordError
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {passwordError || passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <FormField label="Current Password">
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className={formInputClass}
                />
              </FormField>

              <FormField label="New Password">
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="At least 8 characters with 1 number"
                  className={formInputClass}
                />
              </FormField>

              <FormField label="Confirm New Password">
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className={formInputClass}
                />
              </FormField>

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 cursor-pointer mt-2"
              >
                {passwordSaving ? "Updating Password..." : "Change Password"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

// UI HELPERS & COMPONENTS

const formInputClass = `w-full p-3 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition text-slate-800`;

function FormField({ label, children }) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-0.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function DisplayRow({ label, value, isLink = false }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center text-xs gap-1 sm:gap-4">
      <span className="text-slate-400 w-32 shrink-0 font-medium">{label}:</span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 hover:underline font-semibold truncate"
        >
          {value}
        </a>
      ) : (
        <span className="text-slate-800 font-semibold">{value}</span>
      )}
    </div>
  );
}