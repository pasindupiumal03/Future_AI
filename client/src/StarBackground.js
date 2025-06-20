import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const StarBackground = () => {
  const particlesInit = async (engine) => {
    try {
      await loadFull(engine);
    } catch (error) {
      console.error('Error initializing particles:', error);
    }
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: 'transparent' },
        particles: {
          number: { value: 300, density: { enable: true, value_area: 800 } },
          color: { value: '#fff' },
          shape: { type: 'circle' },
          opacity: { value: 0.7, random: true },
          size: { value: 1.5, random: true },
          move: {
            enable: true,
            speed: 1.5,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: false, mode: 'bubble' },
            onClick: { enable: false },
          },
          modes: {
            bubble: {
              distance: 120,
              size: 6,
              duration: 2,
              opacity: 1,
              color: '#fff',
            },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    />
  );
};

export default StarBackground; 