import { useCallback, useEffect } from 'react'
import { useLocalStorageWithSubscription } from './useLocalStorageWithSubscription'
import { getApiAuthGithubCallback } from '../../generated/api/auth/auth'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_REDIRECT_URI =
  import.meta.env.VITE_GITHUB_REDIRECT_URI || window.location.origin

export const useAuth = () => {
  const {
    isLoading,
    data: token,
    setValue,
  } = useLocalStorageWithSubscription('auth_token')

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')

      if (code && state) {
        const storedState = sessionStorage.getItem('github_oauth_state')

        if (state !== storedState) {
          console.error('OAuth state mismatch - possible CSRF attack')
          return
        }

        try {
          const response = await getApiAuthGithubCallback({ code, state })
          setValue(response.token)

          sessionStorage.removeItem('github_oauth_state')
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          )
        } catch (error) {
          console.error('GitHub OAuth callback failed:', error)
        }
      }
    }

    handleCallback()
  }, [setValue])

  const login = useCallback(async () => {
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem('github_oauth_state', state)

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'user:email',
      state: state,
    })

    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

    window.location.href = githubAuthUrl
  }, [])

  const logout = useCallback(async () => {
    setValue(null)
    sessionStorage.removeItem('github_oauth_state')
  }, [setValue])

  return { isLoading, login, logout, token }
}
