'use client';

import React from 'react';
import { cn } from '@/lib/cn';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  emptyMessage = 'No data found',
  className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-surface-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-surface-500',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-surface-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={String(item[keyField] ?? index)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-surface-100 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-50',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render
                      ? col.render(item, index)
                      : (item[col.key] as React.ReactNode) ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
