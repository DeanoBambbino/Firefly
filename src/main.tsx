import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import VideoPlayer from './VideoPlayer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoPlayer />
  </StrictMode>,
)
