import { act, renderHook } from '@testing-library/react'
import type {
  ClockUpdatedEvent,
  GoalScoredEvent,
  MatchPausedEvent,
} from '@octane-rl/core'
import { EventType } from '@octane-rl/core'
import { useOctaneEvents } from '../src/hooks/use-octane-events'
import { __resetForTests } from '../src/internal/client'
import { getInstances, resetInstances } from './fake-core'

function goalEvent(scorerName: string): GoalScoredEvent {
  return {
    type: EventType.goalScored,
    matchId: 'm1',
    goalSpeed: 80,
    goalTime: 120,
    impactLocation: { x: 0, y: 5000, z: 100 },
    scorer: { name: scorerName, spectatorId: 1, team: 0 },
    assister: { name: '', spectatorId: -1, team: 0 },
    lastTouch: { player: { name: scorerName, spectatorId: 1, team: 0 }, speed: 80 },
  }
}

function clockEvent(seconds: number): ClockUpdatedEvent {
  return {
    type: EventType.clockUpdatedSeconds,
    matchId: 'm1',
    timeInSeconds: seconds,
    isOvertime: false,
  }
}

function matchPausedEvent(): MatchPausedEvent {
  return { type: EventType.matchPaused, matchId: 'm1' }
}

describe('useOctaneEvents', () => {
  beforeEach(() => {
    __resetForTests()
    resetInstances()
  })

  test('returns null before any event fires', () => {
    const { result } = renderHook(() => useOctaneEvents())
    expect(result.current).toBeNull()
  })

  test('connects to the core on first hook use', () => {
    renderHook(() => useOctaneEvents())
    expect(getInstances()).toHaveLength(1)
    expect(getInstances()[0].connectCalls).toBe(1)
  })

  test('without a filter, returns the most recent event of any type', () => {
    const { result } = renderHook(() => useOctaneEvents())
    const core = getInstances()[0]

    const goal = goalEvent('Squishy')
    act(() => core.emitEvent(goal))
    expect(result.current).toBe(goal)

    const clock = clockEvent(295)
    act(() => core.emitEvent(clock))
    expect(result.current).toBe(clock)
  })

  test('without a filter, lifecycle events (replay/podium/match) are excluded', () => {
    const { result } = renderHook(() => useOctaneEvents())
    const core = getInstances()[0]

    act(() => core.emitEvent({ type: EventType.goalReplayStart, matchId: 'm1' }))
    act(() => core.emitEvent({ type: EventType.goalReplayWillEnd, matchId: 'm1' }))
    act(() => core.emitEvent({ type: EventType.goalReplayEnd, matchId: 'm1' }))
    act(() => core.emitEvent({ type: EventType.replayCreated, matchId: 'm1' }))
    act(() => core.emitEvent({ type: EventType.podiumStart, matchId: 'm1' }))
    act(() => core.emitEvent(matchPausedEvent()))
    act(() => core.emitEvent({ type: EventType.matchEnded, matchId: 'm1', winnerTeamId: 0 }))
    expect(result.current).toBeNull()

    const goal = goalEvent('Squishy')
    act(() => core.emitEvent(goal))
    expect(result.current).toBe(goal)
  })

  test('with a type filter, ignores events of other types', () => {
    const { result } = renderHook(() => useOctaneEvents(EventType.goalScored))
    const core = getInstances()[0]

    act(() => core.emitEvent(clockEvent(300)))
    act(() => core.emitEvent(matchPausedEvent()))
    expect(result.current).toBeNull()

    const goal = goalEvent('JKnaps')
    act(() => core.emitEvent(goal))
    expect(result.current).toBe(goal)
  })

  test('with a type filter, updates on each new matching event', () => {
    const { result } = renderHook(() => useOctaneEvents(EventType.goalScored))
    const core = getInstances()[0]

    const first = goalEvent('Firstkiller')
    act(() => core.emitEvent(first))
    expect(result.current).toBe(first)

    const second = goalEvent('Daniel')
    act(() => core.emitEvent(second))
    expect(result.current).toBe(second)
  })

  test('two hooks with different filters receive independent events', () => {
    const goalsHook = renderHook(() => useOctaneEvents(EventType.goalScored))
    const clockHook = renderHook(() => useOctaneEvents(EventType.clockUpdatedSeconds))
    const core = getInstances()[0]

    expect(getInstances()).toHaveLength(1)

    const goal = goalEvent('Vatira')
    const clock = clockEvent(120)
    act(() => core.emitEvent(goal))
    act(() => core.emitEvent(clock))

    expect(goalsHook.result.current).toBe(goal)
    expect(clockHook.result.current).toBe(clock)
  })

  test('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useOctaneEvents())
    const core = getInstances()[0]

    expect(core.eventHandlers.size).toBe(1)
    unmount()
    expect(core.eventHandlers.size).toBe(0)
  })

  test('changing the filter resubscribes with the new type', () => {
    const { result, rerender } = renderHook(
      ({ type }: { type: EventType | undefined }) => useOctaneEvents(type as any),
      { initialProps: { type: EventType.goalScored as EventType | undefined } },
    )
    const core = getInstances()[0]

    act(() => core.emitEvent(clockEvent(60)))
    expect(result.current).toBeNull()

    rerender({ type: EventType.clockUpdatedSeconds })

    const clock = clockEvent(30)
    act(() => core.emitEvent(clock))
    expect(result.current).toBe(clock)
  })
})
