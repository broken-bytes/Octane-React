import { OctaneCore } from '@octane-rl/core'

const DEFAULT_PORT = 49124

export interface OctaneConfig {
  port?: number
}

let configuredPort = DEFAULT_PORT
let core: OctaneCore | null = null
let didConnect = false

export function configureOctane(config: OctaneConfig): void {
  if (core !== null) {
    console.warn(
      '[octane-rl/react] configureOctane was called after the connection was already opened — the new config is ignored. Call configureOctane(...) at app startup, before any component using Octane hooks renders.',
    )
    
    return
  }
  if (config.port !== undefined) {
    configuredPort = config.port
  }
}

export function getOctaneCore(): OctaneCore {
  if (core === null) {
    core = new OctaneCore({ port: configuredPort })
  }

  if (!didConnect) {
    didConnect = true
    core.connect()
  }

  return core
}

export function __resetForTests(): void {
  core = null
  didConnect = false
  configuredPort = DEFAULT_PORT
}
