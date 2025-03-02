import { useEffect, useRef, useState } from "react";
import * as handTrack from "handtrackjs";
import { gsap } from "gsap";
import testImage from "./assets/image.jpg";

const GestureControlApp = () => {
  const videoRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  let model = null;
  let prevCenterX = null;

  useEffect(() => {
    const loadModel = async () => {
      model = await handTrack.load();
      startVideo();
    };

    const startVideo = () => {
      handTrack.startVideo(videoRef.current).then((status) => {
        if (status) {
          requestAnimationFrame(runDetection);
        }
      });
    };

    const runDetection = async () => {
      if (model && videoRef.current) {
        const predictions = await model.detect(videoRef.current);
        if (predictions.length > 0) {
          handleGesture(predictions);
        }
        requestAnimationFrame(runDetection);
      }
    };

    loadModel();
  }, []);

  const handleGesture = (predictions) => {
    const hand = predictions.find((p) => p.label === "open" || p.label === "closed");
    if (hand) {
      const centerX = hand.bbox[0] + hand.bbox[2] / 2;
      if (prevCenterX !== null) {
        const movement = prevCenterX - centerX; // Reverse direction
        if (Math.abs(movement) > 20) {
          const newRotation = movement > 0 ? rotation + 45 : rotation - 45;
          setRotation(newRotation);
          gsap.to("#rotatable-image", { rotation: newRotation, duration: 0.5, ease: "power2.out" });
        }
      }
      prevCenterX = centerX;
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-200 p-4">
      {/* Left Column (Image) */}
      <div className="w-1/2 flex justify-center items-center">
        <img
          id="rotatable-image"
          src={testImage}
          alt="Rotatable"
          className="w-64 h-64"
        />
      </div>
      
      {/* Right Column (Webcam) */}
      <div className="w-1/2 flex flex-col items-center">
        <video ref={videoRef} className="w-96 h-64 border transform -scale-x-100" autoPlay></video>
      </div>
    </div>
  );
};

export default GestureControlApp;
