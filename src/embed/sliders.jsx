import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import DecadeSlidersGraph from '../DecadeSlidersGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Decade Sliders)" Graph={DecadeSlidersGraph} />
  </StrictMode>,
);
