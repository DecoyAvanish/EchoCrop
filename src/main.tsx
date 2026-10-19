import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './xray/App';
import './shaders/threeui.css';
import './xray/styles.css';
import './xray/signature.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
