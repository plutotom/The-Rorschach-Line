import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import MobilePanGraph from '../MobilePanGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Mobile Pan)" Graph={MobilePanGraph} />
  </StrictMode>,
);
