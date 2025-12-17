'use client'
import React from 'react'

export default function DatePicker({ value, onChange }: { value?: string | null; onChange?: (v: string | null) => void }) {
  return (
    <input
      type="datetime-local"
      className="px-2 py-1 rounded bg-slate-800"
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value ?? null)}
    />
  )
}
