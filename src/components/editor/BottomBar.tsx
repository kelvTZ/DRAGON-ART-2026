import React from 'react';
import { Pencil, Eraser, PaintBucket, Palette, Pipette, Video, Folder, Minus, Square, Circle, Hand, Type, Trash2, Droplet, Wind, Cloud, Sun, Moon, Wand2, Zap, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolButton } from './ToolButton';
import { sound } from '../../sound';

interface BottomBarProps {
  shortcuts: Record<string, string>;
  currentTool: string;
  selectTool: (tool: any) => void;
  activePanel: string | null;
  togglePanel: (panel: string) => void;
  closePanelsExceptFrames: () => void;
  handleToolPointerDown: (tool: any) => void;
  handleToolPointerUp: () => void;
  currentColor: string;
  currentShape: 'line' | 'rect' | 'circle';
  selectType: 'rect' | 'magic-wand' | 'lasso';
  clearCurrentLayer: () => void;
  isTrashLongPress: React.MutableRefObject<boolean>;
  trashLongPressTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  setShowDeletedHistory: (show: boolean) => void;
  uiVisible: boolean;
  isToolLongPress: React.MutableRefObject<boolean>;
  uiScale: number;
  brushSize: number;
  setBrushSize: (size: number | ((prev: number) => number)) => void;
  lightingEffect: 'none' | 'lighten' | 'darken';
  selectEffect: (effect: 'none' | 'lighten' | 'darken') => void;
  lightingIntensity: number;
  selectIntensity: (val: number) => void;
  showLightingMenu: boolean;
  setShowLightingMenu: (val: boolean) => void;
  lightingLongPress: React.MutableRefObject<NodeJS.Timeout | null>;
  toggleBatchActions: () => void;
  isRecording: boolean;
  onToggleTimelapse: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = React.memo(({
  shortcuts,
  currentTool,
  selectTool,
  activePanel,
  togglePanel,
  closePanelsExceptFrames,
  handleToolPointerDown,
  handleToolPointerUp,
  currentColor,
  currentShape,
  selectType,
  clearCurrentLayer,
  isTrashLongPress,
  trashLongPressTimer,
  setShowDeletedHistory,
  uiVisible,
  isToolLongPress,
  uiScale,
  brushSize,
  setBrushSize,
  lightingEffect,
  selectEffect,
  lightingIntensity,
  selectIntensity,
  showLightingMenu,
  setShowLightingMenu,
  lightingLongPress,
  toggleBatchActions,
  isRecording,
  onToggleTimelapse,
}) => {
  const [draggingTool, setDraggingTool] = React.useState<string | null>(null);
  const [showEffectsGroup, setShowEffectsGroup] = React.useState(false);
  const [showShapesGroup, setShowShapesGroup] = React.useState(false);
  const [showMoreGroup, setShowMoreGroup] = React.useState(false);

  return (
    <div className={`bottom-bar fixed bottom-3 left-1/2 -translate-x-1/2 landscape:left-auto landscape:right-3 landscape:top-1/2 landscape:-translate-y-1/2 landscape:translate-x-0 landscape:h-auto landscape:w-auto bg-[var(--bg-panel)]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl flex items-center justify-center px-2 py-1 z-50 max-w-[98vw] overflow-x-auto hide-scrollbar scroll-smooth transition-all duration-300 ${!uiVisible ? 'opacity-20 pointer-events-none' : ''}`}>
      <div className="flex items-center landscape:flex-col gap-1 sm:gap-1.5 relative">

        {/* 1. Lápis */}
        <ToolButton 
          id="pencil" 
          shortcutKey={shortcuts.pencil}
          icon={<Pencil size={20} />} 
          label="Lápis" 
          tooltip="Desenhe pixel a pixel."
          active={currentTool === 'pencil'} 
          onClick={() => { 
            if (currentTool === 'pencil') togglePanel('pencil'); 
            else { selectTool('pencil'); closePanelsExceptFrames(); } 
          }} 
        />

        {/* 2. Borracha */}
        <ToolButton 
          id="eraser" 
          shortcutKey={shortcuts.eraser}
          icon={<Eraser size={20} />} 
          label="Borracha" 
          tooltip="Apague pixels da camada atual."
          active={currentTool === 'eraser'} 
          onClick={() => { 
            if (currentTool === 'eraser') togglePanel('pencil'); 
            else { selectTool('eraser'); closePanelsExceptFrames(); } 
          }} 
        />

        {/* 3. Balde */}
        <ToolButton 
          id="fill" 
          shortcutKey={shortcuts.fill} 
          icon={<PaintBucket size={20} />} 
          label="Balde" 
          tooltip="Preenche áreas inteiras com a cor."
          active={currentTool === 'fill' || currentTool === 'erase-fill'} 
          onClick={() => { if (currentTool === 'fill' || currentTool === 'erase-fill') togglePanel('fill'); else { selectTool('fill'); closePanelsExceptFrames(); } }} 
        />

        {/* 4. Cores */}
        <ToolButton 
          id="colors" 
          icon={<Palette size={22} />} 
          label="Cores" 
          tooltip="Abra a roda de cores e paletas."
          active={activePanel === 'colors'} 
          onClick={() => togglePanel('colors')} 
          color={currentColor} 
        />

        {/* 5. Conta-gotas */}
        <ToolButton 
          id="pipette" 
          shortcutKey={shortcuts.picker} 
          icon={<Pipette size={20} />} 
          label="Pipeta" 
          tooltip="Capture qualquer cor da arte."
          active={currentTool === 'picker'} 
          onClick={() => { selectTool('picker'); closePanelsExceptFrames(); }} 
        />

        {/* 6. Grupo de Formas & Seleção */}
        <div className="relative">
          <ToolButton 
            id="shapes-group" 
            icon={currentTool === 'select' ? <Square size={20} /> : currentShape === 'rect' ? <Square size={20} /> : currentShape === 'circle' ? <Circle size={20} /> : <Minus size={20} />} 
            label="Formas" 
            tooltip="Formas geométricas e Seleção."
            active={['shape', 'select'].includes(currentTool)} 
            onClick={() => {
              sound.playClick();
              setShowShapesGroup(!showShapesGroup);
              setShowEffectsGroup(false);
              setShowMoreGroup(false);
            }} 
          />

          <AnimatePresence>
            {showShapesGroup && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -70, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                className="absolute left-1/2 -translate-x-1/2 flex flex-row gap-2 p-2 bg-[var(--bg-panel)]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <ToolButton 
                  id="shape" 
                  shortcutKey={shortcuts.shape} 
                  icon={currentShape === 'line' ? <Minus size={20} /> : currentShape === 'rect' ? <Square size={20} /> : <Circle size={20} />} 
                  label="Formas" 
                  tooltip="Desenhe retas, círculos ou retângulos."
                  active={currentTool === 'shape'} 
                  onClick={() => { 
                    if (currentTool === 'shape') togglePanel('shape'); else { selectTool('shape'); closePanelsExceptFrames(); } 
                    setShowShapesGroup(false);
                  }} 
                />
                <ToolButton 
                  id="select" 
                  shortcutKey={shortcuts.select}
                  icon={selectType === 'rect' ? <Square size={20} /> : <Circle size={20} />} 
                  label="Seleção" 
                  tooltip="Selecione e mova partes da área de desenho."
                  active={currentTool === 'select'} 
                  onClick={() => { 
                    if (currentTool === 'select') togglePanel('select'); else { selectTool('select'); closePanelsExceptFrames(); } 
                    setShowShapesGroup(false);
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 7. Grupo de Efeitos & Luz */}
        <div className="relative">
          <ToolButton 
            id="effects-group" 
            icon={lightingEffect === 'lighten' ? <Sun size={20} /> : lightingEffect === 'darken' ? <Moon size={20} /> : <Droplet size={20} />} 
            label="Efeitos" 
            tooltip="Efeitos de suavização, luz e sombra."
            active={['blur', 'smudge', 'airbrush'].includes(currentTool) || lightingEffect !== 'none'} 
            onClick={() => {
              sound.playClick();
              setShowEffectsGroup(!showEffectsGroup);
              setShowShapesGroup(false);
              setShowMoreGroup(false);
            }} 
          />

          <AnimatePresence>
            {showEffectsGroup && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -70, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                className="absolute left-1/2 -translate-x-1/2 flex flex-row gap-2 p-2 bg-[var(--bg-panel)]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <ToolButton 
                  id="blur" 
                  icon={<Droplet size={20} />} 
                  label="Borrão" 
                  tooltip="Suavize as cores."
                  active={currentTool === 'blur'} 
                  onClick={() => { selectTool('blur'); setShowEffectsGroup(false); closePanelsExceptFrames(); }} 
                />
                <ToolButton 
                  id="smudge" 
                  icon={<Wind size={20} />} 
                  label="Mesclar" 
                  tooltip="Misture as cores."
                  active={currentTool === 'smudge'} 
                  onClick={() => { selectTool('smudge'); setShowEffectsGroup(false); closePanelsExceptFrames(); }} 
                />
                <ToolButton 
                  id="airbrush" 
                  icon={<Cloud size={20} />} 
                  label="Spray" 
                  tooltip="Pinte com spray."
                  active={currentTool === 'airbrush'} 
                  onClick={() => { selectTool('airbrush'); setShowEffectsGroup(false); closePanelsExceptFrames(); }} 
                />
                <ToolButton 
                  id="sun" 
                  icon={<Sun size={20} />} 
                  label="Luz" 
                  tooltip="Efeito de claridade."
                  active={lightingEffect === 'lighten'} 
                  onClick={() => { sound.playClick(); selectEffect(lightingEffect === 'lighten' ? 'none' : 'lighten'); setShowEffectsGroup(false); }}
                />
                <ToolButton 
                  id="moon" 
                  icon={<Moon size={20} />} 
                  label="Sombra" 
                  tooltip="Efeito de escuridão."
                  active={lightingEffect === 'darken'} 
                  onClick={() => { sound.playClick(); selectEffect(lightingEffect === 'darken' ? 'none' : 'darken'); setShowEffectsGroup(false); }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 8. Grupo Mais Ferramentas (Texto, Timelapse) */}
        <div className="relative">
          <ToolButton 
            id="more-group" 
            icon={<Type size={20} />} 
            label="Mais" 
            tooltip="Texto e Gravação Timelapse."
            active={currentTool === 'text' || activePanel === 'timelapse'} 
            onClick={() => {
              sound.playClick();
              setShowMoreGroup(!showMoreGroup);
              setShowShapesGroup(false);
              setShowEffectsGroup(false);
            }} 
          />

          <AnimatePresence>
            {showMoreGroup && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -70, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                className="absolute left-1/2 -translate-x-1/2 flex flex-row gap-2 p-2 bg-[var(--bg-panel)]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <ToolButton 
                  id="text" 
                  shortcutKey={shortcuts.text} 
                  icon={<Type size={20} />} 
                  label="Texto" 
                  tooltip="Insira textos pixelados."
                  active={currentTool === 'text'} 
                  onClick={() => { 
                    if (currentTool === 'text') togglePanel('text'); else { selectTool('text'); closePanelsExceptFrames(); } 
                    setShowMoreGroup(false);
                  }} 
                />
                <ToolButton 
                  id="timelapse" 
                  icon={<Video size={20} />} 
                  label={isRecording ? "REC" : "Gravar"}
                  tooltip="Grave o timelapse da sua arte."
                  active={activePanel === 'timelapse'} 
                  onClick={() => { onToggleTimelapse(); setShowMoreGroup(false); }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
});
