import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import MobileTooltipGraph from '../MobileTooltipGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Tooltip)" Graph={MobileTooltipGraph} />
  </StrictMode>,
);
