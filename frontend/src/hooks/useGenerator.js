import { useState, useCallback } from 'react'
import { analyzeStoryboard, generateImage } from '../api/client.js'

const defaultFilters = { brightness: 100, contrast: 100, saturation: 100 }

function makePostDefaults(post) {
  return {
    ...post,
    imageUrl: null,
    imageStatus: 'pending',
    filters: { ...defaultFilters },
    overlayText: post.textOverlay || '',
    overlayFontSize: 32,
    overlayColor: '#ffffff'
  }
}

export function useGenerator() {
  const [status, setStatus] = useState('idle') // 'idle'|'analyzing'|'generating'|'ready'
  const [posts, setPosts] = useState([])
  const [error, setError] = useState(null)

  const updatePostById = useCallback((postId, changes) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, ...changes } : p))
    )
  }, [])

  const uploadAndAnalyze = useCallback(async (file) => {
    setError(null)
    setStatus('analyzing')
    setPosts([])

    let analyzedPosts
    try {
      const data = await analyzeStoryboard(file)
      analyzedPosts = (data.posts || []).map(makePostDefaults)
      setPosts(analyzedPosts)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to analyze storyboard')
      setStatus('idle')
      return
    }

    setStatus('generating')

    for (const post of analyzedPosts) {
      setPosts(prev =>
        prev.map(p => (p.id === post.id ? { ...p, imageStatus: 'generating' } : p))
      )
      try {
        const result = await generateImage(post.imagePrompt, post.id)
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id
              ? { ...p, imageUrl: result.url, imageStatus: 'done' }
              : p
          )
        )
      } catch (err) {
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id ? { ...p, imageStatus: 'error' } : p
          )
        )
      }
    }

    setStatus('ready')
  }, [])

  const regenerateImage = useCallback(async (postId) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, imageStatus: 'generating' } : p))
    )
    const post = posts.find(p => p.id === postId)
    if (!post) return
    try {
      const result = await generateImage(post.imagePrompt, postId)
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, imageUrl: result.url, imageStatus: 'done' }
            : p
        )
      )
    } catch (err) {
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, imageStatus: 'error' } : p))
      )
    }
  }, [posts])

  const updatePost = useCallback((postId, changes) => {
    updatePostById(postId, changes)
  }, [updatePostById])

  return { status, posts, error, uploadAndAnalyze, regenerateImage, updatePost }
}
