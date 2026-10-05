import { useEffect, useState } from 'react'
import { storage } from '../lib/storage'

/** useState que se sincroniza con localStorage bajo la clave indicada. */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() =>
    storage.get<T>(key, typeof initial === 'function' ? (initial as () => T)() : initial),
  )
  useEffect(() => {
    storage.set(key, value)
  }, [key, value])
  return [value, setValue] as const
}
