import React from 'react';
import { BookingProvider } from '../contexts/BookingContext';
import { DealerProvider } from '../contexts/DealerContext';

function BookingLayout({children}) {
  return (
    <DealerProvider>
      <BookingProvider>
        {children}
      </BookingProvider>
    </DealerProvider>
  );
}

export default BookingLayout;
