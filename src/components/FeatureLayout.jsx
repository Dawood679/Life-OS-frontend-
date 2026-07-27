

export default function FeatureLayout({
  // Metadata
  badgeText = "LearningOS Hub",
  title,
  subtitle,

  // State flags
  loading,
  initialFetching,
  error,
  setError,
  isCreatingNew,
  setIsCreatingNew,
  hasItems,

  // Render Props / Children
  renderForm,
  renderHero,
  renderSidebar,
  tabs = [], // [{ key: 'overview', label: 'Overview' }]
  activeTab,
  setActiveTab,
  renderTabContent,
}) {
  if (initialFetching) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Loading {title}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-surface-pink/30 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-sky-50/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs">
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
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          </div>

          {!isCreatingNew && hasItems && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New
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

        {/* INPUT FORM (Empty state or Create New) */}
        {(!hasItems || isCreatingNew) && !loading && (
          typeof renderForm === "function" ? renderForm() : renderForm
        )}

        {/* LOADING SKELETON */}
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
            {typeof renderHero === "function" ? renderHero() : renderHero}

            {/* 2-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT SIDEBAR */}
              <div className="lg:col-span-4 space-y-3">
                {typeof renderSidebar === "function" ? renderSidebar() : renderSidebar}
              </div>

              {/* RIGHT CONTENT WITH TABS */}
              <div className="lg:col-span-8 bg-sky-50/10 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
                
                {/* TAB HEADERS */}
                {tabs.length > 0 && (
                  <div className="flex border-b border-slate-200/80 gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-3 px-4 text-base font-bold transition border-b-2 cursor-pointer ${
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
                {typeof renderTabContent === "function" ? renderTabContent() : renderTabContent}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}