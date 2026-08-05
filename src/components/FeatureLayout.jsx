import React from "react";
import DeleteModal from "./DeleteModal";

export default function FeatureLayout({
  // Metadata
  badgeText = "LearningOS Hub",
  title,
  subtitle,

  // Navigation / Back option
  onBack,
  backTooltip = "Back to Dashboard",

  // Delete Action Props
  onDelete,
  isDeleting = false,
  showDeleteModal = false,
  setShowDeleteModal,

  // State flags
  loading = false,
  initialFetching = false,
  error,
  setError,
  isCreatingNew = false,
  setIsCreatingNew,
  hasItems = true,

  // Render Props / Slot Children
  renderForm,
  renderHero,
  renderSidebar,
  tabs = [],
  activeTab,
  setActiveTab,
  renderTabContent,
}) {
  // INITIAL FETCHING STATE
  if (initialFetching) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Loading {title || "content"}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-pink/30 p-4 md:p-8 font-sans text-slate-800 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-sky-50/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          
          <div className="flex items-start md:items-center gap-4">
            {/* BACK BUTTON */}
            {typeof onBack === "function" && (
              <button
                type="button"
                onClick={onBack}
                title={backTooltip}
                className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer shrink-0 mt-1 md:mt-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                <span className="text-base font-bold tracking-wider text-indigo-600">
                  {badgeText}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS (Delete & Create) */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* DELETE FEATURE BUTTON */}
            {hasItems && !isCreatingNew && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal?.(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="Delete Feature"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}

            {/* CREATE NEW BUTTON */}
            {!isCreatingNew && hasItems && setIsCreatingNew && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New
              </button>
            )}
          </div>
        </header>

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
            <span>{error}</span>
            {setError && (
              <button
                type="button"
                onClick={() => setError("")}
                className="font-bold text-red-800 cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* INPUT FORM (Empty state or Create New state) */}
        {(!hasItems || isCreatingNew) && !loading && (
          typeof renderForm === "function" ? renderForm() : renderForm
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-slate-200 text-center space-y-6 shadow-xl">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Processing Request...</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                LifeOS AI is generating your requested blueprint...
              </p>
            </div>
          </div>
        )}

        {/* MAIN DISPLAY GRID */}
        {hasItems && !loading && !isCreatingNew && (
          <div className="space-y-6">
            
            {/* HERO BANNER */}
            {renderHero && (
              typeof renderHero === "function" ? renderHero() : renderHero
            )}

            {/* 2-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT SIDEBAR */}
              {renderSidebar && (
                <div className="lg:col-span-4 space-y-3">
                  {typeof renderSidebar === "function" ? renderSidebar() : renderSidebar}
                </div>
              )}

              {/* RIGHT CONTENT WITH TABS */}
              <div
                className={`${
                  renderSidebar ? "lg:col-span-8" : "lg:col-span-12"
                } bg-sky-50/10 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6`}
              >
                {/* TAB HEADERS */}
                {tabs.length > 0 && (
                  <div className="flex border-b border-slate-200/80 gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab?.(tab.key)}
                        className={`pb-3 px-4 text-base font-bold transition border-b-2 cursor-pointer whitespace-nowrap ${
                          activeTab === tab.key
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* TAB CONTENT */}
                {renderTabContent && (
                  typeof renderTabContent === "function" ? renderTabContent() : renderTabContent
                )}

              </div>
            </div>
          </div>
        )}

      </div>

      {/* SEPARATE REUSABLE DELETE MODAL */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal?.(false)}
        onDelete={onDelete}
        isDeleting={isDeleting}
        title={`Delete "${title || "Feature"}"?`}
        description="This action cannot be undone. This will permanently delete this feature from your account."
        confirmText="Delete Now"
      />
    </div>
  );
}