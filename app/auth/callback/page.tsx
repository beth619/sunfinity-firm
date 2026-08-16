'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { linkAppUserAfterAuth } from './actions'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const error_description = params.get('error_description')

    if (!access_token || !refresh_token) {
      console.error('Auth callback: missing tokens', error_description || hash)
      setStatus('No valid session found.')
      router.push('/resend-link')
      return
    }

    fetch('/api/auth/set-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token, refresh_token }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.error) {
          console.error('set-session failed:', data.error)
          router.push('/resend-link')
          return
        }
        await linkAppUserAfterAuth().catch((err) => console.error('Error linking user:', err))
        window.location.href = '/dashboard'
      })
      .catch((err) => {
        console.error('set-session request failed:', err)
        router.push('/resend-link')
      })
  }, [router])

  return <p>{status}</p>
}