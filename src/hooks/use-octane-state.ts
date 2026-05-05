import { useEffect, useState } from 'react'
import type { UpdateState } from '@octane-rl/core'
import { getOctaneCore } from '../internal/client'

export function useOctaneState(): UpdateState | null {
  const [state, setState] = useState<UpdateState | null>(null)
  useEffect(() => getOctaneCore().onState(setState), [])
  
  return state
}
