import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Tailwind CSS
import 'react-big-calendar/lib/css/react-big-calendar.css'; // react-big-calendar CSS
import './styles/calendar.css'; // Custom calendar styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
