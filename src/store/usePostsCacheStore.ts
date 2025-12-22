import { create } from 'zustand'
import { ApiPost } from '@/services/postsService'

interface PostsCache {
  posts: ApiPost[]
  page: number
  hasMore: boolean
  initialized: boolean
}

interface PostsCacheStore {
  // Cache pour la liste générale des posts
  homePosts: PostsCache
  // Cache pour les posts par utilisateur (key: userId)
  userPosts: Record<string, PostsCache>
  
  // Actions pour les posts généraux
  setHomePosts: (posts: ApiPost[], page: number, hasMore: boolean) => void
  getHomePosts: () => PostsCache
  resetHomePosts: () => void
  
  // Actions pour les posts utilisateur
  setUserPosts: (userId: string, posts: ApiPost[], page: number, hasMore: boolean) => void
  getUserPosts: (userId: string) => PostsCache | undefined
  resetUserPosts: (userId: string) => void
  resetAllUserPosts: () => void
}

const defaultPostsCache: PostsCache = {
  posts: [],
  page: 0,
  hasMore: true,
  initialized: false,
}

export const usePostsCacheStore = create<PostsCacheStore>((set, get) => ({
  homePosts: defaultPostsCache,
  userPosts: {},
  
  setHomePosts: (posts, page, hasMore) =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set((state) => ({
      homePosts: {
        posts,
        page,
        hasMore,
        initialized: true,
      },
    })),
  
  getHomePosts: () => get().homePosts,
  
  resetHomePosts: () =>
    set({
      homePosts: defaultPostsCache,
    }),
  
  setUserPosts: (userId, posts, page, hasMore) =>
    set((state) => ({
      userPosts: {
        ...state.userPosts,
        [userId]: {
          posts,
          page,
          hasMore,
          initialized: true,
        },
      },
    })),
  
  getUserPosts: (userId) => get().userPosts[userId],
  
  resetUserPosts: (userId) =>
    set((state) => {
      const newUserPosts = { ...state.userPosts }
      delete newUserPosts[userId]
      return { userPosts: newUserPosts }
    }),
  
  resetAllUserPosts: () =>
    set({ userPosts: {} }),
}))
