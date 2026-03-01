import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { 
  X, Check, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, 
  Maximize2, Grid3X3, Smartphone, FileText, Square, 
  Eye, RefreshCw, ZoomIn, ZoomOut 
} from 'lucide-react';
import { getCroppedImg } from '../utils/cropUtils';

const EnhancedCropModal = ({ isOpen, image, onCropComplete: onSave, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [aspect, setAspect] = useState(null); // default freeform
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const ASPECT_RATIOS = [
    { id: 'free', label: 'Free', icon: <Maximize2 className="w-4 h-4" />, value: null },
    { id: 'a4', label: 'A4', icon: <FileText className="w-4 h-4" />, value: 1 / 1.414 },
    { id: 'letter', label: 'Letter', icon: < Smartphone className="w-4 h-4" />, value: 8.5 / 11 },
    { id: 'square', label: 'Square', icon: <Square className="w-4 h-4" />, value: 1 },
  ];

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation, flip);
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setAspect(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-50">
          <div className="flex items-center gap-4">
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors sm:hidden"
            >
                <X className="w-6 h-6 text-slate-500" />
            </motion.button>
            <div>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                Image Processor
                </h3>
                <p className="hidden sm:block text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Adjust boundaries & alignment</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseDown={() => setShowCompare(true)}
                onMouseUp={() => setShowCompare(false)}
                onTouchStart={() => setShowCompare(true)}
                onTouchEnd={() => setShowCompare(false)}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${showCompare ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
            >
                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Compare</span>
            </motion.button>
            <motion.button 
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="hidden sm:flex p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
            >
                <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          {showCompare ? (
            <div className="w-full h-full flex items-center justify-center p-4">
                <img src={image} alt="Original" className="max-w-full max-h-full object-contain" />
                <div className="absolute top-4 left-4 bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Original View</div>
            </div>
          ) : (
            <div className="w-full h-full">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteCallback}
                    onZoomChange={setZoom}
                    showGrid={true}
                    style={{
                        containerStyle: { backgroundColor: '#020617' },
                        cropAreaStyle: { border: '2px solid #3b82f6', color: '#3b82f6' }
                    }}
                />
            </div>
          )}
          
          {/* Floating Aspect Selection */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-white/10 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl gap-1 shadow-2xl z-40">
            {ASPECT_RATIOS.map((r) => (
                <motion.button
                    key={r.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAspect(r.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${aspect === r.value ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                    {r.icon}
                    <span className="hidden sm:inline">{r.label}</span>
                </motion.button>
            ))}
          </div>
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 sm:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-2xl z-50">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Zoom Control */}
                <div>
                   <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Scale & Precision</label>
                        <span className="text-xs font-bold text-blue-600">{(zoom * 100).toFixed(0)}%</span>
                   </div>
                   <div className="flex items-center gap-4">
                        <ZoomOut className="w-4 h-4 text-slate-400" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.01}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <ZoomIn className="w-4 h-4 text-slate-400" />
                   </div>
                </div>

                {/* Transform Tools */}
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 block">Transform Tools</label>
                    <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setRotation(r => (r - 90) % 360)} className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-xs"><RotateCcw className="w-4 h-4" /> 90°</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setRotation(r => (r + 90) % 360)} className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-xs"><RotateCw className="w-4 h-4" /> 90°</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFlip(f => ({...f, horizontal: !f.horizontal}))} className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-xs"><FlipHorizontal className="w-4 h-4" /> Flip</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFlip(f => ({...f, vertical: !f.vertical}))} className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 font-bold text-xs"><FlipVertical className="w-4 h-4" /> Flip</motion.button>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#fef2f2' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-sm rounded-2xl transition-all hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                    <RefreshCw className="w-4 h-4" /> Reset
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 uppercase tracking-widest"
                >
                    {isProcessing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white"></div>
                    ) : (
                        <><Check className="w-5 h-5" /> Apply changes</>
                    )}
                </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCropModal;
