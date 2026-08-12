import { useEffect, useState } from 'react'
import { useAuth } from '@/store/authStore'
import { businessApi } from '@/services/business.api'

/**
 * Resolves the current business id:
 * 1. From authenticated user.businessId
 * 2. From localStorage
 * 3. From first business owned by user (API)
 */
export function useBusinessId() {
  const { user, isAuthenticated } = useAuth()
  const [businessId, setBusinessId] = useState<string>(
    () => user?.businessId || localStorage.getItem('businessId') || ''
  )
  const [loading, setLoading] = useState(!businessId)

  useEffect(() => {
    if (user?.businessId) {
      setBusinessId(user.businessId)
      localStorage.setItem('businessId', user.businessId)
      setLoading(false)
      return
    }

    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    businessApi
      .getMine()
      .then((list) => {
        if (list?.[0]?._id) {
          setBusinessId(list[0]._id)
          localStorage.setItem('businessId', list[0]._id)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, isAuthenticated])

  return { businessId, setBusinessId, loading }
}
