import { Link, useParams } from 'react-router-dom'
import { Newspaper, Image as ImageIcon, Video } from 'lucide-react'

const sections = [
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'photos', label: 'Photos', icon: ImageIcon },
  { key: 'videos', label: 'Videos', icon: Video },
]

export default function Gallery() {
  const { category = 'news' } = useParams()
  const active = sections.find((item) => item.key === category) || sections[0]
  const Icon = active.icon

  return (
    <main className="bg-luxe-bg min-h-screen px-4 py-8 sm:py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#E9E4EF] shadow-sm p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-black">Teotia Shopprix</p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">Gallery</h1>
          <p className="text-sm text-slate-500 mt-2">Explore our latest news, photos and videos.</p>

          <div className="flex flex-wrap gap-2 mt-6 border-b border-[#E9E4EF] pb-4">
            {sections.map((item) => {
              const ItemIcon = item.icon
              return <Link key={item.key} to={`/gallery/${item.key}`} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${active.key === item.key ? 'bg-[#481F72] text-white' : 'bg-[#F7F1FB] text-slate-700 hover:text-[#481F72]'}`}><ItemIcon size={15} />{item.label}</Link>
            })}
          </div>

          <div className="min-h-[300px] flex flex-col items-center justify-center text-center px-5">
            <span className="w-16 h-16 rounded-2xl bg-[#F7F1FB] text-[#481F72] flex items-center justify-center"><Icon size={30} /></span>
            <h2 className="font-black text-xl text-slate-900 mt-4">{active.label}</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md">Gallery {active.label.toLowerCase()} will appear here when content is added.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
