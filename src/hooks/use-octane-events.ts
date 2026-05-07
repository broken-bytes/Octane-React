import { useEffect, useState } from 'react'
import { EventType } from '@octane-rl/core'
import type {
  BallHitEvent,
  ClockUpdatedEvent,
  CountdownBeginEvent,
  CrossbarHitEvent,
  GoalScoredEvent,
  RoundStartedEvent,
  StatFeedEvent,
} from '@octane-rl/core'
import { getOctaneCore } from '../internal/client'

const LIFECYCLE_EVENT_TYPES: ReadonlySet<EventType> = new Set<EventType>([
  EventType.matchCreated,
  EventType.matchInitialized,
  EventType.matchDestroyed,
  EventType.matchEnded,
  EventType.matchPaused,
  EventType.matchUnpaused,
  EventType.goalReplayStart,
  EventType.goalReplayWillEnd,
  EventType.goalReplayEnd,
  EventType.replayCreated,
  EventType.podiumStart,
])

export type GameplayEventType =
  | EventType.ballHit
  | EventType.clockUpdatedSeconds
  | EventType.countdownBegin
  | EventType.crossbarHit
  | EventType.goalScored
  | EventType.roundStarted
  | EventType.statfeedEvent

export type OctaneEventMap = {
  [EventType.ballHit]: BallHitEvent
  [EventType.clockUpdatedSeconds]: ClockUpdatedEvent
  [EventType.countdownBegin]: CountdownBeginEvent
  [EventType.crossbarHit]: CrossbarHitEvent
  [EventType.goalScored]: GoalScoredEvent
  [EventType.roundStarted]: RoundStartedEvent
  [EventType.statfeedEvent]: StatFeedEvent
}

export type GameplayEvent = OctaneEventMap[GameplayEventType]

export function useOctaneEvents(): GameplayEvent | null
export function useOctaneEvents<T extends GameplayEventType>(type: T): OctaneEventMap[T] | null
export function useOctaneEvents(type?: GameplayEventType): GameplayEvent | null {
  const [event, setEvent] = useState<GameplayEvent | null>(null)
  useEffect(
    () =>
      getOctaneCore().onEvent((e) => {
        if (LIFECYCLE_EVENT_TYPES.has(e.type)) return
        if (type === undefined || e.type === type) setEvent(e as GameplayEvent)
      }),
    [type],
  )

  return event
}
