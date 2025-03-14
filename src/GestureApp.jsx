import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { gsap } from "gsap";
import testImage from "./assets/image.png";

const GestureControlApp = () => {
  const videoRef = useRef(null);
  const rotationRef = useRef(0); // Stores persistent rotation value
  const [rotation, setRotation] = useState(0);
  let prevPalmAngle = null; // Stores previous palm tilt angle

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(handleGesture);

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  const calculatePalmTilt = (landmarks) => {
    const wrist = landmarks[0]; // Wrist landmark
    const pinkyBase = landmarks[17]; // Pinky base

    // Calculate tilt angle using wrist and pinky position
    const deltaX = pinkyBase.x - wrist.x;
    const deltaY = pinkyBase.y - wrist.y;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    return angle;
  };

  const handleGesture = (results) => {
    if (!results.multiHandLandmarks.length) return;

    const landmarks = results.multiHandLandmarks[0];
    const palmAngle = calculatePalmTilt(landmarks);

    if (prevPalmAngle !== null) {
      const angleDifference = palmAngle - prevPalmAngle;

      if (Math.abs(angleDifference) > 5) { // Rotate only for significant tilt
        const newRotation = rotationRef.current + (angleDifference > 0 ? -45 : 45);
        rotationRef.current = newRotation;
        setRotation(newRotation);

        gsap.to("#rotatable-image", {
          rotation: newRotation,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }
    prevPalmAngle = palmAngle; // Store last palm tilt angle
  };

  return (
    <div className="flex w-sreen h-screen bg-[#1f1f1f] p-[40px] flex-col items-center gap-[40px]">
      <div className="flex flex-col items-center" >
        <h1>React.JS + Media Pipe Package</h1>
        <p>Fun Project : Hand Gesture Detection</p>
        <p>GitHub:  <a href="https://github.com/proshaban">@proshaban</a></p>
      </div>
      <div className="w-full h-full flex md:flex-row items-center gap-[40px]">
        {/* Left Column (Image) */}
        <div className="w-1/2 flex justify-center items-center" >
          <img
            id="rotatable-image"
            src={testImage}
            alt="Rotatable"
            className="w-[400px] h-[400px] bg-[#1f1f1f]"
          />
        </div>

        {/* Right Column (Webcam) */}
        <div className="w-1/2 flex flex-col justify-center items-center">
          <video
            ref={videoRef}
            className="w-full max-w-[400px] h-auto aspect-video border border-gray-700 scale-x-[-1]"
            autoPlay
          />
        </div>
      </div>
    </div>
  );
};

export default GestureControlApp;
