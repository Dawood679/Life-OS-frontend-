import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
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

  useEffect(() => {
    fetch("http://localhost:5000/api/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user || data.profile || data) {
          const u = data.user || data.profile || data;
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
        }
      })
      .catch(() => navigate("/login"));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
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
        setError(data.message);
        return;
      }
      setSuccess("Profile updated successfully!");
      setUser({ ...user, ...formData });
      setIsEditing(false);
    } catch {
      setError("Unable to connect to server. Please try again.");
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
      setPasswordError("Passwords don't match");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/profile/password", {
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
        setPasswordError(data.message);
        return;
      }
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setPasswordError("Unable to connect to server. Please try again.");
    }
  };

  const inputClass = `w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const InfoRow = ({ label, value }) =>
    value ? (
      <div className="flex gap-2 text-sm">
        <span className="text-gray-500 w-36 shrink-0">{label}:</span>
        <span className="text-gray-800 font-medium">{value}</span>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            <Button
              onClick={() => {
                setIsEditing(!isEditing);
                setError("");
                setSuccess("");
              }}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

          {/* VIEW MODE */}
          {!isEditing && user && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Basic Info</h3>
                <div className="space-y-2">
                  <InfoRow label="Name" value={user.name} />
                  <InfoRow label="Phone" value={user.phone} />
                  <InfoRow label="Bio" value={user.bio} />
                  <InfoRow label="Date of Birth" value={user.dateOfBirth?.split("T")[0]} />
                  <InfoRow label="Gender" value={user.gender} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Education</h3>
                <div className="space-y-2">
                  <InfoRow label="Institution" value={user.institution} />
                  <InfoRow label="Degree" value={user.degree} />
                  <InfoRow label="Major" value={user.major} />
                  <InfoRow label="Student ID" value={user.studentId} />
                  <InfoRow label="Graduation Year" value={user.graduationYear} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Work</h3>
                <div className="space-y-2">
                  <InfoRow label="Job Title" value={user.jobTitle} />
                  <InfoRow label="Company" value={user.company} />
                  <InfoRow label="Experience" value={user.experience ? `${user.experience} years` : null} />
                  <InfoRow label="Skills" value={user.skills?.join(", ")} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Social</h3>
                {user.linkedin && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-gray-500 w-36 shrink-0">LinkedIn:</span>
                    <a href={user.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {user.linkedin}
                    </a>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Location</h3>
                <div className="space-y-2">
                  <InfoRow label="Country" value={user.country} />
                  <InfoRow label="City" value={user.city} />
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Basic Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Education</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Institution</label>
                    <input name="institution" value={formData.institution} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Degree</label>
                    <input name="degree" value={formData.degree} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Major</label>
                    <input name="major" value={formData.major} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student ID</label>
                    <input name="studentId" value={formData.studentId} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Graduation Year</label>
                    <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Work</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title</label>
                    <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <input name="company" value={formData.company} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience (years)</label>
                    <input type="number" name="experience" value={formData.experience} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                    <input name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Social</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn</label>
                  <input name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" className={inputClass} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">Location</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input name="country" value={formData.country} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>

              <Button type="submit" fullWidth>Save Changes</Button>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Change Password</h3>

          {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-600 text-sm mb-4">{passwordSuccess}</p>}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputClass} />
            </div>
            <Button type="submit" fullWidth>Change Password</Button>
          </form>
        </div>

      </div>
    </div>
  );
}