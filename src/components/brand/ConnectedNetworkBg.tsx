'use client'

import React from 'react'

export default function ConnectedNetworkBg() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      
      {/* 1. Ambient Gradient Mesh Blobs */}
      <div 
        className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(104,37,199,0.22) 0%, rgba(18,175,165,0.12) 60%, transparent 80%)'
        }}
      />
      <div 
        className="absolute -bottom-48 -right-48 w-[750px] h-[750px] rounded-full blur-3xl pointer-events-none opacity-45"
        style={{
          background: 'radial-gradient(circle, rgba(18,175,165,0.18) 0%, rgba(100,136,255,0.16) 45%, rgba(104,37,199,0.1) 75%, transparent 90%)'
        }}
      />
      <div 
        className="absolute top-1/4 -right-32 w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(104,37,199,0.15) 0%, rgba(100,136,255,0.1) 70%, transparent 90%)'
        }}
      />
      <div 
        className="absolute -bottom-24 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(18,175,165,0.15) 0%, rgba(66,22,139,0.12) 70%, transparent 90%)'
        }}
      />

      {/* 2. Scalable High-Res Connected Business Network SVG (1920x1080) */}
      <svg 
        className="w-full h-full absolute inset-0 object-cover" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle Dot Grid Pattern */}
          <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#6825C7" fillOpacity="0.08" />
          </pattern>

          {/* Linear Gradients for Network Lines */}
          <linearGradient id="line-grad-purple-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6825C7" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#12AFA5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6488FF" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="line-grad-teal-purple" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#12AFA5" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6825C7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6488FF" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="glow-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#12AFA5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#12AFA5" stopOpacity="0.0" />
          </linearGradient>

          {/* Mask to keep Central 60% clean for login card focus */}
          <mask id="center-fade-mask">
            <rect width="1920" height="1080" fill="white" />
            <radialGradient id="center-hole" cx="50%" cy="50%" r="42%">
              <stop offset="0%" stopColor="black" />
              <stop offset="65%" stopColor="black" />
              <stop offset="90%" stopColor="#888888" />
              <stop offset="100%" stopColor="white" />
            </radialGradient>
            <rect width="1920" height="1080" fill="url(#center-hole)" />
          </mask>
        </defs>

        {/* --- Layer A: Subtle Dot Grid (Masked) --- */}
        <rect width="1920" height="1080" fill="url(#dot-grid)" mask="url(#center-fade-mask)" />

        {/* --- Layer B: TOP-LEFT BUSINESS NETWORK (Clients -> Compliance -> Renewals) --- */}
        <g opacity="0.85">
          {/* Main Top-Left Network Wave & Curved Lines */}
          <path 
            d="M -50 180 C 200 160, 320 280, 520 220 C 660 180, 760 310, 880 260" 
            stroke="url(#line-grad-purple-teal)" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
            fill="none" 
          />
          <path 
            d="M 120 -30 C 180 140, 290 220, 440 260 C 580 300, 680 440, 780 500" 
            stroke="#6825C7" 
            strokeOpacity="0.12" 
            strokeWidth="1.2" 
            fill="none" 
          />
          <path 
            d="M 60 420 C 220 380, 360 480, 520 390 C 620 330, 720 360, 840 280" 
            stroke="#12AFA5" 
            strokeOpacity="0.16" 
            strokeWidth="1.4" 
            fill="none" 
          />

          {/* Node 1: Clients (Top-Left: x=240, y=190) */}
          <g transform="translate(240, 190)">
            <circle r="22" fill="#6825C7" fillOpacity="0.04" stroke="#6825C7" strokeOpacity="0.2" strokeWidth="1" />
            <circle r="15" fill="#FFFFFF" stroke="#6825C7" strokeOpacity="0.3" strokeWidth="1.2" />
            {/* User / Client Icon Outline */}
            <circle cx="0" cy="-3" r="3" stroke="#6825C7" strokeOpacity="0.6" strokeWidth="1.2" fill="none" />
            <path d="M -6 7 C -6 3, 6 3, 6 7" stroke="#6825C7" strokeOpacity="0.6" strokeWidth="1.2" fill="none" />
            {/* Pulse Dot */}
            <circle cx="0" cy="0" r="2.5" fill="#6825C7" fillOpacity="0.7" />
            {/* Micro Tag */}
            <text x="28" y="4" fill="#6825C7" fillOpacity="0.45" fontSize="9" fontWeight="700" letterSpacing="0.08em" fontFamily="sans-serif">
              CLIENTS.CORE
            </text>
          </g>

          {/* Node 2: Compliance Shield (Top-Left: x=520, y=220) */}
          <g transform="translate(520, 220)">
            <circle r="26" fill="#12AFA5" fillOpacity="0.04" stroke="#12AFA5" strokeOpacity="0.25" strokeWidth="1" />
            <circle r="18" fill="#FFFFFF" stroke="#12AFA5" strokeOpacity="0.35" strokeWidth="1.2" />
            {/* Shield Icon Outline */}
            <path d="M -5 -4 L 0 -7 L 5 -4 C 5 2, 0 6, 0 6 C 0 6, -5 2, -5 -4 Z" stroke="#12AFA5" strokeOpacity="0.7" strokeWidth="1.2" fill="none" />
            <circle cx="0" cy="0" r="2.5" fill="#12AFA5" fillOpacity="0.8" />
            <text x="-4" y="32" fill="#12AFA5" fillOpacity="0.5" fontSize="9" fontWeight="700" letterSpacing="0.08em" fontFamily="sans-serif" textAnchor="middle">
              COMPLIANCE.RADAR
            </text>
          </g>

          {/* Node 3: Renewals Radar Loop (Left: x=140, y=380) */}
          <g transform="translate(140, 380)">
            <circle r="18" fill="#6488FF" fillOpacity="0.04" stroke="#6488FF" strokeOpacity="0.2" strokeWidth="1" />
            <circle r="12" fill="#FFFFFF" stroke="#6488FF" strokeOpacity="0.3" strokeWidth="1.2" />
            {/* Refresh Loop Outline */}
            <path d="M -3 -3 A 4 4 0 1 1 -3 3 M -3 -5 L -3 -2 L 0 -2" stroke="#6488FF" strokeOpacity="0.6" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <text x="22" y="3" fill="#6488FF" fillOpacity="0.45" fontSize="8.5" fontWeight="700" letterSpacing="0.08em" fontFamily="sans-serif">
              RENEWALS.SYNC
            </text>
          </g>

          {/* Connection Bridge (Node 1 -> Node 2) */}
          <line x1="262" y1="192" x2="494" y2="218" stroke="#6825C7" strokeOpacity="0.18" strokeWidth="1.2" />
          <circle cx="378" cy="205" r="2" fill="#12AFA5" fillOpacity="0.5" />
          
          {/* Subtle Abstract Ring */}
          <circle cx="100" cy="100" r="140" stroke="#6825C7" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="100" cy="100" r="200" stroke="#12AFA5" strokeOpacity="0.04" strokeWidth="1" />
        </g>

        {/* --- Layer C: BOTTOM-RIGHT BUSINESS NETWORK (Documents -> Operations -> Analytics) --- */}
        <g opacity="0.85">
          {/* Main Bottom-Right Network Wave & Curved Lines */}
          <path 
            d="M 1050 820 C 1180 760, 1280 880, 1480 800 C 1620 740, 1740 860, 1980 820" 
            stroke="url(#line-grad-teal-purple)" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
            fill="none" 
          />
          <path 
            d="M 1120 980 C 1240 860, 1380 920, 1540 840 C 1680 780, 1780 680, 1880 620" 
            stroke="#12AFA5" 
            strokeOpacity="0.14" 
            strokeWidth="1.2" 
            fill="none" 
          />
          <path 
            d="M 1340 1020 C 1460 900, 1580 940, 1720 860 C 1820 800, 1900 840, 1960 760" 
            stroke="#6825C7" 
            strokeOpacity="0.12" 
            strokeWidth="1.4" 
            fill="none" 
          />

          {/* Node 4: Documents (Bottom-Right: x=1420, y=820) */}
          <g transform="translate(1420, 820)">
            <circle r="24" fill="#12AFA5" fillOpacity="0.04" stroke="#12AFA5" strokeOpacity="0.25" strokeWidth="1" />
            <circle r="16" fill="#FFFFFF" stroke="#12AFA5" strokeOpacity="0.35" strokeWidth="1.2" />
            {/* Document Outline */}
            <path d="M -4 -6 L 2 -6 L 5 -3 L 5 6 L -4 6 Z M 2 -6 L 2 -3 L 5 -3" stroke="#12AFA5" strokeOpacity="0.7" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
            <circle cx="0" cy="0" r="2.5" fill="#12AFA5" fillOpacity="0.8" />
            <text x="26" y="4" fill="#12AFA5" fillOpacity="0.5" fontSize="9" fontWeight="700" letterSpacing="0.08em" fontFamily="sans-serif">
              DOCUMENTS.VAULT
            </text>
          </g>

          {/* Node 5: Analytics / Intelligence (Bottom-Right: x=1680, y=760) */}
          <g transform="translate(1680, 760)">
            <circle r="26" fill="#6825C7" fillOpacity="0.05" stroke="#6825C7" strokeOpacity="0.25" strokeWidth="1" />
            <circle r="18" fill="#FFFFFF" stroke="#6825C7" strokeOpacity="0.35" strokeWidth="1.2" />
            {/* Chart / Analytics Bars Outline */}
            <path d="M -5 5 L -5 0 M 0 5 L 0 -5 M 5 5 L 5 -2" stroke="#6825C7" strokeOpacity="0.7" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2.5" fill="#6825C7" fillOpacity="0.8" />
            <text x="0" y="32" fill="#6825C7" fillOpacity="0.5" fontSize="9" fontWeight="700" letterSpacing="0.08em" fontFamily="sans-serif" textAnchor="middle">
              ANALYTICS.INSIGHTS
            </text>
          </g>

          {/* Node 6: Operations Hub (Bottom-Right: x=1760, y=920) */}
          <g transform="translate(1760, 920)">
            <circle r="20" fill="#6488FF" fillOpacity="0.04" stroke="#6488FF" strokeOpacity="0.2" strokeWidth="1" />
            <circle r="14" fill="#FFFFFF" stroke="#6488FF" strokeOpacity="0.3" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="3" fill="#6488FF" fillOpacity="0.7" />
            <text x="-4" y="-22" fill="#6488FF" fillOpacity="0.45" fontSize="8.5" fontWeight="700" letterSpacing="0.08em" fontFamily="sans-serif" textAnchor="middle">
              OPERATIONS.HUB
            </text>
          </g>

          {/* Connection Bridge (Node 4 -> Node 5 -> Node 6) */}
          <line x1="1444" y1="814" x2="1654" y2="766" stroke="#12AFA5" strokeOpacity="0.2" strokeWidth="1.2" />
          <circle cx="1550" cy="790" r="2.5" fill="#6825C7" fillOpacity="0.5" />
          <line x1="1695" y1="784" x2="1748" y2="898" stroke="#6488FF" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="3 3" />

          {/* Subtle Abstract Ring Orbit */}
          <circle cx="1800" cy="980" r="220" stroke="#12AFA5" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="8 6" />
          <circle cx="1800" cy="980" r="320" stroke="#6825C7" strokeOpacity="0.04" strokeWidth="1" />
        </g>

        {/* --- Layer D: TOP-RIGHT & BOTTOM-LEFT Subtle Connectivity Arcs --- */}
        <g opacity="0.6">
          {/* Top-Right Arc */}
          <path 
            d="M 1520 -20 C 1620 120, 1720 180, 1940 220" 
            stroke="#6825C7" 
            strokeOpacity="0.12" 
            strokeWidth="1.2" 
            strokeDasharray="4 6"
            fill="none" 
          />
          <circle cx="1680" cy="150" r="3" fill="#6825C7" fillOpacity="0.3" />
          <circle cx="1780" cy="190" r="2" fill="#12AFA5" fillOpacity="0.4" />

          {/* Bottom-Left Arc */}
          <path 
            d="M -30 840 C 160 880, 280 960, 420 1100" 
            stroke="#12AFA5" 
            strokeOpacity="0.12" 
            strokeWidth="1.2" 
            strokeDasharray="4 6"
            fill="none" 
          />
          <circle cx="220" cy="910" r="3" fill="#12AFA5" fillOpacity="0.3" />
          <circle cx="340" cy="1020" r="2" fill="#6825C7" fillOpacity="0.4" />
        </g>
      </svg>

    </div>
  )
}
