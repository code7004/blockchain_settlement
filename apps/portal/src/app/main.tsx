import { MaintenancePage } from '@/pagas/MaintenancePage.tsx';
import '@/styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

(async () => {
  const isMaintenance = false;

  const root = createRoot(document.getElementById('root')!);
  // main.tsx
  if (isMaintenance) {
    root.render(<MaintenancePage />);
  } else {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
})();
