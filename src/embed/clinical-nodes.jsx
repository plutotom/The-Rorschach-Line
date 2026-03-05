import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import EmbedShell from './EmbedShell';
import ClinicalNodesGraph from '../ClinicalNodesGraph';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmbedShell title="Happiness Timeline (Clinical Nodes)" Graph={ClinicalNodesGraph} />
  </StrictMode>,
);
