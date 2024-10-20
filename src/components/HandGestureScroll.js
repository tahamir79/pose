import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

const HandGestureScroll = ({ children }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [model, setModel] = useState(null);
  const [fingerPosition, setFingerPosition] = useState({ x: 0, y: 0 });
  const scrollVelocity = useRef(0);
  const [cameraDimensions, setCameraDimensions] = useState({ width: 1, height: 1 });
  const smoothScrollVelocity = useRef(0);

  const loadModel = useCallback(async () => {
    await tf.ready();
    const loadedModel = await handpose.load();
    setModel(loadedModel);
  }, []);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  const calculateAngle = (p1, p2) => {
    return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
  };

  useEffect(() => {
    if (!model) return;

    const container = containerRef.current;
    const video = videoRef.current;

    const runHandpose = async () => {
      if (video.readyState === 4) {
        const predictions = await model.estimateHands(video);

        if (predictions.length > 0) {
          const hand = predictions[0];
          const indexFingerBase = hand.annotations.indexFinger[0];
          const indexFingerTip = hand.annotations.indexFinger[3];

          // Calculate angle
          let angle = calculateAngle(indexFingerBase, indexFingerTip);
          
          // Normalize angle to be between -90 and 90
          if (angle > 90) angle = angle - 180;
          if (angle < -90) angle = angle + 180;

          // Map camera coordinates to screen coordinates for visual feedback
          const [x, y] = indexFingerTip;
          const screenX = (x / cameraDimensions.width) * window.innerWidth;
          const screenY = (y / cameraDimensions.height) * window.innerHeight;
          setFingerPosition({ x: screenX, y: screenY });

          // Calculate scroll velocity based on angle
          // Angle of 0 means finger is horizontal, no scrolling
          // Max speed at 90 degrees (pointing straight up or down)
          const maxSpeed = 10; // Adjust this value to change overall sensitivity
          scrollVelocity.current = (angle / 90) * maxSpeed;
        } else {
          // Gradually reduce scroll velocity when hand is not detected
          scrollVelocity.current *= 0.9;
        }

        // Smooth out the scroll velocity
        smoothScrollVelocity.current += (scrollVelocity.current - smoothScrollVelocity.current) * 0.1;

        // Apply scrolling with a dead zone
        if (Math.abs(smoothScrollVelocity.current) > 0.5) {
          container.scrollTop += smoothScrollVelocity.current;
        }
      }

      requestAnimationFrame(runHandpose);
    };

    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          setCameraDimensions({ width: video.videoWidth, height: video.videoHeight });
          resolve();
        };
      });
    };

    let handposeInterval;
    setupCamera().then(() => {
      handposeInterval = requestAnimationFrame(runHandpose);
    });

    return () => {
      if (handposeInterval) {
        cancelAnimationFrame(handposeInterval);
      }
      if (video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [model]);

  return (
    <div ref={containerRef} className="gesture-scroll-container">
      <video
        ref={videoRef}
        style={{ display: 'none' }}
      />
      <div className="finger-position" style={{ 
        position: 'fixed', 
        left: fingerPosition.x, 
        top: fingerPosition.y, 
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        backgroundColor: 'red', 
        zIndex: 1001,
        pointerEvents: 'none',
        transition: 'all 0.1s ease-out'
      }} />
      {children}
    </div>
  );
};

export default HandGestureScroll;
