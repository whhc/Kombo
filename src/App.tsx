import { useEffect, useState } from 'react'
import { OrbDisplay } from './components/OrbDisplay'
import { SlotDisplay } from './components/SlotDisplay'
import { handleInvokerKey, type InvokerState } from './domain/invokerEngine'

const INITIAL: InvokerState = { orbs: [], slots: [null, null] }

function App() {
  const [state, setState] = useState<InvokerState>(INITIAL)
  const [lastTs, setLastTs] = useState(0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      const now = performance.now()
      const result = handleInvokerKey(state, key, now, lastTs)
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
      <p className="text-neutral-400 text-sm">按 Q / W / E 切元素球 · R 祈唤</p>
      <OrbDisplay orbs={state.orbs} />
      <SlotDisplay slots={state.slots} />
    </div>
  )
}

export default App
