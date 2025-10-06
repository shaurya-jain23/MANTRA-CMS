import React from 'react';
import { DealerProvider } from '../contexts/DealerContext';

function DealerLayout({children}) {
  return (
    <DealerProvider>
      {children}
    </DealerProvider>
  );
}

export default DealerLayout;
