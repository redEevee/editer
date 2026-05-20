import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

export default function PostEditor({ post, onUpdate, onRegenerate, onClose }) {
  const previewRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const { filters, overlayText, overlayFontSize, overlayColor, imageUrl, caption, title, imageStatus } = post

  const filterStyle = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`

  const handleExport = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        ignoreElements: (el) => el.dataset.ignoreCapture === 'true'
      })
      const link = document.createElement('a')
      link.download = `instagram-post-${post.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    await onRegenerate(post.id)
    setRegenerating(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', maxHeight: '90vh' }}
      >
        {/* Close button */}
        <button
          data-ignore-capture="true"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Left: Image Preview */}
        <div className="flex-shrink-0 md:w-96 flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
          <div
            ref={previewRef}
            className="relative w-full aspect-square rounded-xl overflow-hidden"
            style={{ maxWidth: '360px' }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                style={{ filter: filterStyle }}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#2a2a2a' }}>
                {imageStatus === 'generating' ? (
                  <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#2a2a2a" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="#e1306c" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <span style={{ color: '#555' }} className="text-sm">No image</span>
                )}
              </div>
            )}
            {/* Text Overlay */}
            {overlayText && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <p
                  className="font-bold text-center px-4 drop-shadow-lg"
                  style={{
                    color: overlayColor,
                    fontSize: `${overlayFontSize}px`,
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    wordBreak: 'break-word'
                  }}
                >
                  {overlayText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p style={{ color: '#a0a0a0' }} className="text-xs">Post Editor</p>
          </div>

          {/* Caption */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white text-sm font-medium">Caption</label>
              <span style={{ color: '#555' }} className="text-xs">{caption?.length || 0} / 2200</span>
            </div>
            <textarea
              value={caption || ''}
              onChange={(e) => onUpdate(post.id, { caption: e.target.value })}
              maxLength={2200}
              rows={4}
              className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none transition-colors"
              style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#fff' }}
              placeholder="Write your caption..."
            />
          </div>

          {/* Text Overlay */}
          <div>
            <label className="text-white text-sm font-medium block mb-2">Text Overlay</label>
            <input
              type="text"
              value={overlayText || ''}
              onChange={(e) => onUpdate(post.id, { overlayText: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-3"
              style={{ background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#fff' }}
              placeholder="Overlay text on image..."
            />
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <label style={{ color: '#a0a0a0' }} className="text-xs">Font Size</label>
                  <span style={{ color: '#a0a0a0' }} className="text-xs">{overlayFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={80}
                  value={overlayFontSize}
                  onChange={(e) => onUpdate(post.id, { overlayFontSize: Number(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>
              <div>
                <label style={{ color: '#a0a0a0' }} className="text-xs block mb-1">Color</label>
                <input
                  type="color"
                  value={overlayColor}
                  onChange={(e) => onUpdate(post.id, { overlayColor: e.target.value })}
                  className="w-10 h-8 rounded cursor-pointer"
                  style={{ background: 'none', border: '1px solid #2a2a2a' }}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className="text-white text-sm font-medium block mb-3">Filters</label>
            {[
              { label: 'Brightness', key: 'brightness' },
              { label: 'Contrast', key: 'contrast' },
              { label: 'Saturation', key: 'saturation' }
            ].map(({ label, key }) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between mb-1">
                  <label style={{ color: '#a0a0a0' }} className="text-xs">{label}</label>
                  <span style={{ color: '#a0a0a0' }} className="text-xs">{filters[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={filters[key]}
                  onChange={(e) =>
                    onUpdate(post.id, { filters: { ...filters, [key]: Number(e.target.value) } })
                  }
                  className="w-full accent-pink-500"
                />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating || imageStatus === 'generating'}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #3a3a3a' }}
            >
              {regenerating || imageStatus === 'generating' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#555" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="#e1306c" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Regenerating...
                </span>
              ) : 'Regenerate Image'}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || !imageUrl}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
              }}
            >
              {exporting ? 'Exporting...' : 'Export Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
