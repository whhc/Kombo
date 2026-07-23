import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface Props {
  /** 是否处于冷却中(渲染遮蔽层并播放扫描动画) */
  active: boolean
  /** 冷却总时长 ms */
  durationMs: number
  /** 与图标同尺寸 px */
  size: number
}

/**
 * 冷却遮蔽层:类似时钟顺时针扫过的"逐渐退出"动画。
 *
 * 原理:用 conic-gradient 画一个扇形遮蔽,遮蔽角度从 360°(全遮)线性减到 0°(全清),
 * 视觉上像时钟指针顺时针扫过、逐步露出下方图标。
 *
 *   conic-gradient(from -90deg, transparent 0 calc(360-angle)deg, rgba(0,0,0,.72) calc(360-angle)deg 360deg)
 *
 *   - angle=360 → 遮蔽区 0~360 全黑
 *   - angle=180 → 遮蔽区 180~360 半黑(顺时针扫过左半)
 *   - angle=0   → 遮蔽区为空,完全露出
 *
 * framer-motion 的 motionValue 驱动 angle 从 360→0,用 useTransform 拼成 gradient 字符串,
 * 赋给 motion.div 的 background。线性过渡 durationMs。
 */
export function CooldownOverlay({ active, durationMs, size }: Props) {
  const angle = useMotionValue(360)
  // from -90deg 让起点在 12 点位(正上方);遮蔽区 = 已扫过的剩余部分
  const background = useTransform(angle, (a) => {
    const sweep = 360 - a // 已清除的角度
    return `conic-gradient(from -90deg, rgba(0,0,0,0) 0deg ${sweep}deg, rgba(0,0,0,0.72) ${sweep}deg 360deg)`
  })

  useEffect(() => {
    if (!active) return
    // 每次激活:角度从 360 回到 0
    angle.set(360)
    const controls = animate(angle, 0, {
      duration: durationMs / 1000,
      ease: 'linear',
    })
    return () => controls.stop()
  }, [active, durationMs, angle])

  if (!active) return null

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 rounded-lg pointer-events-none"
      style={{ width: size, height: size, background }}
    />
  )
}
