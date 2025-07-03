import { saveSelectedLevels, loadSelectedLevels } from '../ui/src/lib/preferences';

// simple in-memory localStorage polyfill for tests
function setupLocalStorage(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial }
  globalThis.window = {} as any
  globalThis.document = {} as any
  globalThis.localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  } as any
  return store
}

describe('preferences persistence', () => {
  beforeEach(() => {
    setupLocalStorage()
  })

  test('saveSelectedLevels and loadSelectedLevels round trip', async () => {
    await saveSelectedLevels(['INFO', 'ERROR'])
    const result = await loadSelectedLevels()
    expect(result).toEqual(['INFO', 'ERROR'])
  })

  test('loadSelectedLevels returns null when nothing stored', async () => {
    const result = await loadSelectedLevels()
    expect(result).toBeNull()
  })
})


