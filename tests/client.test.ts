import { configureOctane, getOctaneCore, __resetForTests } from '../src/internal/client'
import { getInstances, resetInstances } from './fake-core'

describe('octane client singleton', () => {
  beforeEach(() => {
    __resetForTests()
    resetInstances()
  })

  test('returns the same OctaneCore instance across multiple calls', () => {
    const a = getOctaneCore()
    const b = getOctaneCore()
    expect(a).toBe(b)
    expect(getInstances()).toHaveLength(1)
  })

  test('calls connect() exactly once even when getOctaneCore is called repeatedly', () => {
    getOctaneCore()
    getOctaneCore()
    getOctaneCore()
    expect(getInstances()[0].connectCalls).toBe(1)
  })

  test('uses the default port when configureOctane is not called', () => {
    getOctaneCore()
    expect(getInstances()[0].config.port).toBe(49124)
  })

  test('configureOctane({ port }) before first use overrides the port', () => {
    configureOctane({ port: 8080 })
    getOctaneCore()
    expect(getInstances()[0].config.port).toBe(8080)
  })

  test('configureOctane after the connection is opened logs a warning and does not change the port', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    getOctaneCore()
    configureOctane({ port: 9999 })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(getInstances()).toHaveLength(1)
    expect(getInstances()[0].config.port).toBe(49124)

    warn.mockRestore()
  })
})
