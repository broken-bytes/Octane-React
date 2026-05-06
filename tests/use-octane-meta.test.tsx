import { act, renderHook } from '@testing-library/react'
import { useOctaneMeta } from '../src/hooks/use-octane-meta'
import { __resetForTests } from '../src/internal/client'
import { getInstances, resetInstances, type OctaneMeta } from './fake-core'

function fakeMeta(blueWins: number, orangeWins: number): OctaneMeta {
  return {
    bestOf: 5,
    blue: { name: 'Blue', logo: '', wins: blueWins },
    orange: { name: 'Orange', logo: '', wins: orangeWins },
  }
}

describe('useOctaneMeta', () => {
  beforeEach(() => {
    __resetForTests()
    resetInstances()
  })

  test('returns null before any meta event arrives', () => {
    const { result } = renderHook(() => useOctaneMeta())
    expect(result.current).toBeNull()
  })

  test('connects to the core on first hook use', () => {
    renderHook(() => useOctaneMeta())
    expect(getInstances()).toHaveLength(1)
    expect(getInstances()[0].connectCalls).toBe(1)
  })

  test('returns the latest OctaneMeta after onMeta fires', () => {
    const { result } = renderHook(() => useOctaneMeta())
    const core = getInstances()[0]
    const meta = fakeMeta(1, 0)

    act(() => core.emitMeta(meta))

    expect(result.current).toBe(meta)
  })

  test('re-renders when wins change', () => {
    const { result } = renderHook(() => useOctaneMeta())
    const core = getInstances()[0]

    act(() => core.emitMeta(fakeMeta(0, 0)))
    expect(result.current?.blue.wins).toBe(0)

    act(() => core.emitMeta(fakeMeta(1, 0)))
    expect(result.current?.blue.wins).toBe(1)

    act(() => core.emitMeta(fakeMeta(2, 1)))
    expect(result.current?.blue.wins).toBe(2)
    expect(result.current?.orange.wins).toBe(1)
  })

  test('two components subscribed simultaneously both update', () => {
    const a = renderHook(() => useOctaneMeta())
    const b = renderHook(() => useOctaneMeta())
    const core = getInstances()[0]

    expect(getInstances()).toHaveLength(1)

    const meta = fakeMeta(3, 2)
    act(() => core.emitMeta(meta))

    expect(a.result.current).toBe(meta)
    expect(b.result.current).toBe(meta)
  })

  test('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useOctaneMeta())
    const core = getInstances()[0]

    expect(core.metaHandlers.size).toBe(1)
    unmount()
    expect(core.metaHandlers.size).toBe(0)
  })
})
