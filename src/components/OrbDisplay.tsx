import { useRef } from 'react'
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
 *   - 新球入队(队尾/最右):从右侧滑入 + 延迟脉冲发光环(在左移完成后闪现)
 *   - 整队左移:layout 动画平滑插值位置
 *   - 队首被推出(最左):向左淡出消失
 *   - 空槽(队列未满):虚线占位,不参与动画
 *
 * 脉冲与左移分离:入场动画只管位移+透明度(scale 会与 layout 位移冲突被盖住),
 * 新球额外用独立 keyframes 发光环在 0.15s 延迟后闪一次(0.5s)。
 */
export function OrbDisplay({ orbs, theme, locale, t }: Props) {
  const orbList = useOrbIdentity(orbs)

  // 记录上次渲染的末尾 orb id,用于判定本轮"新球"(FIFO 下新球恒在队尾)
  const lastTailIdRef = useRef<number>(0)
  const currentTailId = orbList.length > 0 ? orbList[orbList.length - 1].id : 0
  const isNewTail = currentTailId > lastTailIdRef.current
  lastTailIdRef.current = currentTailId

  return (
    <div className="flex gap-3" role="group" aria-label={t('orb.group')}>
      <AnimatePresence mode="popLayout" initial={false}>
        {orbList.map((orb, i) => {
          const isNew = isNewTail && i === orbList.length - 1
          return (
            <motion.div
              key={orb.id}
              layout
              // 入场只管位移+透明度,scale 交给独立脉冲避免与 layout 冲突
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className="relative"
            >
              <ElementIcon element={orb.element} tooltipName={elementName(locale, orb.element)} theme={theme} />
              {/* 新球发光环:延迟 0.15s(等左移完成)后闪一次,scale+发光 0.5s */}
              {isNew && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: '0 0 12px 4px rgba(56,189,248,0.7)' }}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0, 1, 0], scale: [1, 1.4, 1.15] }}
                  transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
                />
              )}
            </motion.div>
          )
        })}
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
