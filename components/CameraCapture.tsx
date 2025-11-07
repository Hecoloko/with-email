import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setError("Camera access was denied. Please enable camera permissions in your browser settings.");
      }
    };
    
    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };
  
  const handleConfirm = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `resume-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const renderContent = () => {
    if (error) {
      return <div className="text-center text-red-400 p-8">{error}</div>;
    }

    return (
      <div className="relative w-full h-full flex flex-col bg-black">
        <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`} />
        <canvas ref={canvasRef} className="hidden" />
        {capturedImage && (
            <img src={capturedImage} alt="Captured resume" className="w-full h-full object-contain" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center">
          {capturedImage ? (
             <div className="flex items-center gap-8">
                <button onClick={handleRetake} className="flex flex-col items-center gap-1 text-white font-medium">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"><RefreshCwIcon className="h-7 w-7" /></div>
                    Retake
                </button>
                 <button onClick={handleConfirm} className="flex flex-col items-center gap-1 text-white font-medium">
                    <div className="w-16 h-16 rounded-full bg-accent-purple flex items-center justify-center text-white"><CheckIcon className="h-8 w-8" /></div>
                    Confirm
                </button>
            </div>
          ) : (
            <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white flex items-center justify-center" aria-label="Capture Photo">
              <div className="w-16 h-16 rounded-full border-4 border-black"></div>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="w-full h-full bg-black relative" onClick={e => e.stopPropagation()}>
        <header className="absolute top-0 left-0 right-0 p-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10">
            <h2 className="text-lg font-bold text-white">Capture Resume</h2>
            <button onClick={onClose} className="text-white bg-white/10 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-2xl leading-none">&times;</button>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};
