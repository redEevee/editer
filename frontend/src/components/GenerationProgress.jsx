export default function GenerationProgress({ posts }) {
  const total = 9
  const done = posts.filter(p => p.imageStatus === 'done' || p.imageStatus === 'error').length
  const generating = posts.findIndex(p => p.imageStatus === 'generating')
  const currentNum = generating !== -1 ? generating + 1 : done

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-white text-2xl font-bold mb-2">Generating your Instagram grid...</h2>
        <p style={{ color: '#a0a0a0' }} className="text-sm">
          {done < total
            ? `Creating post ${currentNum} of ${total}...`
            : 'Finalizing your grid...'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs mb-2" style={{ color: '#a0a0a0' }}>
          <span>{done} of {total} posts generated</span>
          <span>{Math.round((done / total) * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: '#2a2a2a' }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(done / total) * 100}%`,
              background: 'linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
            }}
          />
        </div>
      </div>

      {/* 3x3 Grid Preview */}
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: total }).map((_, idx) => {
          const post = posts[idx]
          const status = post?.imageStatus || 'pending'
          return (
            <div
              key={idx}
              className="aspect-square rounded-lg overflow-hidden relative"
              style={{ background: '#1a1a1a' }}
            >
              {status === 'done' && post?.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : status === 'generating' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-full h-full absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite'
                    }}
                  />
                  <div className="relative z-10">
                    <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#2a2a2a" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="#e1306c" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              ) : status === 'error' ? (
                <div className="w-full h-full flex items-center justify-center flex-col gap-1">
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
                    background: 'linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite'
                  }}
                />
              )}
              {post?.title && (
                <div
                  className="absolute bottom-0 left-0 right-0 px-1 py-1 text-center"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  <p className="text-white text-xs truncate">{post.title}</p>
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
