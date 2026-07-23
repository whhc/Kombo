import { AnimatePresence, motion } from 'framer-motion'
import type { Element } from '../domain/types'
import { ElementIcon } from './ElementIcon'
import { elementName } from '../domain/i18n'
import type { Locale } from '../domain/i18n'
import type { IconTheme } from '../domain/icons'
import { useOrbIdentity } from '../hooks/useOrbIdentity'

interface Props {
  orbs: Element[]
  theme: IconTheme
  locale: Locale
  t: (key: string) => string
}

/**
 * 头顶元素球:固定 3 槽位,FIFO 队列动画。
 *
 * 视觉效果:
 *   - 新球入队(队尾/最右):从右侧滑入 + 脉冲放大(scale 1.3→1)
 *   - 整队左移:layout 动画平滑插值位置(球从右槽滑到左槽)
 *   - 队首被推出(最左):向左淡出消失
 *   - 空槽(队列未满):虚线占位,不参与动画
 *
 * 实现要点:用单个 AnimatePresence 包裹整个球列表,以球的稳定 id 作 key,
 * 让 framer-motion 通过 layout prop 自动协调跨槽位的位移动画。
 */
export function OrbDisplay({ orbs, theme, locale, t }: Props) {
  const orbList = useOrbIdentity(orbs)

  return (
    <div className="flex gap-3" role="group" aria-label={t('orb.group')}>
      <AnimatePresence mode="popLayout" initial={false}>
        {orbList.map((orb) => (
          <motion.div
            key={orb.id}
            layout
            initial={{ x: 60, opacity: 0, scale: 1.3 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -60, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          >
            <ElementIcon element={orb.element} tooltipName={elementName(locale, orb.element)} theme={theme} />
          </motion.div>
        ))}
      </AnimatePresence>
      {/* 空槽占位:补齐到 3 个槽位的视觉宽度,不参与进/出动画 */}
      {Array.from({ length: Math.max(0, 3 - orbList.length) }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="h-14 w-14 rounded-full border-2 border-dashed border-white/15 bg-white/5"
          aria-label={t('orb.emptySlot')}
        />
      ))}
    </div>
  )
}
