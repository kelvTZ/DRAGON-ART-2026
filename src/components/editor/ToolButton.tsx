import React, { useRef, useCallback } from 'react';
import { sound } from '../../sound';
import { useTooltip } from '../../contexts/TooltipContext';

interface ToolButtonProps {
  id: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  color?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  label?: string;
  shortcutKey?: string;
  tooltip?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = React.memo(({ 
  id, 
  icon, 
  active, 
  onClick, 
  color, 
  onPointerDown, 
  onPointerMove, 
  onPointerUp, 
  label, 
  shortcutKey,
  tooltip
}) => {
  const { show, hide } = useTooltip();
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const clearTimer = useCallback(() => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    clearTimer();
    if (tooltip && label) {
      tooltipTimer.current = setTimeout(() => {
        tooltipTimer.current = null;
        if (btnRef.current) {
          const rect = btnRef.current.getBoundingClientRect();
          show(label, tooltip, rect);
        }
      }, 700);
    }
    if (onPointerDown) onPointerDown(e);
  }, [tooltip, label, show, onPointerDown, clearTimer]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    clearTimer();
    hide(); // Auto-dismiss tooltip when finger lifts
    if (onPointerUp) onPointerUp(e);
  }, [clearTimer, hide, onPointerUp]);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    clearTimer();
    hide();
    if (onPointerUp) onPointerUp(e);
  }, [clearTimer, hide, onPointerUp]);

  const btnSize = 'calc(44px * var(--ui-scale))';

  return (
    <div className="flex items-center justify-center flex-shrink-0 relative" style={{ width: btnSize, height: btnSize }}>
      <button 
        ref={btnRef}
        onClick={(e) => { sound.playClick(); if (onClick) onClick(e); }}
        onPointerDown={handlePointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        className={`flex items-center justify-center rounded-2xl transition-all duration-200 ${active ? 'bg-[var(--accent-color)] text-white shadow-[0_0_16px_rgba(99,102,241,0.5)] scale-105 border border-white/30' : 'hover:bg-white/10 border border-transparent text-white/70 hover:text-white'} relative`}
        style={{ 
          width: 'calc(42px * var(--ui-scale))', 
          height: 'calc(42px * var(--ui-scale))',
          minWidth: 'calc(42px * var(--ui-scale))',
          minHeight: 'calc(42px * var(--ui-scale))'
        }}
      >
        <div style={{ transform: 'scale(calc(1.05 * var(--ui-scale)))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {color && <div className="absolute top-1 right-1 w-3 h-3 rounded-full border border-black/60 shadow-sm" style={{ backgroundColor: color }} />}
        {shortcutKey && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-[var(--bg-surface)] text-[var(--text-primary)] text-[8px] font-bold px-1 rounded-sm border border-[var(--border-strong)] z-20 shadow-sm pointer-events-none uppercase hidden lg:block">
            {shortcutKey}
          </div>
        )}
      </button>
    </div>
  );
});
