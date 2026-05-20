import { useState, useEffect } from 'react'
import { useGenerator } from './hooks/useGenerator.js'
import ApiKeySetup from './components/ApiKeySetup.jsx'
import UploadZone from './components/UploadZone.jsx'
import GenerationProgress from './components/GenerationProgress.jsx'
import GridEditor from './components/GridEditor.jsx'
import PostEditor from './components/PostEditor.jsx'

export default function App() {
  const { status, posts, error, uploadAndAnalyze, regenerateImage, updatePost } = useGenerator()
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '')

  const selectedPost = posts.find(p => p.id === selectedPostId) || null

  function handleSaveKey(key) {
    setApiKey(key)
  }

  function handleChangeKey() {
    if (confirm('API 키를 변경하면 현재 작업이 초기화됩니다. 계속하시겠습니까?')) {
      localStorage.removeItem('openai_api_key')
      setApiKey('')
    }
  }

  if (!apiKey) {
    return <ApiKeySetup onSave={handleSaveKey} />
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#ig-grad-h)" />
            <rect x="9" y="9" width="14" height="14" rx="3" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="22" cy="10" r="1" fill="white"/>
            <defs>
              <linearGradient id="ig-grad-h" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f09433"/>
                <stop offset="0.25" stopColor="#e6683c"/>
                <stop offset="0.5" stopColor="#dc2743"/>
                <stop offset="0.75" stopColor="#cc2366"/>
                <stop offset="1" stopColor="#bc1888"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white font-bold text-base">Feed Generator</span>
        </div>

        <div className="flex items-center gap-3">
          {status !== 'idle' && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: status === 'ready' ? 'rgba(34,197,94,0.15)' : 'rgba(225,48,108,0.15)',
                color: status === 'ready' ? '#22c55e' : '#e1306c'
              }}
            >
              {status === 'analyzing' && '분석 중...'}
              {status === 'generating' && '생성 중...'}
              {status === 'ready' && '완료'}
            </span>
          )}
          <button
            onClick={handleChangeKey}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: '#2a2a2a', color: '#a0a0a0' }}
            onMouseEnter={e => { e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.color = '#a0a0a0' }}
          >
            🔑 API 키 변경
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(225,48,108,0.1)', border: '1px solid rgba(225,48,108,0.3)' }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#e1306c" strokeWidth="2"/>
            <path d="M12 8v4m0 4h.01" stroke="#e1306c" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p style={{ color: '#e1306c' }} className="text-sm">{error}</p>
        </div>
      )}

      {/* Main content */}
      {status === 'idle' && <UploadZone onUpload={uploadAndAnalyze} />}

      {status === 'analyzing' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <div
                  className="absolute inset-0 rounded-full animate-spin"
                  style={{
                    background: 'conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)',
                    padding: '3px'
                  }}
                >
                  <div className="w-full h-full rounded-full" style={{ background: '#0a0a0a' }} />
                </div>
              </div>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">스토리보드 분석 중...</h2>
            <p style={{ color: '#a0a0a0' }} className="text-sm">GPT-4o가 PDF를 읽고 9개 게시물을 기획하고 있어요</p>
          </div>
        </div>
      )}

      {status === 'generating' && <GenerationProgress posts={posts} />}

      {status === 'generating' && posts.some(p => p.imageStatus === 'done') && (
        <GridEditor posts={posts} onSelectPost={setSelectedPostId} />
      )}

      {status === 'ready' && (
        <GridEditor posts={posts} onSelectPost={setSelectedPostId} />
      )}

      {selectedPost && (
        <PostEditor
          post={selectedPost}
          onUpdate={updatePost}
          onRegenerate={regenerateImage}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  )
}
