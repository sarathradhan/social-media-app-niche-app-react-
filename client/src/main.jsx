import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils.css'
import './styles/sty.css'; // Importing the CSS file
import './styles/stylesy.css';
import './styles/stylesx.css';
import App from './App.jsx'
import { ToastProvider } from './Toast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
