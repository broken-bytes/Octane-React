import { useEffect, useState } from 'react'
import { EventType } from '@octane-rl/core'
import type {
  BallHitEvent,
  ClockUpdatedEvent,
  CountdownBeginEvent,
  CrossbarHitEvent,
  Event as OctaneEvent,
  GoalReplayEndEvent,
  GoalReplayStartEvent,
  GoalReplayWillEndEvent,
  GoalScoredEvent,
  MatchCreatedEvent,
  MatchDestroyedEvent,
  MatchEndedEvent,
  MatchInitialisedEvent,
  MatchPausedEvent,
  MatchUnpausedEvent,
  PodiumStartEvent,
  ReplayCreatedEvent,
  RoundStartedEvent,
  StatFeedEvent,
} from '@octane-rl/core'
import { getOctaneCore } from '../internal/client'

export type OctaneEventMap = {
  [EventType.ballHit]: BallHitEvent
  [EventType.clockUpdatedSeconds]: ClockUpdatedEvent
  [EventType.countdownBegin]: CountdownBeginEvent
  [EventType.crossbarHit]: CrossbarHitEvent
  [EventType.goalReplayEnd]: GoalReplayEndEvent
  [EventType.goalReplayStart]: GoalReplayStartEvent
  [EventType.goalReplayWillEnd]: GoalReplayWillEndEvent
  [EventType.goalScored]: GoalScoredEvent
  [EventType.matchCreated]: MatchCreatedEvent
  [EventType.matchInitialized]: MatchInitialisedEvent
  [EventType.matchDestroyed]: MatchDestroyedEvent
  [EventType.matchEnded]: MatchEndedEvent
  [EventType.matchPaused]: MatchPausedEvent
  [EventType.matchUnpaused]: MatchUnpausedEvent
  [EventType.podiumStart]: PodiumStartEvent
  [EventType.replayCreated]: ReplayCreatedEvent
  [EventType.roundStarted]: RoundStartedEvent
  [EventType.statfeedEvent]: StatFeedEvent
}

export function useOctaneEvents(): OctaneEvent | null
export function useOctaneEvents<T extends EventType>(type: T): OctaneEventMap[T] | null
export function useOctaneEvents(type?: EventType): OctaneEvent | null {
  const [event, setEvent] = useState<OctaneEvent | null>(null)
  useEffect(
    () =>
      getOctaneCore().onEvent((e) => {
        if (type === undefined || e.type === type) setEvent(e)
      }),
    [type],
  )
  
  return event
}
