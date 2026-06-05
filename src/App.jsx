import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import Login from './home/Login'
import SignUp from './home/SignUp'
import { supabase } from './SupabaseClient'

const App = () => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <SignUp />} />
      <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App