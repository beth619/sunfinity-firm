'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { linkAppUserAfterAuth } from './actions'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const error_code = params.get('error_code')
    const error_description = params.get('error_description')

    if (!access_token || !refresh_token) {
      if (error_code || error_description) {
        console.error('Auth callback error:', error_code, error_description)
        setStatus(`Login link issue: ${error_description || error_code}`)
      } else {
        console.error('Auth callback: no tokens and no error in hash. Full hash:', hash)
        setStatus('No valid session found.')
      }
      router.push('/resend-link')
      return
    }

    supabase.auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          console.error('setSession failed:', error.message)
          router.push('/resend-link')
          return;
        }
        return linkAppUserAfterAuth();
      })
      .then(() => {
        window.location.href = '/dashboard'
      })
      .catch((err) => {
        console.error('Error linking user:', err)
        window.location.href = '/dashboard'
      })
  }, [router])

  return <p>{status}</p>
}