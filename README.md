# 🚗💨 Octane-React

> ⚛️ React hooks for the [Octane](https://github.com/octane-rl) Rocket League overlay toolkit.

`@octane-rl/react` wraps [`@octane-rl/core`](https://www.npmjs.com/package/@octane-rl/core) in a tiny set of ergonomic React hooks so you can build live Rocket League overlays, scoreboards, stat tickers, replay screens, and casting tools without ever touching the Rocket League Stats API. 🎮✨

## 📦 What's in the box

* 🔌 **Auto-managed connection** to the Octane WebSocket relay (no boilerplate, no listeners to clean up).
* 🧠 **Full game state** via `useOctaneState` (score, time, players, ball, boost, much more).
* 🛰️ **Match metadata** via `useOctaneMeta` (teams, players, arena info).
* 🎬 **Lifecycle awareness** via `useOctaneGameState` (idle, live, replay, podium, paused, ended).
* 🔔 **Typed gameplay events** via `useOctaneEvents` (goals, ball hits, crossbar pings, statfeed, countdowns, and more).
* 🧰 **TypeScript-first** with full type inference on every event.
* ⚡ **React 19 ready**, ESM-only, zero config.

## 🚀 Installation

```bash
npm install @octane-rl/react
# or
pnpm add @octane-rl/react
# or
yarn add @octane-rl/react
```

> ℹ️ `react@^19` is a hard requirement. `@octane-rl/core` ships alongside as the underlying transport.

## 🛠️ Setup

Octane-React talks to the [Octane-Bridge](https://github.com/Octane-Overlay/Octane-Bridge) over a local WebSocket. Make sure:

1. 🎯 Rocket League is running.
2. 🛜 The bridge is installed and running.
3. 🔢 You know the port the bridge is listening on (defaults to `49124`).

### ⚙️ Configure (optional)

If you need a custom port, call `configureOctane` **once at app startup**, before any hook renders:

```tsx
// main.tsx
import { configureOctane } from '@octane-rl/react'

configureOctane({ port: 49124 })
```

> 🪧 Configuration is sticky. After the first hook subscribes, the connection opens and further `configureOctane` calls are ignored (with a warning). 🔒

## 🪝 The Hooks

### 📊 `useOctaneState()`

Streams the latest full game state. Returns `null` until the first update lands.

```tsx
import { useOctaneState } from '@octane-rl/react'

export function Scoreboard() {
  const state = useOctaneState()
  if (!state) {
    return <div>⏳ Waiting for Rocket League...</div>
  }

  return (
    <div>
      🔵 {state.game.teams[0].score} : {state.game.teams[1].score} 🟠
    </div>
  )
}
```

### 🪪 `useOctaneMeta()`

Returns the per-match meta (team names, player roster, arena, etc.) once the match initializes.

```tsx
import { useOctaneMeta } from '@octane-rl/react'

export function MatchHeader() {
  const meta = useOctaneMeta()
  if (!meta) return null

  return <h1>🏟️ {meta.arena}</h1>
}
```

> [!TIP]
> The meta is provided by the bridge. To update the meta, the [Admin Panel](https://github.com/Octane-Overlay/Octane-Admin) is required. Otherwise the metadata is empty and teamnames and logos will be missing.

### 🎭 `useOctaneGameState()`

Reduces the firehose of lifecycle events into a single, friendly enum. Perfect for swapping overlays per phase.

```tsx
import { useOctaneGameState, GameState } from '@octane-rl/react'

export function OverlayRouter() {
  const phase = useOctaneGameState()

  switch (phase) {
    case GameState.live:         return <LiveScoreboard />     // 🟢
    case GameState.replay:       return <GoalReplayBanner />   // 🎬
    case GameState.replayEnding: return <FadeOut />            // 🌫️
    case GameState.paused:       return <PauseCard />          // ⏸️
    case GameState.podium:       return <PodiumScreen />       // 🏆
    case GameState.ended:        return <PostGameStats />      // 📈
    case GameState.idle:         return <Idle />               // 💤
  }
}
```

Possible values: `idle` 💤, `live` 🟢, `replay` 🎬, `replayEnding` 🌫️, `podium` 🏆, `ended` 📈, `paused` ⏸️.

### 🔔 `useOctaneEvents()`

Subscribe to gameplay events. Two modes:

#### 🌍 All events

```tsx
import { useOctaneEvents } from '@octane-rl/react'

export function EventTicker() {
  const event = useOctaneEvents()
  return <pre>{event && JSON.stringify(event, null, 2)}</pre>
}
```

#### 🎯 A single event type (fully typed payload)

```tsx
import { useOctaneEvents, EventType } from '@octane-rl/react'

export function GoalToast() {
  const goal = useOctaneEvents(EventType.goalScored)
  if (!goal) return null
  return <div>⚽ GOAL by {goal.scorer.name}!</div>
}
```

Available gameplay event types:

| Event 🎟️ | `EventType` value | Payload |
| --- | --- | --- |
| ⚽ Goal scored | `EventType.goalScored` | `GoalScoredEvent` |
| 🏀 Ball hit | `EventType.ballHit` | `BallHitEvent` |
| 🥅 Crossbar hit | `EventType.crossbarHit` | `CrossbarHitEvent` |
| 🕒 Clock tick | `EventType.clockUpdatedSeconds` | `ClockUpdatedEvent` |
| 3️⃣ Countdown begin | `EventType.countdownBegin` | `CountdownBeginEvent` |
| 🚦 Round started | `EventType.roundStarted` | `RoundStartedEvent` |
| 📢 Statfeed | `EventType.statfeedEvent` | `StatFeedEvent` (use `StatFeedEventType` for sub-typing) |

> 🧹 Lifecycle events (match start/end, replay phases, pause) are **filtered out** of `useOctaneEvents`. Use `useOctaneGameState` for those.

## 🧪 A complete mini-overlay

```tsx
import {
  configureOctane,
  useOctaneState,
  useOctaneGameState,
  useOctaneEvents,
  GameState,
  EventType,
} from '@octane-rl/react'

configureOctane({ port: 49124 })

export function Overlay() {
  const state = useOctaneState()
  const phase = useOctaneGameState()
  const lastGoal = useOctaneEvents(EventType.goalScored)

  if (phase === GameState.idle) return <div>💤 Waiting for kickoff...</div>

  return (
    <div className="overlay">
      <div className="score">
        🔵 {state?.game.teams[0].score ?? 0}
        <span> : </span>
        {state?.game.teams[1].score ?? 0} 🟠
      </div>
      {phase === GameState.replay && lastGoal && (
        <div className="goal-card">⚽ {lastGoal.scorer.name} scored!</div>
      )}
    </div>
  )
}
```

## 🧰 Scripts

```bash
npm run build      # 📦 build ESM + .d.ts via tsup
npm run dev        # 👀 watch mode
npm run typecheck  # 🧐 tsc --noEmit
npm run test       # 🧪 jest
```

## 🤝 Contributing

PRs welcome! 💚 Please run `npm run typecheck` and `npm run test` before opening one.

## 📜 License

[MIT](./LICENSE) 🆓
