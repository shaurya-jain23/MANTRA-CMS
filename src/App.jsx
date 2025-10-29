// src/App.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import authService from './firebase/auth';
import { login, logout } from './features/user/userSlice';
import { Footer, Header, Loading } from './components';
import { Outlet } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { ModalProvider } from './contexts/ModalContext';
import { useUserStatusMonitor } from './hooks/useUserStatusMonitor';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService
      .getCurrentUser()
      .then(async (user) => {
        if (user) {
          console.log(user);
          dispatch(login(user));
        } else {
          dispatch(logout());
        }
      })
      .catch((error) => {
        console.error('Error during app initialization:', error);
        dispatch(logout());
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  useUserStatusMonitor();
  if (loading) {
    return <Loading isOpen={loading} message="Loading the Page..." />;
  }
  return (
    <ModalProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col justify-center items-center">
          <Outlet />
        </main>
        <Footer />
        <Toaster
          toastOptions={{
            className: '',
            style: {
              fontSize: '15px',
              fontWeight: '500',
              minWidth: '200px',
            },
            // Customizing styling for specific toast types
            custom: {
              icon: <Info style={{ color: '#007BFF' }} />,
              style: {
                background: '#E0F2FF', // Lighter blue background
                color: '#007BFF', // Darker blue text
              },
            },
          }}
          containerStyle={{
            top: 100,
            left: 20,
            bottom: 20,
            right: 20,
          }}
        />
      </div>
    </ModalProvider>
  );
}

export default App;
