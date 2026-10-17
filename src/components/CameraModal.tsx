import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, mimeType: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    async function initCamera() {
      setError(null);
      if (typeof navigator === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        setError('目前瀏覽器或環境未開放相機權限，請直接上傳照片或使用預設庫存。');
        return;
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((e) => console.warn('Video play blocked:', e));
        }
      } catch (err: any) {
        console.warn('Failed to get camera with facingMode:', err);
        // Fallback to any video device
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          activeStream = fallbackStream;
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch((e) => console.warn('Video play blocked:', e));
          }
        } catch (fallbackErr: any) {
          setError('無法取得相機權限，請確認瀏覽器相機設定，或直接上傳照片。');
        }
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      onCapture(base64, 'image/jpeg');
      onClose();
    }
  };

  const toggleFacingMode = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#ede6db] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#fdfbf7] border-b border-[#ede6db]">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <Camera className="w-4 h-4 text-amber-600" />
            <span>即時拍攝冰箱食材</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-xl hover:bg-[#f2ede4] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-video bg-stone-900 flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-rose-300 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-rose-400" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Guide Overlay */}
          {!error && (
            <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-amber-300/60 rounded-2xl flex items-center justify-center">
              <span className="bg-stone-900/75 text-amber-100 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-xs font-semibold">
                請將冰箱食材對準框內，光線充足辨識更精準
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-[#fdfbf7] border-t border-[#ede6db] flex items-center justify-between">
          <button
            type="button"
            onClick={toggleFacingMode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-white hover:bg-[#faf7f2] text-stone-700 border border-[#e5ddcf] shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>翻轉鏡頭</span>
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!!error}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-md shadow-orange-300/40 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>拍照盤點</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
