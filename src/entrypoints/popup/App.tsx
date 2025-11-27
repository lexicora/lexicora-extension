import { useState } from 'react';
import reactLogo from '@/assets/logos/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="test-app text-3xl">WXT + React</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
            <Button onClick={() => setCount((count) => count + 1)}>
            count is {count}
            </Button>
            <ModeToggle />
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </ThemeProvider>
  );
}

export default App;
