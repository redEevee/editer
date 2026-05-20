import { useState } from 'react'

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed.startsWith('sk-')) {
      setError('올바른 OpenAI API 키를 입력해주세요. (sk- 로 시작)')
      return
    }
    localStorage.setItem('openai_api_key', trimmed)
    onSave(trimmed)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#ig-grad-setup)" />
              <rect x="9" y="9" width="14" height="14" rx="3" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="22" cy="10" r="1" fill="white"/>
              <defs>
                <linearGradient id="ig-grad-setup" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f09433"/>
                  <stop offset="0.25" stopColor="#e6683c"/>
                  <stop offset="0.5" stopColor="#dc2743"/>
                  <stop offset="0.75" stopColor="#cc2366"/>
                  <stop offset="1" stopColor="#bc1888"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-white text-xl font-bold">Feed Generator</span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <h1 className="text-white text-2xl font-bold mb-2">시작하기</h1>
          <p style={{ color: '#a0a0a0' }} className="text-sm mb-6">
            스토리보드 PDF를 업로드하면 AI가 인스타그램 피드 9장을 자동으로 생성해줍니다.
            시작하려면 OpenAI API 키를 입력하세요.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>
                OpenAI API 키
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={e => { setKey(e.target.value); setError('') }}
                  placeholder="sk-proj-..."
                  className="w-full rounded-xl px-4 py-3 text-sm pr-12 outline-none transition-all"
                  style={{
                    background: '#0a0a0a',
                    border: error ? '1px solid #e1306c' : '1px solid #2a2a2a',
                    color: '#ffffff',
                  }}
                  onFocus={e => { if (!error) e.target.style.borderColor = '#e1306c' }}
                  onBlur={e => { if (!error) e.target.style.borderColor = '#2a2a2a' }}
                />
                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#a0a0a0' }}
                >
                  {show ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
              {error && <p className="text-xs mt-2" style={{ color: '#e1306c' }}>{error}</p>}
            </div>

            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                color: '#fff',
                opacity: key.trim() ? 1 : 0.4,
                cursor: key.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              시작하기
            </button>
          </form>

          {/* Info */}
          <div
            className="mt-6 rounded-xl p-4 flex gap-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a2a' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="#a0a0a0" strokeWidth="2"/>
              <path d="M12 16v-4m0-4h.01" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="text-xs space-y-1" style={{ color: '#a0a0a0' }}>
              <p>API 키는 이 브라우저에만 저장되며 외부로 전송되지 않습니다.</p>
              <p>
                키 발급:{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#e1306c' }}
                >
                  platform.openai.com/api-keys
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
