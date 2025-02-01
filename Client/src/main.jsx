import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../CSS/index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import UserContextProvider from './context/UserContextProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{}}
        containerClassName=""
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <App />
    </UserContextProvider>
  </StrictMode>,
)
