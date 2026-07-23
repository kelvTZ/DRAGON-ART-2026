import React, { useState } from 'react';
import { Plus, Trash2, Palette as PaletteIcon, ChevronRight, ChevronDown, Check, Save } from 'lucide-react';
import { sound } from '../../sound';

interface Palette {
  name: string;
  colors: string[];
}

interface PaletteManagerProps {
  currentColor: string;
  selectColor: (color: string) => void;
  userPalettes: Palette[];
  setUserPalettes: React.Dispatch<React.SetStateAction<Palette[]>>;
}

const PREDEFINED_PALETTES: Palette[] = [
  { name: "Dawnbringer 32", colors: ["#000000", "#222034", "#45283c", "#663931", "#8f563b", "#df7126", "#d9a066", "#eedcbe", "#eb564b", "#b55088", "#5fcd85", "#306082", "#76428a", "#ac3232", "#d95763", "#d77bba", "#8f9779", "#4f5052", "#99e550", "#6abe30", "#37946e", "#4b692f", "#524b24", "#8f563b", "#3f3f74", "#306082", "#223d59", "#4b5320", "#8b93af", "#c0cbdc", "#ffffff", "#5fcde4"] },
  { name: "Pele HD", colors: ["#fce1c4", "#f9c9b6", "#f1c27d", "#e0ac69", "#8d5524", "#c68642", "#5c3836", "#3d2b1f"] },
  { name: "Natureza & Campo", colors: ["#2d5a27", "#4f7942", "#7cfc00", "#32cd32", "#00ff00", "#adff2f", "#556b2f", "#228b22"] },
  { name: "Oceano Profundo", colors: ["#002147", "#003366", "#006994", "#0077be", "#00a8cc", "#00d4ff", "#2a52be", "#1e3a8a"] },
  { name: "Fogo & Brasa", colors: ["#3d0000", "#800000", "#ff0000", "#ff4500", "#ff8c00", "#ffa500", "#ffd700", "#fffacd"] },
  { name: "Gameboy Retro", colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] },
  { name: "Outono Dourado", colors: ["#3e2723", "#5d4037", "#8b4513", "#a0522d", "#d2691e", "#cd853f", "#f4a460", "#daa520"] },
  { name: "Metal & Aço", colors: ["#000000", "#212121", "#424242", "#616161", "#757575", "#9e9e9e", "#bdbdbd", "#eeeeee"] },
  { name: "Cyberpunk Night", colors: ["#0d0221", "#240046", "#3c096c", "#5a189a", "#7b2cbf", "#9d4edd", "#c77dff", "#e0aaff"] },
  { name: "Pastel Dreams", colors: ["#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea", "#ff9aa2", "#ffb3ba", "#ffffba"] },
];

export const PaletteManager: React.FC<PaletteManagerProps> = ({ 
  currentColor, 
  selectColor, 
  userPalettes, 
  setUserPalettes 
}) => {
  const [expandedPalette, setExpandedPalette] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
          <PaletteIcon size={12} /> Paletas do Sistema
        </h3>
      </div>

      {/* List of Palettes */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {/* Predefined Palettes */}
        <div className="grid grid-cols-1 gap-2">
          {PREDEFINED_PALETTES.map((p, idx) => (
            <div key={idx} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => { setExpandedPalette(expandedPalette === `pre-${idx}` ? null : `pre-${idx}`); sound.playClick(); }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {p.colors.slice(0, 4).map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-black/50 shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{p.name}</span>
                </div>
                {expandedPalette === `pre-${idx}` ? <ChevronDown size={14} className="text-white/20" /> : <ChevronRight size={14} className="text-white/20" />}
              </div>
              {expandedPalette === `pre-${idx}` && (
                <div className="p-3 pt-0 grid grid-cols-8 gap-1.5 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {p.colors.map((c, i) => (
                    <button 
                      key={i} 
                      onClick={() => { selectColor(c); sound.playColorSound(); }}
                      className={`w-full aspect-square rounded-lg border transition-all hover:scale-110 ${
                        currentColor.toLowerCase() === c.toLowerCase() ? 'border-white scale-110 shadow-lg' : 'border-white/10'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
