import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import MobileSnapGraph from '../MobileSnapGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Target Snap)" Graph={MobileSnapGraph} />
  </StrictMode>,
);
