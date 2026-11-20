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
  Search,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { toCsv, ATTENDANCE_RECORD_CSV_COLUMNS, downloadCsvFile } from '@/lib/csv';
import { toManilaISO } from '@/lib/time';
import { Modal } from '@/components/ui/modal';

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
            {formatTime(info.getValue() as string)}
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
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
                status === 'present'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : status === 'late'
    ? 'bg-amber-100 text-amber-900 border border-amber-300'
    : 'bg-red-100 text-red-900 border border-red-300'
              )
}
            >
  { status }
            </span >
          );
        },
      },
    ],
[]
  );

// eslint-disable-next-line react-hooks/incompatible-library
const table = useReactTable({
  data: filteredData,
  columns,
  state: {
    globalFilter,
    sorting,
  },
  onGlobalFilterChange: setGlobalFilter,
  onSortingChange: setSorting,
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
  const csvContent = toCsv(ATTENDANCE_RECORD_CSV_COLUMNS, data);
  const dateStamp = toManilaISO(new Date()).slice(0, 10);
  const fileName = `JBLCF_Attendance_Roster_${dateStamp}.csv`;
  downloadCsvFile(fileName, csvContent);
};

return (
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Official Attendance Roster & Audit Ledger"
            maxWidth="4xl"
          >
            <div className="space-y-4">
              {/* Subtitle / Filter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-[#0E294B]" />
                  <span className="text-xs font-semibold text-slate-700">
                    Filtering: {filteredData.length} records in active log
                  </span>
                </div>

                      <div className="flex items-center gap-2">
                        {/* Status Filter Tabs */}
                        <div className="flex rounded-md bg-white border border-slate-200 p-0.5">
                          {(['all', 'present', 'late', 'absent'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setStatusFilter(mode)}
                              className={cn(
                    'px-2.5 py-1 text-xs rounded font-medium transition-colors capitalize',
                                statusFilter === mode
                                  ? 'bg-[#0E294B] text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              )}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>

                        {/* Export CSV Button */}
                        <button
                          type="button"
                          onClick={handleExportCSV}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0E294B] hover:bg-[#143765] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                          title="Download verified CSV roster with formula protection & UTF-8 BOM"
                        >
                          <Download size={13} className="text-[#DEB033]" />
                          <span>Export CSV</span>
                        </button>
                      </div>
        </div>

                  {/* Search Input Bar */}
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={globalFilter ?? ''}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      placeholder="Search across all columns (name, ID, section, gate)..."
                      aria-label="Filter roster records"
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E294B]"
                    />
                  </div>

                        {/* Responsive Table Container */}
                        <div className="border border-slate-200 rounded-md overflow-x-auto max-h-[400px]">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-[#0A1C33] text-white font-semibold uppercase tracking-wider text-[11px] sticky top-0 z-10">
                              {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                  {headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      className="px-3.5 py-2.5 font-bold cursor-pointer select-none whitespace-nowrap hover:bg-[#143765] transition-colors"
                                      onClick={header.column.getToggleSortingHandler()}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                        <ArrowUpDown size={11} className="text-slate-400" />
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              ))}
                            </thead>
                              <tbody className="divide-y divide-slate-200 font-mono text-slate-700 bg-white">
                                {table.getRowModel().rows.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={columns.length}
                                      className="p-8 text-center text-slate-400 font-sans text-xs"
                                    >
                                      No attendance records found matching current criteria.
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
                          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 rounded-md">
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
                                aria-label="Previous page"
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
                                aria-label="Next page"
                                className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                    </Modal>
                    );
}
