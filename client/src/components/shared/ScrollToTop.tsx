import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      className={cn(
        'group fixed bottom-24 end-5 z-50 flex h-12 w-12 items-center justify-center rounded-full',
        'bg-primary text-white shadow-[0_10px_30px_-8px_rgba(21,94,99,0.55)]',
        'ring-1 ring-white/20 transition-all duration-300',
        'hover:scale-105 hover:bg-[#127178] hover:shadow-[0_14px_36px_-8px_rgba(21,94,99,0.65)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'active:scale-95',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-white/15 opacity-80" />
      <ArrowUp className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  )
}
