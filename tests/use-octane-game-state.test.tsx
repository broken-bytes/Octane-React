import { act, renderHook } from '@testing-library/react'
import { EventType } from '@octane-rl/core'
import {
  GameState,
  useOctaneGameState,
} from '../src/hooks/use-octane-game-state'
import { __resetForTests } from '../src/internal/client'
import { getInstances, resetInstances } from './fake-core'

function ev(type: EventType, extra: Record<string, unknown> = {}) {
  return { type, matchId: 'm1', ...extra }
}

describe('useOctaneGameState', () => {
  beforeEach(() => {
    __resetForTests()
    resetInstances()
  })

  test('starts in idle state', () => {
    const { result } = renderHook(() => useOctaneGameState())
    expect(result.current).toBe(GameState.idle)
  })

  test('connects to the core on first hook use', () => {
    renderHook(() => useOctaneGameState())
    expect(getInstances()).toHaveLength(1)
    expect(getInstances()[0].connectCalls).toBe(1)
  })

  test('matchInitialized -> live', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]
    act(() => core.emitEvent(ev(EventType.matchInitialized)))
    expect(result.current).toBe(GameState.live)
  })

  test('matchCreated -> live', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]
    act(() => core.emitEvent(ev(EventType.matchCreated)))
    expect(result.current).toBe(GameState.live)
  })

  test('replay lifecycle: live -> replay -> replayEnding -> live', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]

    act(() => core.emitEvent(ev(EventType.matchInitialized)))
    expect(result.current).toBe(GameState.live)

    act(() => core.emitEvent(ev(EventType.goalReplayStart)))
    expect(result.current).toBe(GameState.replay)

    act(() => core.emitEvent(ev(EventType.goalReplayWillEnd)))
    expect(result.current).toBe(GameState.replayEnding)

    act(() => core.emitEvent(ev(EventType.goalReplayEnd)))
    expect(result.current).toBe(GameState.live)
  })

  test('pause/unpause toggles paused/live', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]

    act(() => core.emitEvent(ev(EventType.matchInitialized)))
    act(() => core.emitEvent(ev(EventType.matchPaused)))
    expect(result.current).toBe(GameState.paused)

    act(() => core.emitEvent(ev(EventType.matchUnpaused)))
    expect(result.current).toBe(GameState.live)
  })

  test('podiumStart -> podium', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]
    act(() => core.emitEvent(ev(EventType.podiumStart)))
    expect(result.current).toBe(GameState.podium)
  })

  test('matchEnded -> ended', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]
    act(() => core.emitEvent(ev(EventType.matchEnded, { winnerTeamId: 0 })))
    expect(result.current).toBe(GameState.ended)
  })

  test('matchDestroyed -> idle', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]
    act(() => core.emitEvent(ev(EventType.matchInitialized)))
    act(() => core.emitEvent(ev(EventType.matchDestroyed)))
    expect(result.current).toBe(GameState.idle)
  })

  test('non-lifecycle events do not change state', () => {
    const { result } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]
    act(() => core.emitEvent(ev(EventType.matchInitialized)))
    act(() =>
      core.emitEvent(
        ev(EventType.clockUpdatedSeconds, { timeInSeconds: 60, isOvertime: false }),
      ),
    )
    expect(result.current).toBe(GameState.live)
  })

  test('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useOctaneGameState())
    const core = getInstances()[0]
    expect(core.eventHandlers.size).toBe(1)
    unmount()
    expect(core.eventHandlers.size).toBe(0)
  })
})
