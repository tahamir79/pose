import React from 'react';
import HandGestureScroll from './components/HandGestureScroll';
import './App.css';

function App() {
  return (
    <div className="App">
      <HandGestureScroll>
        <div className="content">
          <h1>Gesture Scrolling Demo</h1>
          <p>Move your index finger up and down to scroll.</p>
          {/* Add more content here to make the page scrollable */}
          {[...Array(20)].map((_, i) => (
            <p key={i}>This is paragraph {i + 1}.</p>
          ))}
        </div>
      </HandGestureScroll>
    </div>
  );
}

export default App;
