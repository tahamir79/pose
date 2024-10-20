import React from 'react';

const NaturePage = () => {
  return (
    <div className="nature-page">
      <h2>Explore Nature</h2>
      <p>This is where you would add your nature-related content.</p>
      <p>Use hand gestures to scroll through images, text, and more!</p>
      {/* Add more content here */}
      <div style={{ height: '1000px', background: 'linear-gradient(to bottom, #87CEEB, #228B22)' }}>
        {/* This div is just to create scrollable content */}
        <p style={{ paddingTop: '500px', color: 'white' }}>Scroll down to see more!</p>
      </div>
    </div>
  );
};

export default NaturePage;
