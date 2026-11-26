import { Suspense, lazy, useEffect, type ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useSettings } from './lib/settings'
import { ToastProvider, useToast } from './components/Toast'
import { useReminders } from './hooks/useReminders'
import { PasscodeGate } from './components/PasscodeGate'
import Splash from './routes/Splash'
import Onboarding from './routes/Onboarding'
import Home from './routes/Home'

// Everything past the first screens loads on demand to keep the first visit fast.
const JournalWrite = lazy(() => import('./routes/JournalWrite'))
const JournalSpeak = lazy(() => import('./routes/JournalSpeak'))
const JournalLogs = lazy(() => import('./routes/JournalLogs'))
const EntryView = lazy(() => import('./routes/EntryView'))
const MoodLogs = lazy(() => import('./routes/MoodLogs'))
const Vent = lazy(() => import('./routes/Vent'))
const VentSpace = lazy(() => import('./routes/VentSpace'))
const VentDetail = lazy(() => import('./routes/VentDetail'))
const Profile = lazy(() => import('./routes/Profile'))
const Settings = lazy(() => import('./routes/Settings'))
const About = lazy(() => import('./routes/About'))
const Mission = lazy(() => import('./routes/Mission'))
const Creator = lazy(() => import('./routes/Creator'))
const Help = lazy(() => import('./routes/Help'))
const Contact = lazy(() => import('./routes/Contact'))
const Privacy = lazy(() => import('./routes/Privacy'))

/** Applies the theme and font-size settings to <html>. */
function Appearance() {
  const s = useSettings()
  useEffect(() => {
    if (!s) return
    document.documentElement.dataset.theme = s.theme
    document.documentElement.dataset.font = s.fontSize
  }, [s])
  return null
}

function Reminders() {
  useReminders(useToast())
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/** First launch goes through the splash and onboarding before anything else. */
function RequireOnboarded({ children }: { children: ReactElement }) {
  const s = useSettings()
  if (!s) return null
  return s.onboarded ? children : <Navigate to="/splash" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Appearance />
        <Reminders />
        <ScrollToTop />
        <PasscodeGate>
          <Suspense fallback={<div className="min-h-dvh bg-ink" />}>
          <Routes>
            <Route path="/splash" element={<Splash />} />
            <Route path="/welcome" element={<Onboarding />} />
            <Route path="/" element={<RequireOnboarded><Home /></RequireOnboarded>} />
            <Route path="/journal/write" element={<RequireOnboarded><JournalWrite /></RequireOnboarded>} />
            <Route path="/journal/speak" element={<RequireOnboarded><JournalSpeak /></RequireOnboarded>} />
            <Route path="/logs" element={<RequireOnboarded><JournalLogs /></RequireOnboarded>} />
            <Route path="/logs/:id" element={<RequireOnboarded><EntryView /></RequireOnboarded>} />
            <Route path="/moods" element={<RequireOnboarded><MoodLogs /></RequireOnboarded>} />
            <Route path="/vent" element={<RequireOnboarded><Vent /></RequireOnboarded>} />
            <Route path="/vent-space" element={<RequireOnboarded><VentSpace /></RequireOnboarded>} />
            <Route path="/vent-space/:id" element={<RequireOnboarded><VentDetail /></RequireOnboarded>} />
            <Route path="/profile" element={<RequireOnboarded><Profile /></RequireOnboarded>} />
            <Route path="/settings" element={<RequireOnboarded><Settings /></RequireOnboarded>} />
            <Route path="/about" element={<About />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/creator" element={<Creator />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </PasscodeGate>
      </ToastProvider>
    </BrowserRouter>
  )
}
