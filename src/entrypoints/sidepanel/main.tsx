import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// import "@fontsource/inter/index.css";
import '@fontsource/figtree/index.css';
import '../../assets/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
