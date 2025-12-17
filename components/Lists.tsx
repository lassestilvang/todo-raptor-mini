"use client"

import React, { useEffect, useState } from 'react'

export default function Lists() {
  const [lists, setLists] = useState<any[]>([])

  async function fetchLists() {
    const res = await fetch('/api/lists')
    const data = await res.json()
    setLists(data.lists || [])
  }

  useEffect(() => { fetchLists() }, [])

  return (
    <>
      {lists.map(l => (
        <li key={l.id} className="mt-2"><a href={`/app/lists/${l.id}`} className="text-sm">{l.emoji ? `${l.emoji} ` : ''}{l.title}</a></li>
      ))}
    </>
  )
}
