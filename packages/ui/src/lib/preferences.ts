import {
  localStorageAdapter,
} from '@supabase/auth-js/dist/main/lib/local-storage'
import {
  setItemAsync,
  getItemAsync,
} from '@supabase/auth-js/dist/main/lib/helpers'

const LEVELS_KEY = 'logpanel.selectedLevels'

export async function saveSelectedLevels(levels: string[]) {
  console.log('[preferences] saveSelectedLevels', levels)
  try {
    await setItemAsync(localStorageAdapter, LEVELS_KEY, levels)
  } catch (e) {
    console.error('Failed to save levels', e)
  }
}

export async function loadSelectedLevels(): Promise<string[] | null> {
  console.log('[preferences] loadSelectedLevels')
  try {
    const result = (await getItemAsync(
      localStorageAdapter,
      LEVELS_KEY,
    )) as string[] | null
    console.log('[preferences] loaded', result)
    return result
  } catch (e) {
    console.error('Failed to load levels', e)
    return null
  }
}
