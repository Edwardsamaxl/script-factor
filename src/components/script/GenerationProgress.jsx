import './GenerationProgress.css'

/**
 * 生成进度动画组件
 *
 * @param {number} progress - 进度百分比 (0-100)
 * @param {number} currentRound - 当前轮次 (1-10)
 *
 * 动画接口说明：
 * 传入的组件需要接收 progress 和 currentRound props
 * 即可自定义各种动画效果
 */

// 默认动画：旋转的对话气泡
function DefaultAnimation({ progress, currentRound }) {
  return (
    <div className="generation-animation">
      <div className="bubble-container">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              animationDelay: `${i * 0.2}s`,
              opacity: progress > (i * 33) ? 1 : 0.3
            }}
          />
        ))}
      </div>
      <div className="round-indicator">
        第 {currentRound} / 10 轮
      </div>
    </div>
  )
}

// 进阶动画 1：脉冲圆点
function PulseAnimation({ progress, currentRound }) {
  return (
    <div className="generation-animation">
      <div className="pulse-container">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`pulse-dot ${i < currentRound ? 'active' : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <div className="round-indicator">
        {currentRound <= 10 ? '生成中...' : '完成!'}
      </div>
    </div>
  )
}

// 进阶动画 2：对话气泡（可替换为实际对话内容）
function ChatBubbleAnimation({ progress, currentRound }) {
  return (
    <div className="generation-animation">
      <div className="chat-bubble-container">
        <div className={`chat-bubble left ${progress >= 10 ? 'visible' : ''}`}>
          A
        </div>
        <div className={`chat-bubble right ${progress >= 30 ? 'visible' : ''}`}>
          B
        </div>
        <div className={`chat-bubble left ${progress >= 50 ? 'visible' : ''}`}>
          A
        </div>
        <div className={`chat-bubble right ${progress >= 70 ? 'visible' : ''}`}>
          B
        </div>
      </div>
      <div className="round-indicator">
        {currentRound}/10 轮对话
      </div>
    </div>
  )
}

// 动画注册表 - 可以轻松替换
const ANIMATIONS = {
  bubbles: DefaultAnimation,
  pulse: PulseAnimation,
  chat: ChatBubbleAnimation,
}

// 进度条主组件
export default function GenerationProgress({
  progress = 0,
  currentRound = 1,
  animationType = 'bubbles', // 默认动画
  className = ''
}) {
  const AnimationComponent = ANIMATIONS[animationType] || DefaultAnimation

  return (
    <div className={`generation-progress ${className}`}>
      <AnimationComponent progress={progress} currentRound={currentRound} />

      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text">{progress}%</div>
      </div>

      <div className="progress-steps">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`progress-step ${progress > (i * 10) ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

// 导出动画组件供外部替换使用
export { DefaultAnimation, PulseAnimation, ChatBubbleAnimation, ANIMATIONS }
