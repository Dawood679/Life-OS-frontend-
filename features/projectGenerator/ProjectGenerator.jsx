import { useEffect, useState } from "react";
import Input from "../../src/components/ui/Input";
import FeatureLayout from "../../src/components/FeatureLayout";

export default function ProjectGenerator() {
  const [request, setRequest] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("features");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Initial load
  useEffect(() => {
    fetchProjects(1);
  }, []);

  // DIRECT FETCH WITH EXPLICIT PAGE PARAMETER
  const fetchProjects = async (targetPage = 1) => {
    try {
      setInitialFetching(true);
      const res = await fetch(
        `${BACKEND_URL}/project-generator?page=${targetPage}&limit=10`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok && data.projects) {
        setProjects(data.projects);
        
        // Ensure backend data maps cleanly to expected keys
        if (data.pagination) {
          const p = data.pagination;
          const totalPages = p.totalPages || Math.ceil((p.total || 0) / (p.limit || 10)) || 1;
          const currentPage = Number(p.page || targetPage);

          setPagination({
            total: p.total || data.projects.length,
            page: currentPage,
            limit: p.limit || 10,
            totalPages: totalPages,
            hasNextPage: p.hasNextPage ?? currentPage < totalPages,
            hasPrevPage: p.hasPrevPage ?? currentPage > 1,
          });
        }

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

  // HANDLER FOR NEXT / PREV BUTTONS
  const handlePageChange = (newPage) => {
    const target = Number(newPage);
    if (!isNaN(target) && target >= 1 && target <= pagination.totalPages) {
      setPage(target);
      fetchProjects(target);
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

      // Reset back to page 1 to display the newly generated project
      setPage(1);
      fetchProjects(1);
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
        fetchProjects(page);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete project.");
      }
    } catch {
      setError("Error attempting to delete project.");
    }
  };

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

  const renderForm = () => (
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
  );

  const renderHero = () => (
    selectedProject && (
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
    )
  );

  const renderSidebar = () => (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
        Saved Projects ({pagination.total || projects.length})
      </h3>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {projects.map((proj) => {
          const isSelected = selectedProject?._id === proj._id;

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
  );

  const tabs = [
    { key: "features", label: "Features" },
    { key: "folder", label: "Folder Structure" },
    { key: "schema", label: "Database Schema" },
  ];

  const renderTabContent = () => (
    selectedProject && (
      <>
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
      </>
    )
  );

  return (
    <FeatureLayout
      badgeText="LearningOS Hub"
      title="AI Project Idea Generator"
      subtitle="Powered by Gemini 2.5 Flash • Tech Stacks, Architecture & Schemas"
      onBack={() => window.history.back()}
      loading={loading}
      initialFetching={initialFetching}
      error={error}
      setError={setError}
      isCreatingNew={isCreatingNew}
      setIsCreatingNew={setIsCreatingNew}
      hasItems={projects.length > 0}
      pagination={pagination}
      onPageChange={handlePageChange}
      renderForm={renderForm}
      renderHero={renderHero}
      renderSidebar={renderSidebar}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      renderTabContent={renderTabContent}
    />
  );
}