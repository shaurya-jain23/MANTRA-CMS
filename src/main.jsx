import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import {store} from './app/store'
import './index.css'
import App from './App.jsx'
import { 
  createBrowserRouter, 
  createRoutesFromElements, 
  Route, 
  RouterProvider 
} from 'react-router-dom';


import {Protected} from './components'
import {DashboardPage, LoginPage, SignupPage} from './pages';
import Dashboard from './pages/Dasboard.jsx'

// Create the router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} /> 
      <Route path="/dashboard" element={
          <Protected authentication>
            <Dashboard />
          </Protected>} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <Provider store={store}>
     <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
