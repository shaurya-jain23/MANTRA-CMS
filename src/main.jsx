import { Buffer } from 'buffer';
window.Buffer = Buffer;
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
import {DashboardPage, LoginPage, SignupPage, HomePage, PendingApprovalPage, UsersPage, NotFoundPage, UnauthorizedPage, ProfilePage, UpdateProfilePage, DealersPage, BookingsPage, SalesPage, PIFormPage, PerformaInvoicesPage, PIShowPage, BookingDetailsPage, AccountDisabledPage} from './pages';
import BookingLayout from './Layouts/BookingLayout.jsx'
import DealerLayout from './Layouts/DealerLayout.jsx'

// Create the router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route element={<Protected authentication={false} />}>
          <Route path="/" element={<HomePage />}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/disabled" element={<AccountDisabledPage />} />
      </Route>
      <Route element={<Protected authentication />}>
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/update-profile" element={<UpdateProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route element={<Protected authentication allowedRoles={['admin', 'superuser', 'manager']} />}>
          <Route path="/dashboard" element={
            <BookingLayout>
              <DashboardPage />
            </BookingLayout>
            } />
      </Route>
      <Route element={<Protected authentication allowedRoles={['sales', 'admin', 'superuser']} />}>
        <Route path="/sales" element={
          <BookingLayout>
            <SalesPage />
          </BookingLayout>} />
        <Route path="/bookings" element={
          <BookingLayout>
            <BookingsPage />
          </BookingLayout>
          } />
        <Route path="/bookings/:bId" element={
          <BookingLayout>
            <BookingDetailsPage />
          </BookingLayout>
          } />
        <Route path="/performa-invoices" element={<PerformaInvoicesPage />} />
        <Route path="/performa-invoices/new" element={
          <DealerLayout>
            <PIFormPage />
          </DealerLayout>
          } />
        <Route path="/performa-invoices/:piId/edit" element={
          <DealerLayout>
            <PIFormPage />
          </DealerLayout>
          } />
        <Route path="/performa-invoices/:piId" element={<PIShowPage />} />
      </Route>
      <Route element={<Protected authentication allowedRoles={['admin', 'superuser', 'sales', 'accounts']} />}>
        <Route path="/dealers" element={
          <DealerLayout>
             <DealersPage />
          </DealerLayout>
          } />
      </Route>
      <Route element={<Protected authentication allowedRoles={['superuser']} />}>
        <Route path="/users" element={<UsersPage />} />
      </Route>
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
