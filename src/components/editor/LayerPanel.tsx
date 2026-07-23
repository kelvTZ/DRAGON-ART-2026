import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Layers as LayersIcon, 
  ChevronUp, 
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Zap,
  Edit2,
  Check,
  X,
  Paintbrush,
  Image,
  GripVertical
} from 'lucide-react';
import { MiniLayerCanvas } from '../MiniLayerCanvas';
import { sound } from '../../sound';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  opacity?: number;
  data: string[];
}

interface LayerPanelProps {
  layers: Layer[];
  currentLayer: number;
  setCurrentLayer: (idx: number) => void;
  addLayer: () => void;
  deleteLayer: (idx: number) => void;
  toggleLayerVisibility: (idx: number) => void;
  toggleLayerLock: (idx: number) => void;
  reorderLayers: (newLayers: Layer[]) => void;
  renameLayer: (idx: number, newName: string) => void;
  duplicateLayer: (idx: number) => void;
  updateLayerOpacity: (idx: number, opacity: number) => void;
  moveLayer: (idx: number, direction: 'up' | 'down') => void;
  moveToLimit: (idx: number, limit: 'top' | 'bottom') => void;
  triggerLayerFlash: (layerId: string) => void;
  width: number;
  height: number;
  transparentBackground?: boolean;
  setTransparentBackground?: (val: boolean) => void;
  canvasBackgroundColor?: string;
  setCanvasBackgroundColor?: (color: string) => void;
  isPro?: boolean;
  setIsPreviewMode: (val: boolean) => void;
  setPreviousCanvasColor: (val: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = React.memo(({
  layers,
  setIsPreviewMode,
  setPreviousCanvasColor,
  currentLayer,
  setCurrentLayer,
  addLayer,
  deleteLayer,
  toggleLayerVisibility,
  toggleLayerLock,
  reorderLayers,
  renameLayer,
  duplicateLayer,
  updateLayerOpacity,
  moveLayer,
  moveToLimit,
  triggerLayerFlash,
  width,
  height,
  transparentBackground = false,
  setTransparentBackground,
  canvasBackgroundColor = '#ffffff',
  setCanvasBackgroundColor,
  isPro = false
}) => {
  const displayLayers = [...layers].reverse();
  const bgPresetColors = [
    '#ffffff', '#f5f5f5', '#e0e0e0', '#1a1a2e', '#0d1117', '#000000',
    '#fdf6e3', '#f0e6d3', '#d4edda', '#cce5ff', '#f8d7da', '#fff3cd'
  ];

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Background Settings Section */}
      {setTransparentBackground && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 p-4 rounded-3xl border-2 border-white/5 bg-white/5"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Image size={18} className="text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase tracking-tighter">Fundo do Projeto</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                {transparentBackground ? 'PNG · Transparente' : 'JPG · Cor sólida'}
              </span>
            </div>
          </div>

          {/* Transparent Toggle */}
          <button
            onClick={() => { sound.playClick(); setTransparentBackground(!transparentBackground); }}
            className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:scale-[0.98] ${
              transparentBackground
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.1)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl border-2 overflow-hidden shrink-0 ${
                transparentBackground ? 'border-emerald-500/40' : 'border-white/20'
              }`}>
                {transparentBackground ? (
                  <div className="w-full h-full" style={{
                    backgroundImage: 'conic-gradient(#666 90deg, #999 90deg 180deg, #666 180deg 270deg, #999 270deg)',
                    backgroundSize: '8px 8px'
                  }} />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: canvasBackgroundColor }} />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-black uppercase tracking-tight">
                  {transparentBackground ? 'Fundo Transparente' : 'Fundo Sólido'}
                </span>
                <span className="text-[9px] opacity-60 font-bold">
                  {transparentBackground ? 'Salva como PNG' : 'Salva como JPG'}
                </span>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-all ${
              transparentBackground ? 'bg-emerald-500' : 'bg-white/10'
            }`}>
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-lg"
                animate={{ x: transparentBackground ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>

          {/* Background Color Picker (only when NOT transparent) */}
          {!transparentBackground && setCanvasBackgroundColor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <Paintbrush size={12} className="text-white/40" />
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Cor do Fundo</span>
              </div>

              {/* Color Presets Grid */}
              <div className="grid grid-cols-6 gap-2">
                {bgPresetColors.map((color, idx) => {
                  const isColorPro = idx >= 5;
                  const isLocked = isColorPro && !isPro;
                  
                  return (
                    <button
                      key={color}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        sound.playClick(); 
                        if (isLocked) {
                          setPreviousCanvasColor(canvasBackgroundColor);
                          setCanvasBackgroundColor(color);
                          setIsPreviewMode(true);
                        } else {
                          setCanvasBackgroundColor(color);
                        }
                      }}
                      className={`w-full aspect-square rounded-xl border-2 transition-all active:scale-90 hover:scale-105 relative ${
                        canvasBackgroundColor === color
                          ? 'border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20 scale-110'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          <Lock size={12} className="text-yellow-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="relative">
                  <input
                    type="color"
                    value={canvasBackgroundColor}
                    onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white/20"
                    style={{ padding: 0 }}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Cor Personalizada</span>
                  <span className="text-sm font-black text-white uppercase tracking-wider">{canvasBackgroundColor}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--accent-color)]/10 rounded-xl">
            <LayersIcon size={20} className="text-[var(--accent-color)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white uppercase tracking-tighter">Camadas</span>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{layers.length} no total</span>
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); addLayer(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white rounded-xl shadow-lg shadow-[var(--accent-color)]/20 transition-all active:scale-95 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs font-black uppercase tracking-tight">Nova</span>
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
        <Reorder.Group 
          axis="y" 
          values={displayLayers} 
          onReorder={(newOrderedDisplay) => {
            const reversed = [...newOrderedDisplay].reverse();
            reorderLayers(reversed);
          }}
          className="flex flex-col gap-3"
        >
          <AnimatePresence initial={false}>
            {displayLayers.map((layer) => {
              const actualIdx = layers.findIndex(l => l.id === layer.id);
              if (actualIdx === -1) return null;

              return (
                <Reorder.Item
                  key={layer.id}
                  value={layer}
                  className="list-none"
                >
                  <LayerItem 
                    layer={layer}
                    idx={actualIdx}
                    active={currentLayer === actualIdx}
                    onClick={() => { 
                      sound.playClick(); 
                      setCurrentLayer(actualIdx); 
                      triggerLayerFlash(layer.id);
                    }}
                    onToggleVisibility={() => { sound.playClick(); toggleLayerVisibility(actualIdx); }}
                    onToggleLock={() => { sound.playClick(); toggleLayerLock(actualIdx); }}
                    onDelete={() => { sound.playClick(); deleteLayer(actualIdx); }}
                    onRename={(newName) => renameLayer(actualIdx, newName)}
                    onDuplicate={() => { sound.playClick(); duplicateLayer(actualIdx); }}
                    onOpacityChange={(opacity) => updateLayerOpacity(actualIdx, opacity)}
                    onMove={(dir) => moveLayer(actualIdx, dir)}
                    onMoveLimit={(limit) => moveToLimit(actualIdx, limit)}
                    onFlash={() => { sound.playClick(); triggerLayerFlash(layer.id); }}
                    width={width}
                    height={height}
                    layersLength={layers.length}
                    isTop={actualIdx === layers.length - 1}
                    isBottom={actualIdx === 0}
                  />
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
});

interface LayerItemProps {
  layer: Layer;
  idx: number;
  active: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onDuplicate: () => void;
  onOpacityChange: (opacity: number) => void;
  onMove: (dir: 'up' | 'down') => void;
  onMoveLimit: (limit: 'top' | 'bottom') => void;
  onFlash: () => void;
  width: number;
  height: number;
  layersLength: number;
  isTop: boolean;
  isBottom: boolean;
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  idx,
  active,
  onClick,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onRename,
  onDuplicate,
  onOpacityChange,
  onMove,
  onMoveLimit,
  onFlash,
  width,
  height,
  layersLength,
  isTop,
  isBottom
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(layer.name || `Camada ${idx + 1}`);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (tempName.trim()) {
      onRename(tempName.trim());
    } else {
      setTempName(layer.name || `Camada ${idx + 1}`);
    }
    setIsRenaming(false);
    sound.playClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setTempName(layer.name || `Camada ${idx + 1}`);
      setIsRenaming(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
      className={`relative group flex flex-col p-3 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
        active 
          ? 'bg-[var(--bg-panel)] border-[var(--accent-color)] shadow-xl shadow-[var(--accent-color)]/5' 
          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
      }`}
      onClick={onClick}
    >
      {/* Background Glow Effect */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/[0.03] to-transparent pointer-events-none" />
      )}

      {/* Main Row */}
      <div className="flex items-center gap-3 relative z-10 w-full">
        {/* Grip Handle for Reorder */}
        <div 
          className="text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing p-1 -ml-1 transition-colors"
          title="Arrastar para reordenar"
        >
          <GripVertical size={16} />
        </div>

        {/* Thumbnail Mini Preview */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-inner flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'conic-gradient(#333 90deg, #444 90deg 180deg, #333 180deg 270deg, #444 270deg)', backgroundSize: '6px 6px' }} />
            <MiniLayerCanvas 
              layerData={layer.data} 
              width={width} 
              height={height} 
              className="w-full h-full object-contain relative z-10" 
            />
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onFlash(); }}
            className="absolute -top-1.5 -right-1.5 p-1 bg-[var(--accent-color)] text-white rounded-md shadow-md hover:scale-105"
            title="Destacar camada"
          >
            <Zap size={10} fill="currentColor" />
          </button>
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/10 border border-[var(--accent-color)] rounded-lg px-2 py-0.5 text-xs font-bold text-white outline-none"
              />
              <button onClick={handleRenameSubmit} className="p-1 bg-green-500/20 text-green-400 rounded-md">
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5"
              onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
            >
              <span className="text-xs font-black uppercase tracking-tight truncate text-white">
                {layer.name || `Camada ${idx + 1}`}
              </span>
              <Edit2 size={10} className="text-white/20 hover:text-[var(--accent-color)] transition-colors shrink-0" />
            </div>
          )}
          
          {/* Quick Visibility & Lock Status Indicator */}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[9px] font-black uppercase tracking-wider ${layer.locked ? 'text-orange-400' : 'text-white/30'}`}>
              {layer.locked ? 'Bloqueada' : 'Livre'}
            </span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[9px] text-white/30 font-black uppercase tracking-wider">
              {Math.round((layer.opacity ?? 1) * 100)}% opac.
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Action Controls (Exibida separada para evitar achatamento na horizontal) */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 relative z-10 w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          {/* Visibilidade */}
          <button 
            onClick={onToggleVisibility}
            className={`p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center ${
              !layer.visible 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
            }`}
            title={layer.visible ? 'Ocultar camada' : 'Mostrar camada'}
          >
            {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Bloqueio */}
          <button 
            onClick={onToggleLock}
            className={`p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center ${
              layer.locked 
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
            }`}
            title={layer.locked ? 'Desbloquear camada' : 'Bloquear camada'}
          >
            {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Mover para Cima */}
          <button 
            disabled={isTop}
            onClick={() => onMove('up')}
            className={`p-2 rounded-xl transition-all active:scale-90 bg-white/5 hover:bg-white/10 text-white/60 disabled:opacity-20 disabled:cursor-not-allowed`}
            title="Subir camada"
          >
            <ChevronUp size={14} />
          </button>

          {/* Mover para Baixo */}
          <button 
            disabled={isBottom}
            onClick={() => onMove('down')}
            className={`p-2 rounded-xl transition-all active:scale-90 bg-white/5 hover:bg-white/10 text-white/60 disabled:opacity-20 disabled:cursor-not-allowed`}
            title="Descer camada"
          >
            <ChevronDown size={14} />
          </button>

          {/* Duplicar */}
          <button 
            onClick={onDuplicate}
            className="p-2 rounded-xl bg-white/5 hover:bg-[var(--accent-color)]/20 hover:text-[var(--accent-color)] text-white/60 transition-all active:scale-90"
            title="Duplicar camada"
          >
            <Copy size={14} />
          </button>

          {/* Excluir */}
          {layersLength > 1 && (
            <button 
              onClick={onDelete}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-all active:scale-90"
              title="Excluir camada"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Opacidade Slider (Só aparece quando selecionada) */}
      {active && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-1.5 pt-2 border-t border-white/5 relative z-10 w-full" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[9px] font-black text-white/40 uppercase tracking-widest">
            <span>Opacidade</span>
            <span className="text-[var(--accent-color)]">{Math.round((layer.opacity ?? 1) * 100)}%</span>
          </div>
          <div className="relative h-6 flex items-center">
            <div className="absolute inset-0 h-1.5 bg-white/5 rounded-full my-auto" />
            <div 
              className="absolute inset-y-0 left-0 h-1.5 bg-[var(--accent-color)] rounded-full my-auto" 
              style={{ width: `${(layer.opacity ?? 1) * 100}%` }} 
            />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.opacity ?? 1}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

