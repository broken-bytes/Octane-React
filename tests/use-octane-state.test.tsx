import { act, renderHook } from '@testing-library/react'
import type { UpdateState } from '@octane-rl/core'
import { useOctaneState } from '../src/hooks/use-octane-state'
import { __resetForTests } from '../src/internal/client'
import { getInstances, resetInstances } from './fake-core'

function fakeState(score: number): UpdateState {
  return {
    matchId: 'm1',
    players: [],
    game: {
      teams: [
        { name: 'Blue', id: 0, score, colourPrimary: '#0000ff', colourSecondary: '#000080' },
      ],
      timeSeconds: 300,
      isOvertime: false,
      ball: {},
      isReplay: false,
      hasWinner: false,
      winner: '',
      arena: 'Forbidden Temple',
      hasTarget: false,
    },
  }
}

describe('useOctaneState', () => {
  beforeEach(() => {
    __resetForTests()
    resetInstances()
  })

  test('returns null before any state event arrives', () => {
    const { result } = renderHook(() => useOctaneState())
    expect(result.current).toBeNull()
  })

  test('connects to the core on first hook use', () => {
    renderHook(() => useOctaneState())
    expect(getInstances()).toHaveLength(1)
    expect(getInstances()[0].connectCalls).toBe(1)
  })

  test('returns the latest UpdateState after onState fires', () => {
    const { result } = renderHook(() => useOctaneState())
    const core = getInstances()[0]
    const state = fakeState(0)

    act(() => core.emitState(state))

    expect(result.current).toBe(state)
  })

  test('re-renders when the score changes', () => {
    const { result } = renderHook(() => useOctaneState())
    const core = getInstances()[0]

    act(() => core.emitState(fakeState(0)))
    expect(result.current?.game.teams[0].score).toBe(0)

    act(() => core.emitState(fakeState(1)))
    expect(result.current?.game.teams[0].score).toBe(1)

    act(() => core.emitState(fakeState(2)))
    expect(result.current?.game.teams[0].score).toBe(2)
  })

  test('two components subscribed simultaneously both update', () => {
    const a = renderHook(() => useOctaneState())
    const b = renderHook(() => useOctaneState())
    const core = getInstances()[0]

    expect(getInstances()).toHaveLength(1)

    const state = fakeState(7)
    act(() => core.emitState(state))

    expect(a.result.current).toBe(state)
    expect(b.result.current).toBe(state)
  })

  test('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useOctaneState())
    const core = getInstances()[0]

    expect(core.stateHandlers.size).toBe(1)
    unmount()
    expect(core.stateHandlers.size).toBe(0)
  })
})
