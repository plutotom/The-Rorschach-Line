import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import ControlPointsGraph from '../ControlPointsGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Control Nodes)" Graph={ControlPointsGraph} />
  </StrictMode>,
);
