import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import MobileOrientGraph from '../MobileOrientGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Orient Check)" Graph={MobileOrientGraph} />
  </StrictMode>,
);
