'use client';

import React, { useState } from 'react';
import { HOURLY_ATTENDANCE_DATA } from '@/lib/mock-data';
import { TrendingUp, Info } from 'lucide-react';

export function AttendanceOverviewChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = HOURLY_ATTENDANCE_DATA;
  const maxVal = Math.max(...data.map((d) => Math.max(d.timeIn, d.expectedLoad, d.timeOut))) * 1.1;

  // Chart dimensions
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Points for time-in line
  const timeInPoints = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (d.timeIn / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const timeOutPoints = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (d.timeOut / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const timeInPath = timeInPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const timeOutPath = timeOutPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill area for Time-In using solid institutional tint (no gradient)
  const areaPath = `${timeInPath} L ${timeInPoints[timeInPoints.length - 1].x} ${svgHeight - paddingY} L ${timeInPoints[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A1C33]">
              Attendance Overview & Check-In Velocity
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E3ECF7] text-[#0E294B] border border-[#CBD5E1]">
              Hourly Trajectory
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time gate arrivals and departures across campus access turnstiles
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#0E294B]" />
            <span className="font-semibold text-slate-700">Time-In Checkins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#C99313]" />
            <span className="font-semibold text-slate-700">Time-Out Departures</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative my-3 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[540px]"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = svgHeight - paddingY - pct * chartHeight;
            const val = Math.round(pct * maxVal);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Solid institutional area under curve (strictly no multi-color gradient) */}
          <path d={areaPath} fill="#0E294B" fillOpacity="0.08" />

          {/* Time-out Line */}
          <path
            d={timeOutPath}
            fill="none"
            stroke="#C99313"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Time-In Line */}
          <path
            d={timeInPath}
            fill="none"
            stroke="#0E294B"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Points & Hover Target */}
          {timeInPoints.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Vertical Guide when hovered */}
              {hoveredIndex === idx && (
                <line
                  x1={p.x}
                  y1={paddingY}
                  x2={p.x}
                  y2={svgHeight - paddingY}
                  stroke="#0E294B"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* Time-In Point */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 6 : 4}
                fill="#ffffff"
                stroke="#0E294B"
                strokeWidth="2.5"
              />

              {/* Time-Out Point */}
              <circle
                cx={timeOutPoints[idx].x}
                cy={timeOutPoints[idx].y}
                r={hoveredIndex === idx ? 5 : 3.5}
                fill="#ffffff"
                stroke="#C99313"
                strokeWidth="2"
              />

              {/* Hour Label */}
              <text
                x={p.x}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="10"
                fill={hoveredIndex === idx ? '#0E294B' : '#64748B'}
                fontWeight={hoveredIndex === idx ? 'bold' : 'normal'}
                fontFamily="sans-serif"
              >
                {p.hour.replace(':00', '')}
              </text>
            </g>
          ))}
        </svg>

        {/* Interactive Floating Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none bg-[#0A1C33] text-white p-2.5 rounded-md shadow-lg border border-[#143765] text-xs z-10 font-sans"
            style={{
              left: `${(timeInPoints[hoveredIndex].x / svgWidth) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-[#DEB033] border-b border-[#163A63] pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>{data[hoveredIndex].hour}</span>
              <span className="text-[10px] text-slate-300 font-normal">
                Batch Log
              </span>
            </div>
            <div className="space-y-1 font-mono">
              <div className="flex justify-between gap-4 text-slate-200">
                <span>Time-In Swipes:</span>
                <span className="font-bold text-white">
                  {data[hoveredIndex].timeIn}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-amber-200">
                <span>Time-Out Swipes:</span>
                <span className="font-bold">{data[hoveredIndex].timeOut}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400 text-[10px] pt-1 border-t border-[#163A63]">
                <span>Expected Band:</span>
                <span>{data[hoveredIndex].expectedLoad}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Institutional Insights Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <TrendingUp size={14} className="text-[#0E294B]" />
          <span>Peak Arrival Window:</span>
          <span className="font-bold text-[#0E294B]">
            07:00 AM – 07:45 AM (1,420 swipes recorded)
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Mandatory Regimental Muster cutoff at 07:45 AM
        </div>
      </div>
    </div>
  );
}
