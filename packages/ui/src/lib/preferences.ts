import { localStorageAdapter } from '@supabase/auth-js/dist/module/lib/local-storage'

const LEVELS_KEY = 'logpanel.selectedLevels'

export async function saveSelectedLevels(levels: string[]) {
  try {
    await localStorageAdapter.setItem(LEVELS_KEY, JSON.stringify(levels))
  } catch (e) {
    console.error('Failed to save levels', e)
  }
}

export async function loadSelectedLevels(): Promise<string[] | null> {
  try {
    const value = await localStorageAdapter.getItem(LEVELS_KEY)
    if (!value) return null
    return JSON.parse(value)
  } catch (e) {
    console.error('Failed to load levels', e)
    return null
  }
}
