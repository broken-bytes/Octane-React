import { useEffect, useState } from 'react'
import type { OctaneMeta } from '@octane-rl/core'
import { getOctaneCore } from '../internal/client'

export function useOctaneMeta(): OctaneMeta | null {
  const [meta, setMeta] = useState<OctaneMeta | null>(null)
  useEffect(() => getOctaneCore().onMeta(setMeta), [])

  return meta
}
