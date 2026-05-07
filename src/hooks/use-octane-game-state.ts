import { useEffect, useState } from 'react'
import { EventType } from '@octane-rl/core'
import { getOctaneCore } from '../internal/client'

export const GameState = {
  idle: 'idle',
  live: 'live',
  replay: 'replay',
  replayEnding: 'replayEnding',
  podium: 'podium',
  ended: 'ended',
  paused: 'paused',
} as const

export type GameState = (typeof GameState)[keyof typeof GameState]

export function useOctaneGameState(): GameState {
  const [gameState, setGameState] = useState<GameState>(GameState.idle)
  useEffect(
    () =>
      getOctaneCore().onEvent((e) => {
        switch (e.type) {
          case EventType.matchCreated:
          case EventType.matchInitialized:
            setGameState(GameState.live)
            break
          case EventType.matchDestroyed:
            setGameState(GameState.idle)
            break
          case EventType.matchPaused:
            setGameState(GameState.paused)
            break
          case EventType.matchUnpaused:
            setGameState(GameState.live)
            break
          case EventType.goalReplayStart:
            setGameState(GameState.replay)
            break
          case EventType.goalReplayWillEnd:
            setGameState(GameState.replayEnding)
            break
          case EventType.goalReplayEnd:
            setGameState(GameState.live)
            break
          case EventType.podiumStart:
            setGameState(GameState.podium)
            break
          case EventType.matchEnded:
            setGameState(GameState.ended)
            break
        }
      }),
    [],
  )

  return gameState
}
