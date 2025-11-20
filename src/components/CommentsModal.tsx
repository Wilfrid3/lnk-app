'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { getFullImageUrl } from '@/utils/imageUtils'
import apiClient from '@/lib/axios'

interface Comment {
  id: string
  content: string
  likes: number
  replies: number // Always a number after processing
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    avatar?: string
    isVerified: boolean
  }
  isOwner: boolean
  isLiked?: boolean
  hasMoreReplies?: boolean
  repliesData?: Comment[] // For UI state management
}

interface ApiComment {
  id: string
  content: string
  likes: number
  replies: Comment[] | number // API can return array or number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    avatar?: string
    isVerified: boolean
  }
  isOwner: boolean
  hasMoreReplies?: boolean
}

interface CommentsResponse {
  comments: ApiComment[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  onCommentAdded?: (videoId: string) => void
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  videoId,
  onCommentAdded
}) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
    totalPages: 1
  })

  const fetchComments = useCallback(async (page = 1, append = false) => {
    setLoading(true)
    console.log('Fetching comments for videoId:', videoId, 'page:', page);
    try {
      const response = await apiClient.get(`/videos/${videoId}/comments?page=${page}&limit=20`)
      const data = response.data as CommentsResponse
      
      // Process comments to handle replies structure
      const processedComments: Comment[] = data.comments.map(comment => ({
        ...comment,
        repliesData: Array.isArray(comment.replies) ? comment.replies : undefined,
        replies: Array.isArray(comment.replies) ? comment.replies.length : comment.replies
      }))
      
      if (append) {
        setComments(prev => [...prev, ...processedComments])
      } else {
        setComments(processedComments)
      }

      console.log('Fetched comments:', comments);
      
      setPagination({
        page: data.pagination.page,
        hasNext: data.pagination.hasNext,
        totalPages: data.pagination.totalPages
      })
    } catch (error) {
      console.error('Error fetching comments:', error)
      // Fallback to empty array if API fails
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [videoId])

  const fetchReplies = async (commentId: string) => {
    try {
      const response = await apiClient.get(`/videos/comments/${commentId}/replies?page=1&limit=10`)
      const data = response.data as { replies: Comment[] }
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, repliesData: data.replies, hasMoreReplies: false }
          : comment
      ))
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const toggleReplies = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    if (comment.repliesData) {
      // Hide replies
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, repliesData: undefined }
          : c
      ))
    } else {
      // Load and show replies
      fetchReplies(commentId)
    }
  }

  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments(1, false)
    }
  }, [isOpen, videoId, fetchComments])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || submitting) return

    setSubmitting(true)
    try {
      const response = await apiClient.post(`/videos/${videoId}/comments`, {
        content: newComment.trim()
      })

      const newCommentData = response.data as Comment
      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
      console.log(comments)
      
      // fetchComments(1, false)
      // Notify parent component that a comment was added
      if (onCommentAdded) {
        onCommentAdded(videoId)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !user || submitting) return

    setSubmitting(true)
    try {
      const response = await apiClient.post(`/videos/${videoId}/comments`, {
        content: replyText.trim(),
        parentId: parentId
      })

      const newReply = response.data as Comment
      
      // Update the parent comment's replies count and add the new reply
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { 
              ...comment, 
              replies: comment.replies + 1,
              repliesData: [...(comment.repliesData || []), newReply]
            }
          : comment
      ))
      
      setReplyText('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) return

    try {
      const response = await apiClient.post(`/videos/comments/${commentId}/like`)
      const result = response.data as { liked: boolean }
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: result.liked,
            likes: result.liked ? comment.likes + 1 : comment.likes - 1
          }
        }
        
        // Also update in replies if needed
        if (comment.repliesData) {
          return {
            ...comment,
            repliesData: comment.repliesData.map(reply => 
              reply.id === commentId 
                ? {
                    ...reply,
                    isLiked: result.liked,
                    likes: result.liked ? reply.likes + 1 : reply.likes - 1
                  }
                : reply
            )
          }
        }
        
        return comment
      }))
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return

    try {
      await apiClient.delete(`/videos/comments/${commentId}`)
      
      // Remove the comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const loadMoreComments = () => {
    if (pagination.hasNext && !loading) {
      fetchComments(pagination.page + 1, true)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}j`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white dark:bg-gray-800 w-full max-h-[80vh] rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Commentaires
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-icons text-gray-400 text-4xl mb-2 block">comment</span>
                  <p className="text-gray-500 dark:text-gray-400">Aucun commentaire pour le moment</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Soyez le premier à commenter !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      {/* Main Comment */}
                      <div className="flex space-x-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {comment.user.avatar ? (
                            <Image
                              src={getFullImageUrl(comment.user.avatar) ?? '/images/avatars/default_tous.png'}
                              alt={comment.user.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                              {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {comment.user.name}
                                </span>
                                {comment.user.isVerified && (
                                  <span className="material-icons text-blue-500 ml-1 text-xs">verified</span>
                                )}
                              </div>
                              {comment.isOwner && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-gray-400 hover:text-red-500 text-xs"
                                >
                                  <span className="material-icons text-xs">delete</span>
                                </button>
                              )}
                            </div>
                            <p className="text-gray-800 dark:text-gray-200 text-sm">
                              {comment.isDeleted ? <em>Commentaire supprimé</em> : comment.content}
                            </p>
                          </div>

                          {/* Comment Actions */}
                          <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatTimeAgo(comment.createdAt)}</span>
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center space-x-1 ${
                                comment.isLiked ? 'text-red-500' : 'hover:text-red-500'
                              }`}
                            >
                              <span className="material-icons text-xs">
                                {comment.isLiked ? 'favorite' : 'favorite_border'}
                              </span>
                              {comment.likes > 0 && <span>{comment.likes}</span>}
                            </button>
                            <button 
                              onClick={() => setReplyingTo(comment.id)}
                              className="hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              Répondre
                            </button>
                            {comment.replies > 0 && (
                              <button
                                onClick={() => toggleReplies(comment.id)}
                                className="hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                {comment.repliesData 
                                  ? 'Masquer les réponses' 
                                  : (() => {
                                      const repliesText = comment.replies > 1 ? 'réponses' : 'réponse'
                                      return `Voir ${comment.replies} ${repliesText}`
                                    })()
                                }
                              </button>
                            )}
                          </div>

                          {/* Reply Input */}
                          {replyingTo === comment.id && (
                            <div className="mt-2 flex space-x-2">
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Écrivez une réponse..."
                                className="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-600 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSubmitReply(comment.id)
                                  } else if (e.key === 'Escape') {
                                    setReplyingTo(null)
                                    setReplyText('')
                                  }
                                }}
                                maxLength={500}
                              />
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyText.trim() || submitting}
                                className="px-2 py-1 text-xs bg-primary-500 text-white rounded-full disabled:opacity-50 hover:bg-primary-600 transition-colors"
                              >
                                {submitting ? '...' : 'Répondre'}
                              </button>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.repliesData && comment.repliesData.length > 0 && (
                            <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                              {comment.repliesData.map((reply) => (
                                <div key={reply.id} className="flex space-x-2">
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                    {reply.user.avatar ? (
                                      <Image
                                        src={getFullImageUrl(reply.user.avatar) ?? '/images/avatars/default_tous.png'}
                                        alt={reply.user.name}
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                                        {reply.user.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-50 dark:bg-gray-600 rounded-xl px-2 py-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                            {reply.user.name}
                                          </span>
                                          {reply.user.isVerified && (
                                            <span className="material-icons text-blue-500 ml-1 text-xs">verified</span>
                                          )}
                                        </div>
                                        {reply.isOwner && (
                                          <button
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="text-gray-400 hover:text-red-500 text-xs"
                                          >
                                            <span className="material-icons text-xs">delete</span>
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-gray-800 dark:text-gray-200 text-xs">
                                        {reply.isDeleted ? <em>Réponse supprimée</em> : reply.content}
                                      </p>
                                    </div>
                                    <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{formatTimeAgo(reply.createdAt)}</span>
                                      <button
                                        onClick={() => handleLikeComment(reply.id)}
                                        className={`flex items-center space-x-1 ${
                                          reply.isLiked ? 'text-red-500' : 'hover:text-red-500'
                                        }`}
                                      >
                                        <span className="material-icons text-xs">
                                          {reply.isLiked ? 'favorite' : 'favorite_border'}
                                        </span>
                                        {reply.likes > 0 && <span>{reply.likes}</span>}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Comments */}
                  {pagination.hasNext && (
                    <div className="text-center py-4">
                      <button
                        onClick={loadMoreComments}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                      >
                        {loading ? 'Chargement...' : 'Charger plus'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Comment Input */}
        {user ? (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <Image
                    src={getFullImageUrl(user.avatar) ?? '/images/avatars/default_tous.png'}
                    alt={user.name ?? 'User'}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                  maxLength={500}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <span className="material-icons text-sm">send</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Connectez-vous pour commenter
            </p>
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentsModal
