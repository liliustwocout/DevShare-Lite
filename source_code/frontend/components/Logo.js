export default function Logo({ size = "md" }) {
  const isLarge = size === "lg";

  return (
    <div className="flex items-center gap-2.5 select-none group cursor-pointer">
      <div className={`relative ${isLarge ? "w-11 h-11" : "w-9 h-9"} flex items-center justify-center`}>
        {/* Ambient glow behind icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-[6px] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Core emblem */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
          <svg
            className={`${isLarge ? "w-6 h-6" : "w-5 h-5"} text-indigo-400 group-hover:text-indigo-300 transition-colors`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m16 18 6-6-6-6" />
            <path d="m8 6-6 6 6 6" />
            <line x1="14" y1="4" x2="10" y2="20" stroke="url(#logo-grad)" />
            <defs>
              <linearGradient id="logo-grad" x1="10" y1="20" x2="14" y2="4" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`${isLarge ? "text-2xl" : "text-xl"} font-extrabold tracking-tight text-white`}>
          Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Share</span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Lite
        </span>
      </div>
    </div>
  );
}