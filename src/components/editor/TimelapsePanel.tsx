import React, { useEffect, useState } from "react";
import { X, Play, Square, Video, Trash2, Download } from "lucide-react";
import { sound } from "../../sound";
import { videoStorage, SavedVideo } from "../../services/videoStorage";
import { motion } from "motion/react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";

interface TimelapsePanelProps {
  onClose: () => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resolution: number;
  setResolution: (res: number) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const TimelapsePanel: React.FC<TimelapsePanelProps> = ({
  onClose,
  isRecording,
  startRecording,
  stopRecording,
  resolution,
  setResolution
}) => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);

  const loadVideos = async () => {
    const vids = await videoStorage.getAllVideos();
    setVideos(vids.sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    loadVideos();
    const handleSaved = () => loadVideos();
    window.addEventListener('video-saved', handleSaved);
    return () => window.removeEventListener('video-saved', handleSaved);
  }, []);

  const handleDelete = async (id: string) => {
    sound.playClick();
    if (window.confirm("Apagar este vídeo?")) {
      await videoStorage.deleteVideo(id);
      loadVideos();
    }
  };

  const handleDownload = async (video: SavedVideo) => {
    sound.playClick();
    const ext = video.blob.type.includes('mp4') ? 'mp4' : 'webm';
    const fileName = `${video.name}.${ext}`;

    if (Capacitor.isNativePlatform()) {
      try {
        // Check permissions on Android
        if (Capacitor.getPlatform() === "android") {
          const perm = await Filesystem.checkPermissions();
          if (perm.publicStorage !== "granted") {
            await Toast.show({
              text: "Precisamos de permissão para salvar o vídeo na galeria.",
              duration: "long",
            });
            const request = await Filesystem.requestPermissions();
            if (request.publicStorage !== "granted") {
              await Toast.show({
                text: "Permissão negada. Autorize nas configurações do celular.",
                duration: "long",
              });
              return;
            }
          }
        }

        const base64 = await blobToBase64(video.blob);

        // Save to DCIM/DragonArt so it appears in gallery
        try {
          const folder = "DCIM/DragonArt";
          await Filesystem.writeFile({
            path: `${folder}/${fileName}`,
            data: base64,
            directory: Directory.ExternalStorage,
            recursive: true,
          });
          await Toast.show({
            text: `🎬 Vídeo salvo na Galeria (${folder})!`,
            duration: "long",
          });
        } catch (e) {
          console.warn("Falha ao salvar na galeria, tentando Documentos...", e);
          // Fallback to Documents
          await Filesystem.writeFile({
            path: `DragonArt/${fileName}`,
            data: base64,
            directory: Directory.Documents,
            recursive: true,
          });
          await Toast.show({
            text: "🎬 Vídeo salvo em Documentos/DragonArt",
            duration: "long",
          });
        }
      } catch (err) {
        console.error("Erro ao salvar vídeo:", err);
        await Toast.show({
          text: "Erro ao salvar vídeo. Verifique o espaço no celular.",
          duration: "long",
        });
      }
    } else {
      // Web fallback
      const url = URL.createObjectURL(video.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-[calc(100vw-2rem)] sm:w-[340px] max-h-[80vh] flex flex-col pointer-events-auto bg-[var(--bg-panel)]/95 backdrop-blur-3xl border border-[var(--border-strong)] rounded-3xl shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border-strong)] flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-2">
          <Video className="text-[var(--accent-color)]" size={20} />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Gravar Processo</h3>
        </div>
        <button onClick={() => { sound.playClick(); onClose(); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {/* Controles de Gravação */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Resolução</span>
            <select
              value={resolution}
              onChange={(e) => { sound.playClick(); setResolution(Number(e.target.value)); }}
              disabled={isRecording}
              className="bg-[var(--bg-app)] text-xs text-white border border-white/10 rounded-lg px-2 py-1 outline-none disabled:opacity-50"
            >
              <option value={720}>HD (720p)</option>
              <option value={1080}>Full HD (1080p)</option>
              <option value={2160}>4K (2160p)</option>
              <option value={4320}>8K (4320p)</option>
            </select>
          </div>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs transition-all shadow-lg active:scale-95 ${
              isRecording 
                ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' 
                : 'bg-[var(--accent-color)] text-white hover:brightness-110'
            }`}
          >
            {isRecording ? (
              <>
                <Square size={16} className="fill-current" /> Parar Gravação
              </>
            ) : (
              <>
                <Play size={16} className="fill-current" /> Gravar (REC)
              </>
            )}
          </button>
          
          {isRecording && (
            <div className="flex items-center gap-2 justify-center text-red-500 text-[10px] uppercase tracking-widest font-bold">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Gravando Tela...
            </div>
          )}
        </div>

        {/* Lista de Vídeos */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Vídeos Salvos</h4>
          {videos.length === 0 ? (
            <div className="text-center text-xs text-gray-500 p-4 bg-white/5 rounded-xl border border-white/5 border-dashed">
              Nenhum processo gravado.
            </div>
          ) : (
            videos.map(video => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={video.id} 
                className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-white font-bold max-w-[150px] truncate" title={video.name}>{video.name}</span>
                  <span className="text-[10px] text-gray-500">{video.resolution} • {new Date(video.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDownload(video)} className="p-2 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/20 rounded-lg transition-all" title="Salvar na Galeria">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(video.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="Apagar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
