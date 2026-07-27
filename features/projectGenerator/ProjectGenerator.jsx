import { useEffect, useState } from "react";
import Input from "../../src/components/ui/Input";


export default function ProjectGenerator() {
  const [request, setRequest] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("features");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Fetch user projects list on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/project-generator`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.projects) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0]);
        }
      }
    } catch {
      setError("Unable to connect to server to load existing projects.");
    } finally {
      setInitialFetching(false);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!request.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/project-generator/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ request }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate project.");
        return;
      }

      setProjects((prev) => [data.project, ...prev]);
      setSelectedProject(data.project);
      setIsCreatingNew(false);
      setRequest("");
      setActiveTab("features");
    } catch {
      setError("Unable to connect to AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/project-generator/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = projects.filter((p) => p._id !== id);
        setProjects(updated);
        if (selectedProject?._id === id) {
          setSelectedProject(updated[0] || null);
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete project.");
      }
    } catch {
      setError("Error attempting to delete project.");
    }
  };

  // Helper for rendering difficulty badges
  const getDifficultyBadge = (level) => {
    const l = level?.toLowerCase() || "";
    if (l.includes("beginner")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }
    if (l.includes("intermediate")) {
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
    if (l.includes("advanced") || l.includes("expert")) {
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    }
    return "bg-orange-50 text-orange-700 border-orange-200/80";
  };

  if (initialFetching) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Loading Project Generator Hub...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-pink/30 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-sky-50/30 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                LearningOS Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              AI Project Idea Generator
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Powered by Gemini 2.5 Flash • Tech Stacks, Architecture & Schemas
            </p>
          </div>

          {!isCreatingNew && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Project Idea
            </button>
          )}
        </header>

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold text-red-800 cursor-pointer">
              ×
            </button>
          </div>
        )}

        {/* CONDITION 1: INPUT FORM (No existing projects OR creating new) */}
        {(projects.length === 0 || isCreatingNew) && (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all">
            <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-xl mx-auto text-center space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-xl shadow-md">
                ⚡
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
                What project do you want to build?
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe your requested stack or skill level. LifeOS AI will produce features, directory structure, and database schemas.
              </p>

              <form onSubmit={handleGenerate} className="mt-6 space-y-4">
                <Input
                  type="text"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="e.g. Suggest a Node.js intermediate project, React e-commerce app..."
                  disabled={loading}
                />

                <div className="flex gap-2 justify-end">
                  {projects.length > 0 && isCreatingNew && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !request.trim()}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        Generating Project...
                      </>
                    ) : (
                      <>
                        <span>Generate Architecture</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONDITION 2: LOADING SKELETON */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-slate-200 text-center space-y-6 shadow-xl">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Architecting Project Blueprint
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Creating feature sets, conventions-driven folder layouts, and database schemas...
              </p>
            </div>
          </div>
        )}

        {/* CONDITION 3: MAIN DISPLAY GRID */}
        {selectedProject && !loading && !isCreatingNew && (
          <div className="space-y-6">

            {/* HERO HEADER BANNER */}
            <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase">
                      Selected Project
                    </span>
                    {selectedProject.difficultyLevel && (
                      <span className={`px-3 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getDifficultyBadge(selectedProject.difficultyLevel)} bg-white/90`}>
                        {selectedProject.difficultyLevel}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-serif font-bold">
                    {selectedProject.projectTitle || "Project Idea"}
                  </h2>

                  <p className="text-xs text-indigo-100 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* TECH STACK BADGES */}
                {selectedProject.techStack && (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl max-w-xs self-start md:self-auto space-y-2">
                    <p className="text-[10px] text-sky-200 uppercase font-bold tracking-wider">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(selectedProject.techStack)
                        ? selectedProject.techStack
                        : [selectedProject.techStack]
                      ).map((tech, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-1 bg-white/20 text-white rounded-lg text-[11px] font-medium border border-white/10">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TWO-COLUMN GRID: SIDEBAR & MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT SIDEBAR: SAVED PROJECTS LIST */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                  Saved Projects ({projects.length})
                </h3>

                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {projects.map((proj) => {
                    const isSelected = selectedProject._id === proj._id;

                    return (
                      <div
                        key={proj._id}
                        onClick={() => {
                          setSelectedProject(proj);
                          setIsCreatingNew(false);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? "bg-orange-50/70 border-orange-200/80 shadow-xs ring-2 ring-orange-200/50"
                            : "bg-white/60 border-slate-200/80 hover:bg-orange-50/30 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-2 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-orange-500 text-white shadow-xs"
                                : "bg-orange-100/70 text-orange-800"
                            }`}
                          >
                            💻
                          </span>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {proj.projectTitle || proj.request}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {proj.request}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleDelete(proj._id, e)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 transition cursor-pointer"
                          title="Delete Project"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT DISPLAY: PROJECT DETAILS WITH TABS */}
              <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">

                {/* TABS HEADER */}
                <div className="flex border-b border-slate-200/80 gap-2">
                  <button
                    onClick={() => setActiveTab("features")}
                    className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                      activeTab === "features"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Features
                  </button>
                  <button
                    onClick={() => setActiveTab("folder")}
                    className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                      activeTab === "folder"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Folder Structure
                  </button>
                  <button
                    onClick={() => setActiveTab("schema")}
                    className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                      activeTab === "schema"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Database Schema
                  </button>
                </div>

                {/* TAB 1: FEATURES */}
                {activeTab === "features" && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Core to Nice-to-Have Features
                    </h4>

                    {Array.isArray(selectedProject.features) && selectedProject.features.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedProject.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-orange-50/30 border border-slate-200/70 flex items-start gap-3"
                          >
                            <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {typeof feat === "string" ? feat : JSON.stringify(feat)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No explicit features listed.</p>
                    )}
                  </div>
                )}

                {/* TAB 2: FOLDER STRUCTURE */}
                {activeTab === "folder" && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Recommended Folder Layout
                    </h4>
                    
                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                      <pre>
                        {typeof selectedProject.folderStructure === "string"
                          ? selectedProject.folderStructure
                          : JSON.stringify(selectedProject.folderStructure, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* TAB 3: DATABASE SCHEMA */}
                {activeTab === "schema" && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Models & Schema Architecture
                    </h4>

                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                      <pre>
                        {typeof selectedProject.databaseSchema === "string"
                          ? selectedProject.databaseSchema
                          : JSON.stringify(selectedProject.databaseSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}