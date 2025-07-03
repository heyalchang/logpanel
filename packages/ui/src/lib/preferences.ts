import {
  localStorageAdapter,
} from '@supabase/auth-js/dist/module/lib/local-storage'
import {
  setItemAsync,
  getItemAsync,
} from '@supabase/auth-js/dist/module/lib/helpers'

const LEVELS_KEY = 'logpanel.selectedLevels'

export async function saveSelectedLevels(levels: string[]) {
  try {
    await setItemAsync(localStorageAdapter, LEVELS_KEY, levels)
  } catch (e) {
    console.error('Failed to save levels', e)
  }
}

export async function loadSelectedLevels(): Promise<string[] | null> {
  try {
    return await getItemAsync(localStorageAdapter, LEVELS_KEY)
  } catch (e) {
    console.error('Failed to load levels', e)
    return null
  }
}
