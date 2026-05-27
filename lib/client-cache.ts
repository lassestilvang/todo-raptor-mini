'use client';

import { useSyncExternalStore } from 'react';

type ResourceKey = 'lists' | 'labels' | 'stats';

type Snapshot = unknown;

const defaultSnapshots: Record<ResourceKey, unknown> = {
  lists: [],
  labels: [],
  stats: { overdueCount: 0 },
};

const cache = new Map<ResourceKey, Snapshot>();
const listeners = new Map<ResourceKey, Set<() => void>>();

function getListeners(key: ResourceKey) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  return set;
}

async function fetchResource(key: ResourceKey) {
  const res = await fetch(`/api/${key}`);
  const data = await res.json();
  const value = key === 'stats' ? data : Array.isArray(data[key]) ? data[key] : [];
  cache.set(key, value);
  getListeners(key).forEach((listener) => listener());
  return value;
}

export function invalidateResource(key: ResourceKey) {
  cache.delete(key);
  void fetchResource(key);
}

export function useCachedResource<T = unknown>(key: ResourceKey) {
  const subscribe = (callback: () => void) => {
    const set = getListeners(key);
    set.add(callback);
    return () => set.delete(callback);
  };

  const getSnapshot = () => {
    if (!cache.has(key)) {
      void fetchResource(key);
    }
    return (cache.get(key) ?? defaultSnapshots[key]) as T;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as T;
}
