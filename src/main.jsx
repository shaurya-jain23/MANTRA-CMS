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
import {DashboardPage, LoginPage, SignupPage, HomePage, PendingApprovalPage, UsersPage, NotFoundPage, UnauthorizedPage, ProfilePage, UpdateProfilePage, DealersPage} from './pages';

// Create the router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<HomePage />}/>
      <Route path="/login" element={
          <Protected authentication={false}>
            <LoginPage />
          </Protected>} />
      <Route path="/signup" element={
        <Protected authentication={false}>
            <SignupPage />
          </Protected>} /> 
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/pending-approval" element={
        <Protected authentication>
            <PendingApprovalPage />
          </Protected>} /> 
      <Route path="/update-profile" element={
        <Protected authentication>
            <UpdateProfilePage />
          </Protected>} /> 
      <Route path="/profile" element={
        <Protected authentication>
            <ProfilePage />
          </Protected>} /> 
      <Route path="/dashboard" element={
        <Protected authentication allowedRoles={['admin', 'superuser', 'sales', 'accounts']}>
            <DashboardPage />
        </Protected>} />
      <Route path="/dealers" element={
        <Protected authentication allowedRoles={['admin', 'superuser', 'sales', 'accounts']}>
            <DealersPage />
        </Protected>} />
      <Route path="/users" element={
        <Protected authentication allowedRoles={['superuser']}>
            <UsersPage />
        </Protected>} />
      <Route path="*" element={<NotFoundPage/>} />
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
