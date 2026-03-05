import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import MobileHapticGraph from '../MobileHapticGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Haptic)" Graph={MobileHapticGraph} />
  </StrictMode>,
);
