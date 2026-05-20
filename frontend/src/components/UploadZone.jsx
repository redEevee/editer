import { useState, useRef, useCallback } from 'react'

export default function UploadZone({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file) return
    const valid = file.type === 'application/pdf' || file.name.endsWith('.md') || file.type === 'text/markdown' || file.type === 'text/plain'
    if (valid) setSelectedFile(file)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleInputChange = useCallback((e) => {
    handleFile(e.target.files[0])
  }, [handleFile])

  const handleGenerate = useCallback(() => {
    if (selectedFile) onUpload(selectedFile)
  }, [selectedFile, onUpload])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0a0a0a' }}>
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#ig-grad)" />
            <rect x="9" y="9" width="14" height="14" rx="3" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="22" cy="10" r="1" fill="white"/>
            <defs>
              <linearGradient id="ig-grad" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f09433"/>
                <stop offset="0.25" stopColor="#e6683c"/>
                <stop offset="0.5" stopColor="#dc2743"/>
                <stop offset="0.75" stopColor="#cc2366"/>
                <stop offset="1" stopColor="#bc1888"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white text-2xl font-bold tracking-tight">Feed Generator</span>
        </div>
        <p style={{ color: '#a0a0a0' }} className="text-sm">Powered by GPT-4o + DALL-E 3</p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative cursor-pointer w-full max-w-lg rounded-2xl p-10 flex flex-col items-center gap-5 transition-all duration-300"
        style={{
          background: '#1a1a1a',
          border: isDragging
            ? '2px solid #e1306c'
            : '2px dashed #2a2a2a',
          boxShadow: isDragging ? '0 0 30px rgba(225,48,108,0.2)' : 'none'
        }}
      >
        {/* Gradient border animation */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            opacity: isDragging ? 0.15 : 0,
            transition: 'opacity 0.3s',
            zIndex: 0
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-5 w-full">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(225,48,108,0.1)', border: '2px solid rgba(225,48,108,0.3)' }}
          >
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <path d="M12 16V8m0 0L8.5 11.5M12 8l3.5 3.5" stroke="#e1306c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 15v3a2 2 0 002 2h14a2 2 0 002-2v-3" stroke="#e1306c" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-white text-xl font-semibold mb-2">스토리보드 업로드</h2>
            <p style={{ color: '#a0a0a0' }} className="text-sm leading-relaxed">
              PDF 또는 Markdown(.md) 파일을 올리면<br/>AI가 9장 인스타 피드를 자동 생성해줍니다
            </p>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(225,48,108,0.15)', color: '#e1306c', border: '1px solid rgba(225,48,108,0.3)' }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#e1306c" strokeWidth="2" fill="none"/>
              <path d="M14 2v6h6" stroke="#e1306c" strokeWidth="2"/>
            </svg>
            {selectedFile ? selectedFile.name : 'Drag & drop or click to browse'}
          </div>
          <p style={{ color: '#555' }} className="text-xs">PDF · Markdown(.md) 지원</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.md,text/markdown,text/plain"
        className="hidden"
        onChange={handleInputChange}
      />

      {selectedFile && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2" style={{ color: '#a0a0a0' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#e1306c" strokeWidth="1.5" fill="none"/>
              <path d="M14 2v6h6" stroke="#e1306c" strokeWidth="1.5"/>
            </svg>
            <span className="text-sm">{selectedFile.name}</span>
          </div>
          <button
            onClick={handleGenerate}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              boxShadow: '0 4px 20px rgba(225,48,108,0.4)'
            }}
          >
            Generate Feed
          </button>
        </div>
      )}
    </div>
  )
}
