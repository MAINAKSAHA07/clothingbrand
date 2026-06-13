import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import state from './store';
import Canvas from './canvas';
import Customizer from './pages/Customizer';
import LandingPage from './pages/LandingPage';
import { ZipperLoader } from './components';

function App() {
  const snap = useSnapshot(state);
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {snap.intro && !introComplete && (
        <ZipperLoader onComplete={() => setIntroComplete(true)} />
      )}
      
      <main className={`transition-all duration-[800ms] ease-out ${
        snap.intro 
          ? `relative w-full min-h-screen overflow-y-auto overflow-x-hidden scroll-smooth bg-white text-black ${
              introComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
            }` 
          : 'app'
      }`}>
        {snap.intro ? (
          <LandingPage />
        ) : (
          <>
            <Canvas />
            <Customizer />
          </>
        )}
      </main>
    </>
  )
}

export default App

