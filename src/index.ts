export { useOctaneState } from './hooks/use-octane-state'
export {
  useOctaneEvents,
  type OctaneEventMap,
  type GameplayEvent,
  type GameplayEventType,
} from './hooks/use-octane-events'
export { useOctaneMeta } from './hooks/use-octane-meta'
export { useOctaneGameState, GameState } from './hooks/use-octane-game-state'
export { configureOctane, type OctaneConfig } from './internal/client'
export { EventType, StatFeedEventType } from '@octane-rl/core'
