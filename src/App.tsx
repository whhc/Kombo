import { useEffect, useState } from 'react'
import { OrbDisplay } from './components/OrbDisplay'
import { handleKey, type OrbState } from './domain/orbEngine'

function App() {
  const [state, setState] = useState<OrbState>({ orbs: [] })
  // 上一次有效操作的 timestamp,用于算 timeSinceLastMs
  const [lastTs, setLastTs] = useState(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const now = performance.now()
      const result = handleKey(state, key, now, lastTs)
      if (result.action) {
        setState(result.state)
        setLastTs(now)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state, lastTs])

  return (
    <div className="h-full w-full bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center gap-8">
      <h1 className="text-2xl font-bold">Kombo — 卡尔连招模拟器</h1>
      <p className="text-neutral-400 text-sm">按 Q / W / E 切元素球</p>
      <OrbDisplay orbs={state.orbs} />
    </div>
  )
}

export default App
