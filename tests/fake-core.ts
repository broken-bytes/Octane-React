export enum EventType {
  ballHit = 0,
  clockUpdatedSeconds = 1,
  countdownBegin = 2,
  crossbarHit = 3,
  goalReplayEnd = 4,
  goalReplayStart = 5,
  goalReplayWillEnd = 6,
  goalScored = 7,
  matchCreated = 8,
  matchInitialized = 9,
  matchDestroyed = 10,
  matchEnded = 11,
  matchPaused = 12,
  matchUnpaused = 13,
  podiumStart = 14,
  replayCreated = 15,
  roundStarted = 16,
  statfeedEvent = 17,
}

export enum StatFeedEventType {
  demolish = 0,
  shot = 1,
  goal = 2,
  longGoal = 3,
  hatTrick = 4,
  save = 5,
  epicSave = 6,
  savior = 7,
  assist = 8,
  playmaker = 9,
}

type Handler<T> = (arg: T) => void

let instances: OctaneCore[] = []

export class OctaneCore {
  config: { port: number }
  connectCalls = 0
  closeCalls = 0
  eventHandlers = new Set<Handler<any>>()
  stateHandlers = new Set<Handler<any>>()

  constructor(config: { port: number }) {
    this.config = config
    instances.push(this)
  }

  onEvent(h: Handler<any>): () => void {
    this.eventHandlers.add(h)
    return () => {
      this.eventHandlers.delete(h)
    }
  }

  onState(h: Handler<any>): () => void {
    this.stateHandlers.add(h)
    return () => {
      this.stateHandlers.delete(h)
    }
  }

  onOpen(_h: () => void): () => void {
    return () => {}
  }

  onClose(_h: Handler<any>): () => void {
    return () => {}
  }

  onError(_h: Handler<Error>): () => void {
    return () => {}
  }

  connect(): void {
    this.connectCalls++
  }

  close(): void {
    this.closeCalls++
  }

  emitEvent(e: any): void {
    for (const h of [...this.eventHandlers]) h(e)
  }

  emitState(s: any): void {
    for (const h of [...this.stateHandlers]) h(s)
  }
}

export function getInstances(): OctaneCore[] {
  return instances
}

export function resetInstances(): void {
  instances = []
}
