interface ProgressBarProps {
  currentStep: number
  isTransitioning?: boolean
}

export default function ProgressBar({ currentStep, isTransitioning = false }: ProgressBarProps) {
  const steps = [
    { number: 1, label: '업로드' },
    { number: 2, label: '번역하기' },
    { number: 3, label: '단어 정리' },
  ]

  // 진행률 계산 (부드러운 전환을 위해)
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* 연결선 */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-700 -z-10">
          <div
            className={`h-full bg-primary transition-all ${
              isTransitioning ? 'duration-1000 ease-out' : 'duration-500 ease-in-out'
            }`}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {steps.map((step) => {
          const isActive = step.number <= currentStep
          const isCurrent = step.number === currentStep && isTransitioning
          return (
            <div key={step.number} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-700 text-gray-400'
                } ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-900' : ''}`}
              >
                {step.number}
              </div>
              <span className="mt-2 text-sm text-white">
                Step {step.number}. {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}


