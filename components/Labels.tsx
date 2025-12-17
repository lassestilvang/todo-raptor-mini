"use client"

import React, { useEffect, useState } from 'react'

export default function Labels() {
  const [labels, setLabels] = useState<any[]>([])

  async function fetchLabels() {
    const res = await fetch('/api/labels')
    const data = await res.json()
    setLabels(data.labels || [])
  }

  useEffect(() => { fetchLabels() }, [])

  return (
    <div className="flex flex-col gap-2">
      {labels.map(l => (
        <div key={l.id} className="text-sm">
          {l.icon ? `${l.icon} ` : ''}{l.name}
        </div>
      ))}
    </div>
  )
}
