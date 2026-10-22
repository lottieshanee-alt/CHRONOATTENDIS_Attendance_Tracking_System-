'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { AttendanceRecord } from '@/types/attendance';
import {
  X,
  Search,
  ArrowUpDown,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttendanceRecord[];
}

export function AttendanceRosterModal({
  isOpen,
  onClose,
  data,
}: AttendanceRosterModalProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  const columns = useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        accessorKey: 'studentNumber',
        header: 'Student ID',
        cell: (info) => (
          <span className="font-mono font-semibold text-slate-900">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'studentName',
        header: 'Cadet / Student Full Name',
        cell: (info) => (
          <div className="font-medium text-slate-900">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'yearSection',
        header: 'Section',
        cell: (info) => (
          <span className="font-semibold text-[#0E294B]">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department / College',
        cell: (info) => (
          <span className="text-slate-600 text-xs">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'timestamp',
        header: 'Check-in Time',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-600">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'scannerLocation',
        header: 'Gate / Station',
        cell: (info) => (
          <span className="text-xs text-slate-600">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Turnout Status',
        cell: (info) => {
          const status = info.getValue() as string;
          const isPresent = status === 'present';
          const isLate = status === 'late';
          return (
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                isPresent
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : isLate
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-red-100 text-red-900 border border-red-300'
              )}
            >
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleExportCSV = () => {
    const csvRows: string[] = [
      'Student ID,Full Name,Section,Department,Timestamp,Gate,Status',
      ...filteredData.map(
        (r) =>
          `"${r.studentNumber}","${r.studentName}","${r.yearSection}","${r.department}","${r.timestamp}","${r.scannerLocation}","${r.status}"`
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JBLCF_Attendance_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0A1C33] text-white p-4 flex items-center justify-between border-b border-[#143765] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0E294B] border border-[#C99313] flex items-center justify-center text-[#DEB033]">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Institutional Attendance Roster (TanStack Table v8)
              </h2>
              <p className="text-xs text-slate-300">
                Official check-in logs for John B. Lacson Colleges Foundation – Bacolod
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#143765] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search, Filters, CSV Export */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search across all columns..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0E294B] focus:border-[#0E294B]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              {(['all', 'present', 'late'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs capitalize font-medium transition-colors',
                    statusFilter === st
                      ? 'bg-[#0E294B] text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-md transition-colors shadow-xs"
          >
            <Download size={14} className="text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left text-xs border border-slate-200 rounded-md">
            <thead className="bg-[#F0F4F9] text-[#0A1C33] uppercase text-[11px] font-bold border-b border-slate-200 select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-200/60 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <ArrowUpDown size={12} className="text-slate-400" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-slate-400 text-xs"
                  >
                    No attendance records match the specified search or filter.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3.5 py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div>
            Showing{' '}
            <strong className="text-slate-900">
              {table.getRowModel().rows.length}
            </strong>{' '}
            of <strong className="text-slate-900">{filteredData.length}</strong>{' '}
            records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount() || 1}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
