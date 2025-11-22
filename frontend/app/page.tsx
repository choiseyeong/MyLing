import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          내가 찾던 나만의 영어 지문 학습 장소
        </h1>
        <p className="text-2xl mb-8">
          지금, 마일링에서 시작하세요!
        </p>
        <Link
          href="/learn"
          className="inline-block px-12 py-4 bg-gradient-to-r from-primary to-pink-500 rounded-full text-white font-semibold text-lg hover:opacity-90 transition-opacity"
        >
          분석 시작하기
        </Link>
      </div>
    </main>
  )
}



