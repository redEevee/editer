import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

export default function GridEditor({ posts, onSelectPost, onExportAll }) {
  const [exporting, setExporting] = useState(false)
  const cardRefs = useRef({})

  const handleExportAll = async () => {
    setExporting(true)
    const donePosts = posts.filter(p => p.imageStatus === 'done' && p.imageUrl)
    for (let i = 0; i < donePosts.length; i++) {
      const post = donePosts[i]
      const el = cardRefs.current[post.id]
      if (!el) continue
      try {
        const canvas = await html2canvas(el, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
          ignoreElements: (node) => node.dataset.ignoreCapture === 'true'
        })
        const link = document.createElement('a')
        link.download = `instagram-post-${post.id}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        await new Promise(r => setTimeout(r, 500))
      } catch (e) {
        console.error('Export error for post', post.id, e)
      }
    }
    setExporting(false)
  }

  const readyCount = posts.filter(p => p.imageStatus === 'done').length

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-bold">Your Instagram Grid</h2>
          <p style={{ color: '#a0a0a0' }} className="text-sm mt-0.5">
            {readyCount} of {posts.length} posts ready
          </p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={exporting || readyCount === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            boxShadow: '0 4px 15px rgba(225,48,108,0.3)'
          }}
        >
          {exporting ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 16V8m0 8l-3-3m3 3l3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 15v3a2 2 0 002 2h14a2 2 0 002-2v-3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Export All
            </>
          )}
        </button>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, idx) => {
          const post = posts[idx]
          const status = post?.imageStatus || 'pending'

          const filterStyle = post
            ? `brightness(${post.filters.brightness}%) contrast(${post.filters.contrast}%) saturate(${post.filters.saturation}%)`
            : 'none'

          return (
            <div
              key={idx}
              className="aspect-square relative overflow-hidden cursor-pointer group"
              style={{ background: '#1a1a1a' }}
              onClick={() => post && onSelectPost(post.id)}
            >
              <div
                ref={el => { if (post) cardRefs.current[post.id] = el }}
                className="w-full h-full relative"
              >
                {status === 'done' && post?.imageUrl ? (
                  <>
                    <img
                      src={post.imageUrl}
                      alt={post?.title || ''}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ filter: filterStyle }}
                      crossOrigin="anonymous"
                    />
                    {post?.overlayText && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p
                          className="font-bold text-center px-2"
                          style={{
                            color: post.overlayColor,
                            fontSize: `${Math.max(post.overlayFontSize * 0.4, 10)}px`,
                            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                            wordBreak: 'break-word'
                          }}
                        >
                          {post.overlayText}
                        </p>
                      </div>
                    )}
                  </>
                ) : status === 'generating' ? (
                  <div
                    className="w-full h-full"
                    style={{
                      background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite'
                    }}
                  />
                ) : status === 'error' ? (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-1" style={{ background: '#1a1a1a' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="#e1306c" strokeWidth="2"/>
                      <path d="M12 8v4m0 4h.01" stroke="#e1306c" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span style={{ color: '#e1306c' }} className="text-xs">Error</span>
                  </div>
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                )}
              </div>

              {/* Hover overlay */}
              {post && (
                <div
                  data-ignore-capture="true"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(0,0,0,0.55)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(225,48,108,0.9)' }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {post.title && (
                    <span className="text-white text-xs font-medium px-2 text-center truncate max-w-full">
                      {post.title}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
