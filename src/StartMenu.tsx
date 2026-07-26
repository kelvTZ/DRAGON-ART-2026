import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Download, Palette, Settings, HelpCircle, X, PlayCircle, BookOpen, Pencil, Layers as LayersIcon, Film, Play, Copy, Sun, Check, Star, Image as ImageIcon, FileImage, User, Home, LogOut, Shield, Award, Mail, Lock, Eye, EyeOff, ChevronRight, Share2, RefreshCw, ArrowRight, Send, ArrowLeft, Instagram, MessageSquare, ExternalLink, Sparkles, ZoomIn } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import GIF from 'gif.js';
import { sound } from './sound';
import { ProjectConfig } from './types';
import { themes, applyTheme, FREE_THEME_IDS } from './theme';
import type { Theme } from './theme';
import { generateId, getAvatarFallback } from './utils';


import { CONFIG } from './config';
import OnboardingTutorial from './components/OnboardingTutorial';
import { EbookModal, EBOOK_CHAPTERS } from './components/EbookModal';
import { supabase, isSupabaseConfigured } from './lib/supabase';


export interface SavedAccountItem {
  email: string;
  password?: string;
  display_name: string;
  avatar_url?: string | null;
  is_pro: boolean;
  pro_plan?: string;
  last_login: number;
}

export default function StartMenu({ onStart }: { onStart: (config: ProjectConfig, isPro: boolean, userName: string) => void }) {
  const [name, setName] = useState('My Pixel Art');
  const [size, setSize] = useState(16);
  const [customWidth, setCustomWidth] = useState(16);
  const [customHeight, setCustomHeight] = useState(16);
  const [isCustom, setIsCustom] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ProjectConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [profileName, setProfileName] = useState(() => localStorage.getItem('pixel_profile_name') || 'Artista Pixel');
  const [profileImage, setProfileImage] = useState<string | null>(() => localStorage.getItem('pixel_profile_image') || null);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Supabase Auth State & Gerenciador de 10 Contas
  const [savedAccounts, setSavedAccounts] = useState<SavedAccountItem[]>(() => {
    try {
      const saved = localStorage.getItem('pixel_saved_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [revealedPasswordEmail, setRevealedPasswordEmail] = useState<string | null>(null);
  const [showSavedAccountsList, setShowSavedAccountsList] = useState(false);

  const saveAccountToMultiList = (account: SavedAccountItem) => {
    setSavedAccounts(prev => {
      const filtered = prev.filter(acc => acc.email.toLowerCase() !== account.email.toLowerCase());
      const updated = [account, ...filtered].slice(0, 10);
      localStorage.setItem('pixel_saved_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRevealPasswordWithBiometrics = async (account: SavedAccountItem) => {
    try {
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (isAvailable) {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'required'
            }
          }).catch(() => {});
        }
      }
      setRevealedPasswordEmail(prev => prev === account.email ? null : account.email);
    } catch (_) {
      setRevealedPasswordEmail(prev => prev === account.email ? null : account.email);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setPasswordChangeSuccess(null);
    setPasswordChangeError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordChangeError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('As senhas não coincidem.');
      return;
    }

    setIsChangingPassword(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error && !error.message?.includes('session')) {
          throw error;
        }
      }
      
      const currentEmail = session?.user?.email || localStorage.getItem('pixel_user_email') || 'suaconta@wyrmpixel.app';
      setSavedAccounts(prev => prev.map(acc => {
        if (acc.email === currentEmail) {
          return { ...acc, password: newPassword };
        }
        return acc;
      }));

      setPasswordChangeSuccess('Senha alterada com sucesso! 🔒✨');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Erro ao alterar a senha.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [session, setSession] = useState<any | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | 'mestre'>('iniciante');
  const [selectedBadge, setSelectedBadge] = useState('leaf');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);  
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem('wyrm_is_pro') === 'true' || 
           localStorage.getItem('pixel_is_pro') === 'true';
  });
  const [showProModal, setShowProModal] = useState(false);
  const [selectedFeatureNotice, setSelectedFeatureNotice] = useState<string | null>(null);
  const plansSectionRef = useRef<HTMLDivElement>(null);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [projectGridSize, setProjectGridSize] = useState(() => {
    const saved = localStorage.getItem('pixel_grid_size');
    return saved ? parseInt(saved, 10) : 3;
  });

  useEffect(() => {
    localStorage.setItem('pixel_grid_size', projectGridSize.toString());
  }, [projectGridSize]);
  const carouselImages = [
    '/63b2de4429b84bb6e1cc632f2b8b9361.webp',
    '/d8395ee034cea71454588d9427dfcbcd.gif',
    '/e4278f35dfc32b3970459ea2e25e066e.gif',
    '/eac26181f6a03a98c7828992be7e346a.gif'
  ];
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);




  const defaultShortcuts: Record<string, string> = {
    pencil: 'p', eraser: 'e', fill: 'g', picker: 'i',
    shape: 'u', select: 'm', hand: 'h', text: 't',
    undo: 'z', redo: 'y', grid: 'k', play: ' ',
    clear: 'delete', sound: 's',
    zoomIn: '=', zoomOut: '-', resetView: '0',
    save: 'ctrl+s', newFrame: 'n',
  };

  const shortcutLabels: Record<string, string> = {
    pencil: 'LÃ¡pis', eraser: 'Borracha', fill: 'Balde', picker: 'Conta-gotas',
    shape: 'Formas', select: 'SeleÃ§Ã£o', hand: 'Mover (MÃ£o)', text: 'Texto',
    undo: 'Desfazer (Ctrl+)', redo: 'Refazer (Ctrl+)', grid: 'Malha', play: 'AnimaÃ§Ã£o',
    clear: 'Limpar Camada', sound: 'Mutar/Desmutar Som',
    zoomIn: 'Zoom +', zoomOut: 'Zoom -', resetView: 'Resetar Zoom',
    save: 'Salvar Projeto', newFrame: 'Novo Frame',
  };

  const shortcutCategories = [
    { name: 'Ferramentas', keys: ['pencil', 'eraser', 'fill', 'picker', 'shape', 'select', 'hand', 'text'] },
    { name: 'EdiÃ§Ã£o', keys: ['undo', 'redo', 'clear', 'newFrame'] },
    { name: 'VisualizaÃ§Ã£o', keys: ['grid', 'play', 'zoomIn', 'zoomOut', 'resetView'] },
    { name: 'Sistema', keys: ['save', 'sound'] },
  ];

  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pixel_shortcuts');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...defaultShortcuts, ...parsed };
  });
  const [shortcutConfigMode, setShortcutConfigMode] = useState<string | null>(null);

  // Theming state
  const [currentThemeId, setCurrentThemeId] = useState<string>('clean-dark');


  // Sound state
  const [sfxEnabled, setSfxEnabled] = useState(() => sound.isSfxEnabled());
  const [bgmEnabled, setBgmEnabled] = useState(() => sound.isBgmEnabled());
  
  // Audio state
  // Quiz & Onboarding State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'auth' | 'quiz' | 'thankyou' | null>('auth');
  const [quizIndex, setQuizIndex] = useState(0);

  const quizQuestions = [
    {
      question: "Qual é o seu objetivo principal no WyrmPIXEL?",
      options: ["🎮 Criar Sprites para Jogos 2D", "🎬 Fazer Animações Pixel Art", "🎨 Ilustrações para Redes Sociais", "🚀 Aprender Pixel Art do Zero"]
    },
    {
      question: "Qual tamanho de tela você mais pretende usar?",
      options: ["16x16 px (Retrô 8-bit Clássico)", "32x32 px (Estilo SNES/GBA)", "64x64 px (Pixel Art HD Detalhada)", "Tamanhos Livres Personalizados"]
    },
    {
      question: "Como você prefere exportar suas artes?",
      options: ["🎞️ Spritesheet para Engines (Unity/Godot)", "📹 Vídeo Timelapse 4K/8K para Redes", "🖼️ GIF Animado de Alta Resolução", "📷 Imagem PNG sem Perda de Qualidade"]
    },
    {
      question: "Qual o seu nível atual com Pixel Art?",
      options: ["🌱 Iniciante (Querendo aprender)", "🌿 Já sei o básico", "🌳 Intermediário / Avançado", "⚡ Sou Artista Profissional"]
    },
    {
      question: "O que mais te apaixona na arte em pixels?",
      options: ["🕹️ A nostalgia dos games antigos", "🧩 O desafio de transformar cada pixel", "✨ O visual moderno e vibrante", "💡 A liberdade de criar mundos"]
    },
    {
      question: "Qual estilo de paleta de cores mais combina com você?",
      options: ["⚡ Neon & Cyberpunk", "🍂 Vintage & Paletas Retrô", "🌈 Cores Vibrantes & Alegres", "🌙 Tons Escuros & Fantasia"]
    },
    {
      question: "Quanto tempo pretende se dedicar ao estúdio?",
      options: ["⏱️ 15 a 30 min por dia (Hobby)", "⌛ 1 hora por dia", "🔥 Várias horas (Foco Profissional)", "🎉 Finais de semana"]
    },
    {
      question: "Deseja compartilhar suas artes na comunidade do App?",
      options: ["🚀 Com certeza! Quero mostrar minhas criações", "💬 Sim, quero feedback e sugestões", "👀 Quero ver artes de outros criadores", "🔒 Prefiro manter no meu dispositivo"]
    },
    {
      question: "Qual recurso do WyrmPIXEL você quer testar primeiro?",
      options: ["🤖 Traço Inteligente com IA", "🎥 Gravação de Timelapse em HD/4K", "🖌️ Pincéis e Texturas Especiais", "🧅 Animação Onion Skin de Camadas"]
    },
    {
      question: "Pronto para liberar todo o seu potencial criativo?",
      options: ["🚀 SIM! VAMOS COMEÇAR A CRIAR AGORA!", "🔥 Com certeza, bora pra cima!", "✨ Estou super motivado!"]
    }
  ];

  const avatars = Array.from({ length: 15 }, (_, i) => `/avatars/avatar_${i + 1}.jpg`);
  const proAvatars = [
    '/avatars/pro/0163e8951593014cb6f914cc9a4b9997.gif',
    '/avatars/pro/0339983a96ad03b9eac740cc2e91f8e4.gif',
    '/avatars/pro/1bf09baf6c26978e2bc031a5ff18d262.gif',
    '/avatars/pro/555076dfc489b51a130e7ebc28900f2f.gif',
    '/avatars/pro/56a2d535b69a257a6f1ca28c428d1ad6.gif',
    '/avatars/pro/6c62876ccccef57dd0377eb5f9d1af07.gif',
    '/avatars/pro/7a1d6f55ba4cfc1065e8095d52e4cc56.gif',
    '/avatars/pro/8c07255e857006529ff2afb00ace29cc.gif',
    '/avatars/pro/91a5fc1eba717eb1ca8652575b2691bf.gif',
    '/avatars/pro/f23c314c7bb9ce67cd1b4be16cd7b316.gif'
  ];

  const toggleSfx = () => {
    const newVal = !sfxEnabled;
    sound.setSfxEnabled(newVal);
    setSfxEnabled(newVal);
  };

  const toggleBgm = () => {
    const newVal = !bgmEnabled;
    sound.setBgmEnabled(newVal);
    setBgmEnabled(newVal);
  };

  // Global click sound for the menu
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        sound.playClick();
      }
    };
    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => document.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!shortcutConfigMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.key === 'Escape') {
        setShortcutConfigMode(null);
        return;
      }

      const newKey = e.key.toLowerCase();
      if (['shift', 'control', 'alt', 'meta'].includes(newKey)) return;

      setShortcuts(prev => {
        const updated = { ...prev, [shortcutConfigMode]: newKey };
        localStorage.setItem('pixel_shortcuts', JSON.stringify(updated));
        return updated;
      });
      setShortcutConfigMode(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutConfigMode]);

  useEffect(() => {
    // Load Projects
    try {
      const projectsStr = localStorage.getItem('pixel_projects');
      if (projectsStr) {
        const projects = JSON.parse(projectsStr) as ProjectConfig[];
        // Sort by updatedAt descending
        projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setSavedProjects(projects);
      } else {
        const testProject: ProjectConfig = {
          id: generateId(),
          name: 'Projeto de Teste',
          width: 16,
          height: 16,
          updatedAt: Date.now()
        };
        setSavedProjects([testProject]);
        localStorage.setItem('pixel_projects', JSON.stringify([testProject]));
      }
    } catch (e) {
      console.warn('Failed to load projects:', e);
      setSavedProjects([]);
    }

    // Payment Redirect Listener (Stripe Payment Auto-Unlock)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
        const plan = urlParams.get('plan') || 'pro';
        localStorage.setItem('wyrm_is_pro', 'true');
        localStorage.setItem('pixel_is_pro', 'true');
        localStorage.setItem('wyrm_pro_plan', plan);
        setIsPro(true);

        // Se o usuário estiver logado, salva direto no Supabase
        if (isSupabaseConfigured()) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              supabase.auth.updateUser({
                data: { is_pro: true, wyrm_is_pro: true, pro_plan: plan }
              }).then(() => {}).catch(() => {});
              supabase.from('profiles').upsert({ id: session.user.id, is_pro: true, pro_plan: plan, updated_at: new Date().toISOString() }).then(() => {});
            }
          });
        }

        alert(`🎉 PARABÉNS! Seu Plano WyrmPIXEL ${plan === 'monthly' ? 'Mensal' : 'PRO Vitalício'} foi ativado com sucesso! Aproveite todos os recursos ilimitados.`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('Failed to parse payment status:', e);
    }

    // Escutador de Foco/Retorno para o App (Sincroniza PRO do Supabase para o APK ao voltar do navegador)
    const checkProStatusInSupabase = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Busca atualizacao do Supabase
          const { data: profile } = await supabase.from('profiles').select('is_pro, pro_plan').eq('id', session.user.id).single();
          const meta = session.user.user_metadata || {};
          
          if (profile?.is_pro || meta?.is_pro || meta?.wyrm_is_pro) {
            localStorage.setItem('wyrm_is_pro', 'true');
            localStorage.setItem('pixel_is_pro', 'true');
            if (profile?.pro_plan) localStorage.setItem('wyrm_pro_plan', profile.pro_plan);
            setIsPro(true);
          }
        }
      } catch (_) {}
    };

    window.addEventListener('focus', checkProStatusInSupabase);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkProStatusInSupabase();
      }
    });

    // Load Theme
    try {
      const savedTheme = localStorage.getItem('pixel_theme');
      if (savedTheme) {
        setCurrentThemeId(savedTheme);
        const themeConfig = themes.find(t => t.id === savedTheme);
        if (themeConfig) applyTheme(themeConfig);
      } else {
        const defaultTheme = themes.find(t => t.id === 'clean-dark');
        if (defaultTheme) {
          applyTheme(defaultTheme);
          setCurrentThemeId('clean-dark');
        }
      }

    } catch (e) {
      console.warn('Failed to load theme:', e);
      const defaultTheme = themes.find(t => t.id === 'default');
      if (defaultTheme) applyTheme(defaultTheme);
    }
  }, []);

  const changeTheme = (themeId: string) => {
    const themeConfig = themes.find(t => t.id === themeId);
    if (!themeConfig) return;

    // Free themes or PRO users apply directly
    if (FREE_THEME_IDS.has(themeId) || isPro) {
      setCurrentThemeId(themeId);
      localStorage.setItem('pixel_theme', themeId);
      applyTheme(themeConfig);
      return;
    }

    // Paid theme for non-PRO user → show preview
    applyTheme(themeConfig); // temporarily apply
    setPreviewTheme(themeConfig);
    setShowSettings(false);
  };

  const getStorageKey = () => {
    return session?.user?.id ? `pixel_projects_${session.user.id}` : 'pixel_projects_guest';
  };

  const loadProjectsForUser = (userId?: string) => {
    try {
      const storageKey = userId ? `pixel_projects_${userId}` : 'pixel_projects_guest';
      const projectsStr = localStorage.getItem(storageKey);
      if (projectsStr) {
        const projects = JSON.parse(projectsStr) as ProjectConfig[];
        projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setSavedProjects(projects);
      } else {
        setSavedProjects([]);
      }
    } catch (e) {
      setSavedProjects([]);
    }
  };

  const cancelThemePreview = () => {
    // Revert to saved theme
    const savedId = currentThemeId;
    const savedTheme = themes.find(t => t.id === savedId);
    if (savedTheme) applyTheme(savedTheme);
    setPreviewTheme(null);
    setShowSettings(true);
  };

  const deleteProject = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    setSelectedProjects(prev => prev.filter(pid => pid !== id));
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
    sound.playAction();
  };

  const deleteSelectedProjects = () => {
    const updated = savedProjects.filter(p => !selectedProjects.includes(p.id));
    setSavedProjects(updated);
    setSelectedProjects([]);
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleSelectAll = () => {
    if (selectedProjects.length === savedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(savedProjects.map(p => p.id));
    }
  };

  const duplicateProject = (id: string) => {
    const project = savedProjects.find(p => p.id === id);
    if (!project) return;
    
    const newProject = { 
      ...project, 
      id: generateId(), 
      name: `${project.name} (Cópia)`,
      updatedAt: Date.now()
    };
    
    const updated = [newProject, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    sound.playAction();
  };

  const renameProject = (id: string) => {
    const project = savedProjects.find(p => p.id === id);
    if (!project) return;
    
    const newName = prompt("Novo nome para o projeto:", project.name);
    if (!newName || newName === project.name) return;
    
    const updated = savedProjects.map(p => p.id === id ? { ...p, name: newName } : p);
    setSavedProjects(updated);
    localStorage.setItem('pixel_projects', JSON.stringify(updated));
    sound.playClick();
  };

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (!selectedProjects.includes(id)) {
        setSelectedProjects(prev => [...prev, id]);
        sound.playClick();
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePointerUp = (id: string, p: ProjectConfig) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isLongPress.current) return;

    if (selectedProjects.length > 0) {
      if (selectedProjects.includes(id)) {
        setSelectedProjects(prev => prev.filter(pid => pid !== id));
      } else {
        setSelectedProjects(prev => [...prev, id]);
      }
    } else {
      sound.init();
      sound.playAction();
      onStart(p, isPro, profileName);
    }
  };

  const [exportingId, setExportingId] = useState<string | null>(null);

  const saveToGallery = async (dataUrl: string, fileName: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = dataUrl.split(',')[1];
        const folder = fileName.endsWith('.gif') ? 'DCIM/DragonArt' : 'Pictures/DragonArt';
        await Filesystem.writeFile({
          path: `${folder}/${fileName}`,
          data: base64,
          directory: Directory.ExternalStorage,
          recursive: true,
        });
        await Toast.show({ text: `âœ… Salvo em ${folder}!`, duration: 'long' });
      } catch {
        const link = document.createElement('a');
        link.download = fileName; link.href = dataUrl; link.click();
      }
    } else {
      const link = document.createElement('a');
      link.download = fileName; link.href = dataUrl; link.click();
    }
  };

  const saveBlobToGallery = async (blob: Blob, fileName: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        await Filesystem.writeFile({
          path: `DCIM/DragonArt/${fileName}`,
          data: base64,
          directory: Directory.ExternalStorage,
          recursive: true,
        });
        await Toast.show({ text: `âœ… GIF salvo!`, duration: 'long' });
      } catch {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderProjectToCanvas = (p: ProjectConfig, frameIdx: number, scale: number, format: 'png' | 'jpeg' = 'png'): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    canvas.width = p.width * scale;
    canvas.height = p.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;

    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!p.frames || p.frames.length === 0) return canvas;

    const frame = p.frames[frameIdx] || p.frames[0];
    frame.layers?.forEach((layer: any) => {
      if (!layer.visible) return;
      for (let y = 0; y < p.height; y++) {
        for (let x = 0; x < p.width; x++) {
          const color = layer.data[y * p.width + x];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
    });

    frame.texts?.forEach((t: any) => {
      ctx.font = `${t.italic ? 'italic ' : ''}${t.bold ? 'bold ' : ''}${t.size * scale}px ${t.font}`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = 'top';
      ctx.fillText(t.text, t.x * scale, t.y * scale);
    });

    return canvas;
  };

  const downloadProject = async (p: ProjectConfig, format: 'png' | 'jpeg' = 'png', scaleResolution?: number) => {
    let targetHeight = p.height;
    if (scaleResolution === 1) targetHeight = 1080;
    else if (scaleResolution === 4) targetHeight = 2160;
    const scale = Math.max(1, Math.floor(targetHeight / p.height));

    const canvas = renderProjectToCanvas(p, 0, scale, format);
    if (!canvas) return;

    // Always add watermark, but style it differently for PRO
    addWatermark(canvas, session?.user?.user_metadata?.display_name || profileName, isPro);

    const fileName = `${p.name}-${targetHeight}p.${format === 'jpeg' ? 'jpg' : 'png'}`;
    const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : undefined);
    await saveToGallery(dataUrl, fileName);
  };

  const downloadGif = async (p: ProjectConfig, scaleResolution?: number) => {
    if (!p.frames || p.frames.length < 2) return;
    setExportingId(p.id);
    try {
      let targetHeight = p.height;
      if (scaleResolution === 1) targetHeight = 1080;
      else if (scaleResolution === 4) targetHeight = 2160;
      const scale = Math.max(1, Math.floor(targetHeight / p.height));
      const gif = new GIF({ workers: 2, quality: 10, workerScript: 'gif.worker.js', width: p.width * scale, height: p.height * scale });
      const delay = 1000 / (p.fps || 8);
      for (let i = 0; i < p.frames.length; i++) {
        const canvas = renderProjectToCanvas(p, i, scale);
        if (canvas) {
          // Always add watermark
          addWatermark(canvas, session?.user?.user_metadata?.display_name || profileName, isPro);
          gif.addFrame(canvas, { delay });
        }
      }
      gif.on('finished', async (blob: Blob) => {
        await saveBlobToGallery(blob, `${p.name}-animation.gif`);
        setExportingId(null);
      });
      gif.render();
    } catch (err) {
      console.error('GIF export failed', err);
      setExportingId(null);
    }
  };

  const addWatermark = (canvas: HTMLCanvasElement, userName: string, isProUser: boolean = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    
    const size = Math.max(9, Math.floor(canvas.height * 0.018));
    const padding = size * 0.5;
    
    // Professional watermark text
    const text = isProUser ? `DragonArt PRO \u00b7 ${userName}` : `DragonArt \u00b7 ${userName}`;
    
    ctx.save();
    ctx.font = `bold ${size}px Inter, -apple-system, sans-serif`;
    const metrics = ctx.measureText(text);
    const rectWidth = metrics.width + padding * 2;
    const rectHeight = size + padding;
    const margin = size * 0.4;
    const x = canvas.width - rectWidth - margin;
    const y = canvas.height - rectHeight - margin;

    const r = Math.max(4, size * 0.4);
    
    // Background box
    if (isProUser) {
      // Premium Golden/Dark Gradient for PRO
      const grad = ctx.createLinearGradient(x, y, x + rectWidth, y + rectHeight);
      grad.addColorStop(0, 'rgba(10, 10, 10, 0.85)');
      grad.addColorStop(1, 'rgba(30, 20, 0, 0.9)');
      ctx.fillStyle = grad;
    } else {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#000000';
    }
    
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + rectWidth - r, y);
    ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
    ctx.lineTo(x + rectWidth, y + rectHeight - r);
    ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - r, y + rectHeight);
    ctx.lineTo(x + r, y + rectHeight);
    ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    if (isProUser) {
      // Golden border for PRO
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Text color
    if (isProUser) {
      ctx.fillStyle = '#fbbf24'; // Golden Yellow
      // Subtle glow
      ctx.shadowColor = 'rgba(234, 179, 8, 0.4)';
      ctx.shadowBlur = 4;
    } else {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#ffffff';
    }
    
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padding, y + rectHeight / 2);
    
    // Add a tiny sparkle for PRO
    if (isProUser) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x + 5, y + 5, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return canvas;
  };

  const shareProject = async (p: ProjectConfig, format: 'png' | 'jpeg' = 'png') => {
    console.log('Share Project triggered for:', p.name, format);
    const scale = Math.max(1, Math.floor(1080 / p.height));
    const canvas = renderProjectToCanvas(p, 0, scale, format);
    if (!canvas) {
      console.error('Failed to render project to canvas for sharing');
      return;
    }
    const userName = session?.user?.user_metadata?.display_name || profileName;
    addWatermark(canvas, userName, isPro);
    const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : undefined);
    
    if (Capacitor.isNativePlatform()) {
      try {
        const fileName = `DragonArt_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        const base64Data = dataUrl.split(',')[1];
        
        // Ensure the directory exists or just use a simpler path
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        
        console.log('File written for sharing:', writeResult.uri);

        await Share.share({
          title: p.name,
          text: `Confirma minha arte feita no Dragon Art por ${userName}! 🐉✨`,
          url: writeResult.uri,
          dialogTitle: 'Compartilhar Arte'
        });
        return;
      } catch (err) {
        console.error('Native share failed:', err);
        // Fallback to simpler share if URI fails
        try {
          await Share.share({
            title: p.name,
            text: `Confirma minha arte feita no Dragon Art por ${userName}! 🐉✨`,
            dialogTitle: 'Compartilhar Arte'
          });
        } catch (e) {}
      }
    }

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${p.name}.${format === 'jpeg' ? 'jpg' : 'png'}`, { type: `image/${format}` });
        await navigator.share({ title: `${p.name} - DragonArt`, text: `Confirma minha arte feita no Dragon Art por ${userName}! 🐉✨`, files: [file] });
        return;
      } catch {}
    }
  };

  const [openingProject, setOpeningProject] = useState<ProjectConfig | null>(null);

  const openProjectWithTransition = (project: ProjectConfig) => {
    sound.init();
    sound.playAction();
    setOpeningProject(project);
    setTimeout(() => {
      onStart(project, isPro, profileName);
    }, 400);
  };

  const handleStart = () => {
    sound.init();
    sound.playAction();
    
    const newConfig = { id: generateId(), name, width: isCustom ? customWidth : size, height: isCustom ? customHeight : size };
    const updatedProjects = [newConfig, ...savedProjects];
    setSavedProjects(updatedProjects);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedProjects));
    openProjectWithTransition(newConfig);
  };

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProfileImage(result);
        localStorage.setItem('pixel_profile_image', result);
        sound.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfileName = (newName: string) => {
    setProfileName(newName);
    localStorage.setItem('pixel_profile_name', newName);
  };
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        if (meta.display_name) {
          setProfileName(meta.display_name);
          localStorage.setItem('pixel_profile_name', meta.display_name);
        }
        if (meta.avatar_url) {
          setProfileImage(meta.avatar_url);
          localStorage.setItem('pixel_profile_image', meta.avatar_url);
        }

        // PRO vem estritamente da conta do Supabase
        const isUserProInSupabase = meta.is_pro === true || meta.wyrm_is_pro === true;
        if (isUserProInSupabase) {
          localStorage.setItem('wyrm_is_pro', 'true');
          localStorage.setItem('pixel_is_pro', 'true');
          setIsPro(true);
        } else {
          // Conta Grátis -> Limpa PRO do navegador para não vazar de outros testes
          localStorage.removeItem('wyrm_is_pro');
          localStorage.removeItem('pixel_is_pro');
          localStorage.removeItem('wyrm_pro_plan');
          setIsPro(false);
        }
        // Carrega projetos isolados do usuario
        loadProjectsForUser(session.user.id);
        setOnboardingStep(null);
      } else {
        // Se não está logado, força o modal de login e limpa projetos
        loadProjectsForUser(undefined);
        setOnboardingStep('auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        if (meta.display_name) {
          setProfileName(meta.display_name);
          localStorage.setItem('pixel_profile_name', meta.display_name);
        }
        if (meta.avatar_url) {
          setProfileImage(meta.avatar_url);
          localStorage.setItem('pixel_profile_image', meta.avatar_url);
        }
        const isUserProInSupabase = meta.is_pro === true || meta.wyrm_is_pro === true;
        if (isUserProInSupabase) {
          localStorage.setItem('wyrm_is_pro', 'true');
          localStorage.setItem('pixel_is_pro', 'true');
          setIsPro(true);
        } else {
          localStorage.removeItem('wyrm_is_pro');
          localStorage.removeItem('pixel_is_pro');
          localStorage.removeItem('wyrm_pro_plan');
          setIsPro(false);
        }
        loadProjectsForUser(session.user.id);
        setOnboardingStep(null);
      } else {
        loadProjectsForUser(undefined);
        setOnboardingStep('auth');
      }
    });

    // Escutador em Tempo Real (Realtime Channel) para detectar atualizacao PRO no APK imediatamente
    let realtimeChannel: any = null;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        realtimeChannel = supabase
          .channel('profile_pro_sync_' + session.user.id)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, (payload: any) => {
            if (payload.new && payload.new.is_pro) {
              localStorage.setItem('wyrm_is_pro', 'true');
              localStorage.setItem('pixel_is_pro', 'true');
              if (payload.new.pro_plan) localStorage.setItem('wyrm_pro_plan', payload.new.pro_plan);
              setIsPro(true);
            }
          })
          .subscribe();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const handleSignUp = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (!isSupabaseConfigured()) {
        const newName = registerName || 'Artista Pixel';
        setProfileName(newName);
        localStorage.setItem('pixel_profile_name', newName);
        setAuthSuccess('Perfil criado localmente!');
        setTimeout(() => setAuthSuccess(null), 4000);
        setAuthLoading(false);
        return;
      }

      // Conta NOVA é SEMPRE GRATUITA (is_pro = false) por padrão!
      localStorage.removeItem('wyrm_is_pro');
      localStorage.removeItem('pixel_is_pro');
      localStorage.removeItem('wyrm_pro_plan');
      setIsPro(false);

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            display_name: registerName || profileName,
            avatar_url: profileImage || null,
            is_pro: false,
            wyrm_is_pro: false,
            pro_plan: 'free',
            experience_level: experienceLevel,
            badge: selectedBadge,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: authEmail,
            display_name: registerName || profileName,
            avatar_url: profileImage || null,
            is_pro: false,
            pro_plan: 'free',
            updated_at: new Date().toISOString()
          });
        } catch (_) {}

        // Salva na lista de 10 contas do dispositivo
        saveAccountToMultiList({
          email: authEmail,
          password: authPassword,
          display_name: registerName || profileName,
          avatar_url: profileImage || null,
          is_pro: false,
          pro_plan: 'free',
          last_login: Date.now()
        });
      }

      if (data.session) {
        setSession(data.session);
      }
      if (registerName) {
        setProfileName(registerName);
        localStorage.setItem('pixel_profile_name', registerName);
      }

      // Ao criar conta, vai para a aba Entrar (Login) com o email/senha preenchidos!
      setAuthMode('login');
      setAuthSuccess('Conta criada com sucesso! Digite sua senha ou clique em Entrar para acessar.');
      setTimeout(() => {
        setAuthSuccess(null);
      }, 4000);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao criar conta no Supabase.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      if (!isSupabaseConfigured()) {
        setAuthError('Supabase não configurado. Adicione a SUPABASE_URL e SUPABASE_ANON_KEY no arquivo src/config.ts');
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) throw error;

      if (data.session && data.user) {
        setSession(data.session);
        const meta = data.user.user_metadata || {};
        if (meta?.display_name) {
          setProfileName(meta.display_name);
          localStorage.setItem('pixel_profile_name', meta.display_name);
        }
        if (meta?.avatar_url) {
          setProfileImage(meta.avatar_url);
          localStorage.setItem('pixel_profile_image', meta.avatar_url);
        }

        // Valida PRO estritamente do Supabase do usuário
        const isUserProInSupabase = meta.is_pro === true || meta.wyrm_is_pro === true;
        if (isUserProInSupabase) {
          localStorage.setItem('wyrm_is_pro', 'true');
          localStorage.setItem('pixel_is_pro', 'true');
          setIsPro(true);
        } else {
          localStorage.removeItem('wyrm_is_pro');
          localStorage.removeItem('pixel_is_pro');
          localStorage.removeItem('wyrm_pro_plan');
          setIsPro(false);
        }

        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: authEmail,
            display_name: meta?.display_name || profileName,
            avatar_url: meta?.avatar_url || profileImage,
            is_pro: isUserProInSupabase,
            pro_plan: isUserProInSupabase ? (meta.pro_plan || 'pro') : 'free',
            updated_at: new Date().toISOString()
          });
        } catch (_) {}

        // Salva/Atualiza na lista multi-contas (até 10)
        saveAccountToMultiList({
          email: authEmail,
          password: authPassword,
          display_name: meta?.display_name || profileName,
          avatar_url: meta?.avatar_url || profileImage,
          is_pro: isUserProInSupabase,
          pro_plan: isUserProInSupabase ? (meta.pro_plan || 'pro') : 'free',
          last_login: Date.now()
        });

        // Carrega projetos isolados desta conta
        loadProjectsForUser(data.user.id);
      }

      setAuthSuccess('Login efetuado com sucesso!');
      // Fecha o modal imediatamente para evitar tela preta!
      setOnboardingStep(null);
      setTimeout(() => setAuthSuccess(null), 2000);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao realizar login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      setSession(null);
      localStorage.removeItem('wyrm_is_pro');
      localStorage.removeItem('pixel_is_pro');
      localStorage.removeItem('wyrm_pro_plan');
      localStorage.removeItem('pixel_onboarding_completed');
      setIsPro(false);
      setAuthError(null);
      setAuthSuccess('Desconectado com sucesso.');
      setOnboardingStep('auth');
    } catch (err: any) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    localStorage.setItem('pixel_profile_name', profileName);
    if (profileImage) localStorage.setItem('pixel_profile_image', profileImage);

    try {
      if (isSupabaseConfigured() && session?.user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            display_name: profileName,
            avatar_url: profileImage,
          }
        });
        if (error) throw error;
        setAuthSuccess('Nome e Foto de Perfil salvos no Supabase com sucesso! ✨');
      } else {
        setAuthSuccess('Nome e Foto de Perfil salvos localmente! ✨');
      }
      setTimeout(() => setAuthSuccess(null), 3000);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao salvar perfil no Supabase.');
    } finally {
      setAuthLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] font-sans text-[var(--text-primary)] relative transition-colors duration-300 pb-24 overflow-x-hidden">

      {/* ========== ONBOARDING / ENTRY GATE ========== */}
      <AnimatePresence>
        {onboardingStep && !session && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0a0a0a] rounded-[48px] border border-white/10 shadow-3xl overflow-hidden relative"
            >
              <div className="p-8 flex flex-col items-center text-center">
                {/* Logo & Welcome */}
                {onboardingStep === 'welcome' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
                    <img src="/logo.png" alt="Logo" className="w-24 h-24 image-pixelated drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter mb-2">BEM-VINDO AO WYRMPIXEL</h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Sua jornada épica no pixel art começa aqui.</p>
                    </div>
                    <div className="w-full flex flex-col gap-3 mt-4">
                      <button onClick={() => { /* setAuthMode removed */; setOnboardingStep(null); sound.playAction(); }}
                        className="w-full py-5 bg-[var(--accent-color)] text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[var(--accent-color)]/20 active:scale-95 transition-all">
                        CRIAR CONTA GRÁTIS
                      </button>
                      <button onClick={() => { /* setAuthMode removed */; setOnboardingStep(null); sound.playClick(); }}
                        className="w-full py-5 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
                        JÁ TENHO CONTA
                      </button>
                      <button onClick={() => { setOnboardingStep(null); sound.playClick(); }}
                        className="w-full py-3 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all">
                        ENTRAR SEM LOGAR (CONTA GRÁTIS)
                      </button>
                    </div>
                  </motion.div>
                )}

        {/* Modal de Autenticação / Cadastro com Seletor de Avatar Integrado */}
        {onboardingStep === 'auth' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-[#0d0d12] rounded-[36px] border border-white/10 shadow-2xl overflow-hidden relative my-auto p-6 md:p-8"
            >
              {/* Botão de Fechar */}
              <button 
                onClick={() => { setOnboardingStep(null); sound.playClick(); }} 
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Header Logo */}
                <div className="flex items-center gap-3 mb-6">
                  <img src="/logo.png" alt="Logo" className="w-12 h-12 image-pixelated drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                  <div className="text-left">
                    <h2 className="text-xl font-black text-white tracking-tighter uppercase">DRAGON<span className="text-[var(--accent-color)]">PIXEL</span></h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estúdio de Pixel Art</p>
                  </div>
                </div>

                {/* Abas Entrar vs Cadastrar */}
                <div className="w-full flex bg-white/5 p-1.5 rounded-2xl border border-white/10 mb-4">
                  <button
                    onClick={() => { setAuthMode('login'); sound.playClick(); }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                      authMode === 'login' 
                        ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🔑 Entrar
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); sound.playClick(); }}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                      authMode === 'register' 
                        ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ✨ Criar Conta
                  </button>
                </div>

                {/* 👥 LISTA DE CONTAS SALVAS NO DISPOSITIVO (ATÉ 10 CONTAS) */}
                {savedAccounts.length > 0 && (
                  <div className="w-full mb-6 text-left">
                    <button
                      type="button"
                      onClick={() => setShowSavedAccountsList(prev => !prev)}
                      className="w-full p-3.5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 hover:from-purple-900/50 hover:to-indigo-900/50 border border-purple-500/30 rounded-2xl flex items-center justify-between transition-all group shadow-md mb-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400 font-bold">
                          <User size={16} />
                        </div>
                        <div>
                          <span className="text-xs font-black text-white uppercase tracking-wider block">
                            Contas Salvas neste Celular
                          </span>
                          <span className="text-[10px] text-purple-300/80 font-bold">
                            {savedAccounts.length} de 10 Contas • Troca Rápida
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} className={`text-purple-400 transition-transform duration-300 ${showSavedAccountsList ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showSavedAccountsList && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-500/30"
                        >
                          {savedAccounts.map((acc, index) => (
                            <div 
                              key={index}
                              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 bg-black/40 flex items-center justify-center">
                                  {acc.avatar_url ? (
                                    <img src={acc.avatar_url} alt={acc.display_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={18} className="text-white/50" />
                                  )}
                                </div>

                                {/* Info */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-white truncate max-w-[120px]">
                                      {acc.display_name || 'Artista'}
                                    </span>
                                    {acc.is_pro ? (
                                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                        🌟 PRO
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                        GRÁTIS
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400 truncate block">
                                    {acc.email}
                                  </span>

                                  {/* Revelar Senha se desbloqueado */}
                                  {revealedPasswordEmail === acc.email && acc.password && (
                                    <div className="mt-1 px-2 py-1 bg-black/60 rounded-lg text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 border border-emerald-500/30">
                                      <Lock size={10} />
                                      Senha: {acc.password}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Botão Revelar Senha por Biometria */}
                                {acc.password && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevealPasswordWithBiometrics(acc)}
                                    title="Ver Senha (Requer Digital / Biometria do Celular)"
                                    className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 transition-all"
                                  >
                                    {revealedPasswordEmail === acc.email ? <EyeOff size={14} className="text-emerald-400" /> : <Eye size={14} />}
                                  </button>
                                )}

                                {/* Botão Logar Rapidamente */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthEmail(acc.email);
                                    if (acc.password) setAuthPassword(acc.password);
                                    setAuthMode('login');
                                    sound.playClick();
                                    // Tenta fazer o login imediatamente
                                    setTimeout(() => {
                                      const loginBtn = document.getElementById('btn-submit-auth');
                                      if (loginBtn) loginBtn.click();
                                    }, 100);
                                  }}
                                  className="px-3 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
                                >
                                  ⚡ Entrar
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Formulário */}
                <div className="w-full space-y-4 text-left">
                  {/* Seletor de Avatar (Visível no Cadastro) */}
                  {authMode === 'register' && (
                    <div className="flex flex-col items-center mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <label className="text-xs font-black text-white uppercase tracking-wider mb-3 self-start flex items-center gap-2">
                        <User size={14} className="text-[var(--accent-color)]" />
                        Escolha seu Avatar de Perfil
                      </label>
                      
                      {/* Avatar Preview Grande */}
                      <div 
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="relative group cursor-pointer w-20 h-20 rounded-full border-2 border-[var(--accent-color)] overflow-hidden bg-black/40 flex items-center justify-center mb-4 transition-transform hover:scale-105"
                      >
                        {profileImage ? (
                          <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={36} className="text-white/40" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-black uppercase text-white">
                          Trocar Foto
                        </div>
                      </div>

                      {/* Lista de Avatares Rápidos */}
                      <div className="w-full">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {avatars.slice(0, 8).map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setProfileImage(url);
                                localStorage.setItem('pixel_profile_image', url);
                                sound.playClick();
                              }}
                              className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 transition-all ${
                                profileImage === url ? 'border-[var(--accent-color)] scale-110 shadow-lg' : 'border-white/10 hover:border-white/40'
                              }`}
                            >
                              <img src={url} alt={`Avatar ${i+1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nome (Apenas no Cadastro) */}
                  {authMode === 'register' && (
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Seu Nome de Artista / Exibição" 
                        value={registerName} 
                        onChange={e => {
                          setRegisterName(e.target.value);
                          setProfileName(e.target.value);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-bold" 
                      />
                    </div>
                  )}

                  {/* E-mail */}
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="Seu E-mail" 
                      value={authEmail} 
                      onChange={e => setAuthEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-bold" 
                    />
                  </div>

                  {/* Senha com Olho */}
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" />
                    <input 
                      type={showAuthPassword ? "text" : "password"} 
                      placeholder="Sua Senha" 
                      value={authPassword} 
                      onChange={e => setAuthPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white text-sm outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-bold" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(prev => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    >
                      {showAuthPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Botão de Ação */}
                <button 
                  id="btn-submit-auth"
                  onClick={authMode === 'login' ? handleSignIn : handleSignUp}
                  disabled={authLoading}
                  className="w-full mt-6 py-4 bg-[var(--accent-color)] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-[var(--accent-color)]/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <span>PROCESSANDO...</span>
                  ) : authMode === 'login' ? (
                    <><span>ENTRAR NA CONTA</span> <Sparkles size={16} /></>
                  ) : (
                    <><span>CRIAR MINHA CONTA</span> <Sparkles size={16} /></>
                  )}
                </button>
                
                {authError && <p className="mt-3 text-red-400 text-xs font-bold text-center">{authError}</p>}
                {authSuccess && <p className="mt-3 text-emerald-400 text-xs font-bold text-center">{authSuccess}</p>}

                <button 
                  onClick={() => { setOnboardingStep(null); sound.playClick(); }}
                  className="mt-4 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all"
                >
                  Continuar sem Logar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal do Quiz de 10 Perguntas Motivacionais */}
        {onboardingStep === 'quiz' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto"
          >
            <motion.div 
              key={quizIndex}
              initial={{ scale: 0.9, opacity: 0, x: 30 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -30 }}
              className="w-full max-w-lg bg-[#0d0d12] rounded-[36px] border border-white/10 shadow-2xl overflow-hidden relative my-auto p-6 md:p-8 text-center"
            >
              {/* Barra de Progresso do Quiz */}
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-6">
                <div 
                  className="bg-gradient-to-r from-[var(--accent-color)] to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">
                <span>Pergunta {quizIndex + 1} de {quizQuestions.length}</span>
                <span className="text-[var(--accent-color)]">{Math.round(((quizIndex + 1) / quizQuestions.length) * 100)}% Concluído</span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white mb-6 uppercase tracking-tight leading-snug">
                {quizQuestions[quizIndex].question}
              </h3>

              {/* Opções de Resposta */}
              <div className="w-full space-y-3 mb-6">
                {quizQuestions[quizIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playAction();
                      if (quizIndex + 1 < quizQuestions.length) {
                        setQuizIndex(quizIndex + 1);
                      } else {
                        localStorage.setItem('pixel_onboarding_completed', 'true');
                        setOnboardingStep('thankyou');
                      }
                    }}
                    className="w-full p-4 bg-white/5 hover:bg-[var(--accent-color)]/20 hover:border-[var(--accent-color)] text-white text-left font-bold text-sm rounded-2xl border border-white/10 transition-all duration-200 active:scale-98 flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => {
                  sound.playClick();
                  localStorage.setItem('pixel_onboarding_completed', 'true');
                  setOnboardingStep('thankyou');
                }}
                className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest"
              >
                Pular Questionário ➔
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Modal de Agradecimento & Boas-Vindas */}
        {onboardingStep === 'thankyou' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-gradient-to-b from-[#161622] to-[#0a0a0f] rounded-[40px] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] p-8 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full -z-10" />

              {/* Avatar do Artista */}
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl mb-4 relative">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-white/60 m-auto" />
                )}
                <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-black font-black text-[9px] uppercase tracking-widest py-0.5">ARTISTA</div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
                OBRIGADO E BEM-VINDO, <br />
                <span className="text-amber-400">{profileName}!</span> 🎉
              </h2>

              <p className="text-xs text-gray-300 font-medium leading-relaxed mb-6">
                Seu perfil e preferências foram configurados com sucesso! Você está 100% pronto para criar obras-primas incríveis no WyrmPIXEL.
              </p>

              <button 
                onClick={() => {
                  sound.playAction();
                  setOnboardingStep(null);
                }}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:brightness-110 text-black font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>ENTRAR NO ESTÚDIO DE ARTES</span>
                <Sparkles size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step Avatar & Name (Post-Login/Register) */}
        {onboardingStep && session && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
            <div className="w-full max-w-lg">
              {onboardingStep === 'avatar' && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Escolha sua Face</h2>
                  </div>
                  
                  <div className="w-full max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Standard Avatars */}
                    <div className="mb-8">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User size={14} /> Avatares Padrão
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {avatars.map((url, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setProfileImage(url); sound.playClick(); }}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${profileImage === url ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/20' : 'border-white/5 opacity-60 hover:opacity-100'}`}>
                            <img src={url} className="w-full h-full object-cover" />
                            {profileImage === url && <div className="absolute inset-0 bg-[var(--accent-color)]/20 flex items-center justify-center"><Check className="text-white bg-[var(--accent-color)] rounded-full p-1" size={16} /></div>}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* PRO Avatars */}
                    <div className="mb-8">
                      <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Star size={14} className="fill-yellow-500" /> Avatares Animados PRO
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {proAvatars.map((url, i) => (
                          <motion.button 
                            key={i} 
                            whileHover={{ scale: isPro ? 1.05 : 1 }} 
                            whileTap={{ scale: isPro ? 0.95 : 1 }} 
                            onClick={() => { 
                              if (isPro) {
                                setProfileImage(url); 
                                sound.playClick(); 
                              } else {
                                alert('Este avatar animado é exclusivo para membros PRO! 🌟');
                              }
                            }}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                              profileImage === url ? 'border-yellow-500 ring-4 ring-yellow-500/20' : 'border-white/5'
                            } ${!isPro ? 'grayscale opacity-40' : 'hover:opacity-100'}`}
                          >
                            <img src={url} className="w-full h-full object-cover" />
                            {!isPro && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Lock size={16} className="text-white" />
                              </div>
                            )}
                            {profileImage === url && <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center"><Check className="text-white bg-yellow-500 rounded-full p-1" size={16} /></div>}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setOnboardingStep('name')} disabled={!profileImage}
                    className="w-full mt-6 py-5 bg-[var(--accent-color)] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-30">
                    PRÓXIMO PASSO
                  </button>
                </motion.div>
              )}

              {onboardingStep === 'name' && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-[32px] border-4 border-[var(--accent-color)] mx-auto mb-6 overflow-hidden shadow-2xl">
                      <img src={profileImage || ''} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Como quer ser chamado?</h2>
                  </div>
                  <input type="text" placeholder="Ex: Mestre Pixel" value={profileName} onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-center text-xl outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-black mb-8" />
                  
                  <button onClick={async () => {
                    await handleSaveProfile();
                    setActiveTab('profile');
                    setOnboardingStep(null);
                    sound.playAction();
                  }} disabled={!profileName || profileName.length < 3}
                    className="w-full py-5 bg-gradient-to-r from-[var(--accent-color)] to-green-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-30">
                    FINALIZAR IDENTIDADE
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ConteÃºdo com Abas */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              {/* Top Navigation Profissional */}
              <div className="bg-[#121216]/90 backdrop-blur-2xl px-6 py-5 border-b border-white/10 shadow-2xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 group cursor-pointer" onClick={() => sound.playClick()}>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative p-2 bg-[var(--accent-color)]/10 rounded-2xl border border-[var(--accent-color)]/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                    >
                      <img 
                        src="/logo.png" 
                        alt="WyrmPIXEL Logo" 
                        className="w-12 h-12 md:w-14 md:h-14 object-contain image-pixelated drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                      />
                    </motion.div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                          Wyrm<span className="text-[var(--accent-color)]">PIXEL</span>
                        </h1>
                        <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 tracking-widest uppercase shadow-sm">
                          PRO STUDIO
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white/50 tracking-wide">
                        Crie & Anime Pixel Art Profissional • v{CONFIG.VERSION}
                      </p>
                    </div>
                  </div>

                  {/* Seletor de Abas Principal */}
                  <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-lg">
                    <button
                      onClick={() => { sound.playClick(); setActiveTab('home'); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'home' ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-105' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      <Home size={16} />
                      <span>Projetos</span>
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setActiveTab('profile'); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'profile' ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-105' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      <User size={16} />
                      <span>Meu Perfil</span>
                      {profileImage && (
                        <img src={profileImage} alt="Avatar" className="w-4 h-4 rounded-full object-cover border border-white/40 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Redes Sociais & Controles */}
                  <div className="flex items-center gap-2.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    {/* Botão de Login / Perfil */}
                    {session ? (
                      <button
                        onClick={() => { sound.playClick(); setActiveTab('profile'); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95 group shadow-md"
                        title="Ver Perfil"
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--accent-color)] shrink-0">
                          {profileImage ? (
                            <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} className="text-white/60 m-auto" />
                          )}
                        </div>
                        <span className="text-xs font-bold truncate max-w-[100px] hidden sm:inline">{profileName}</span>
                        {isPro && <span className="text-[9px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-black px-1.5 py-0.5 rounded-md uppercase">PRO</span>}
                      </button>
                    ) : (
                      <button
                        onClick={() => { sound.playClick(); setAuthMode('login'); setOnboardingStep('auth'); }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--accent-color)] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[var(--accent-color)]/20 transition-all active:scale-95"
                      >
                        <User size={16} />
                        <span>Entrar / Cadastrar</span>
                      </button>
                    )}

                    <a 
                      href={CONFIG.INSTAGRAM_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 transition-all active:scale-95 group shadow-md" 
                      title="Siga no Instagram"
                    >
                      <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-wider hidden lg:inline">Instagram</span>
                    </a>
                    
                    <button 
                      onClick={() => { sound.playClick(); setShowEbookModal(true); }} 
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400/20 via-yellow-500/20 to-amber-400/20 hover:from-amber-400/30 text-amber-300 border border-amber-400/40 transition-all active:scale-95 group shadow-lg shadow-amber-500/10" 
                      title="Abrir o E-Book Oficial (Livro Sagrado do Pixel Art - 66 Capítulos)"
                    >
                      <BookOpen size={18} className="group-hover:scale-110 transition-transform text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Livro E-Book (66 Capítulos)</span>
                    </button>

                    <button 
                      onClick={() => { sound.playClick(); setShowTutorials(true); }} 
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all active:scale-95 group" 
                      title="Guia & Tutoriais"
                    >
                      <Sparkles size={18} className="group-hover:scale-110 transition-transform text-[var(--accent-color)]" />
                      <span className="text-xs font-bold uppercase tracking-wider hidden lg:inline">Aprender</span>
                    </button>
                    
                    <button 
                      onClick={() => { sound.playClick(); setShowSettings(true); }} 
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all active:scale-95" 
                      title="Configurações"
                    >
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Carousel */}
              <div className="w-full bg-[var(--bg-element)] border-y border-[var(--border-subtle)] py-6 overflow-hidden relative flex flex-col gap-4 mt-2">
                <div className="max-w-6xl mx-auto w-full px-6 flex items-center gap-2">
                  <Star className="text-yellow-400 animate-pulse" size={16} />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Galeria WyrmPIXEL</h3>
                </div>
                <div className="flex animate-scroll gap-4 px-4 w-max">
                  {[...carouselImages, ...carouselImages].map((src, i) => (
                    <img key={i} src={src} alt="Art" onClick={() => setZoomedImage(src)} className="h-40 object-cover cursor-pointer border-4 border-black rounded-xl hover:scale-105 transition-transform" />
                  ))}
                </div>
              </div>

              {/* Fim do Carousel */}

              {/* Main Grid */}
              <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 bg-[var(--bg-panel)] p-6 rounded-[32px] border border-white/5 shadow-xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-[var(--accent-color)]/20 rounded-xl text-[var(--accent-color)]"><Plus size={20} /></div>
                    Novo Desenho
                  </h2>
                  <div className="space-y-5">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                    <div className="grid grid-cols-2 gap-2">
                      {[16, 32, 64, 120].map(s => (
                        <button key={s} onClick={() => { setSize(s); setIsCustom(false); }} className={`py-3 rounded-xl font-bold transition-all ${!isCustom && size === s ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 text-[var(--text-muted)]'}`}>{s}x{s}</button>
                      ))}
                      <button
                        onClick={() => {
                          if (!isPro) { setShowProModal(true); return; }
                          setIsCustom(true);
                        }}
                        className={`col-span-2 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isCustom ? 'bg-[var(--accent-color)] text-white' : isPro ? 'bg-white/5 text-[var(--text-muted)] hover:text-white' : 'bg-white/5 text-yellow-400/70 hover:bg-yellow-400/10'}`}
                      >
                        {!isPro && <Lock size={14} />} Tamanho Personalizado {!isPro && <span className="text-[9px] font-black bg-yellow-400/20 px-2 py-0.5 rounded-full">PRO</span>}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isCustom && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-4"
                        >
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">Largura (px)</label>
                              <input 
                                type="number" 
                                min="1" max="512"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))}
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--accent-color)] outline-none font-bold text-center"
                              />
                            </div>
                            <div className="flex items-end pb-3 font-bold text-[var(--text-muted)]">x</div>
                            <div className="flex-1">
                              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">Altura (px)</label>
                              <input 
                                type="number" 
                                min="1" max="512"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))}
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--accent-color)] outline-none font-bold text-center"
                              />
                            </div>
                          </div>


                          {/* Dynamic Canvas Preview */}
                          <motion.div 
                            layout
                            className="flex flex-col items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5"
                          >
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em]">
                              PrÃ©-visualizaÃ§Ã£o da Folha
                            </div>
                            <div className="relative flex items-center justify-center w-full" style={{ minHeight: '120px', maxHeight: '180px' }}>
                              <motion.div
                                layout
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="border-2 border-[var(--accent-color)] shadow-lg  rounded-sm overflow-hidden"
                                style={{
                                  width: `${Math.min(160, Math.max(32, (customWidth / Math.max(customWidth, customHeight)) * 160))}px`,
                                  height: `${Math.min(160, Math.max(32, (customHeight / Math.max(customWidth, customHeight)) * 160))}px`,
                                  backgroundImage: 'conic-gradient(rgba(255,255,255,0.05) 90deg, transparent 90deg 180deg, rgba(255,255,255,0.05) 180deg 270deg, transparent 270deg)',
                                  backgroundSize: '12px 12px',
                                  backgroundColor: 'rgba(0,0,0,0.2)'
                                }}
                              >
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-[10px] font-black text-[var(--accent-color)] drop-shadow-md" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                                    {customWidth}Ã—{customHeight}
                                  </span>
                                </div>
                              </motion.div>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-bold">
                              <span>{customWidth * customHeight} pixels</span>
                              <span>â€¢</span>
                              <span>{customWidth > customHeight ? 'Paisagem' : customWidth < customHeight ? 'Retrato' : 'Quadrado'}</span>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={handleStart} className="w-full bg-[var(--accent-color)] hover:brightness-110 p-4 rounded-2xl text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Palette size={24} /> CRIAR AGORA
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* PRO Banner */}
                  {!isPro && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowProModal(true)}
                      className="relative overflow-hidden cursor-pointer group rounded-[28px] border border-yellow-400/30 shadow-[0_0_30px_rgba(251,191,36,0.15)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10 group-hover:from-yellow-400/20 group-hover:via-orange-500/20 group-hover:to-yellow-400/20 transition-all" />
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl group-hover:bg-yellow-400/10 transition-all" />
                      <div className="relative flex items-center gap-4 p-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                          <Star size={28} className="text-black fill-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-white text-base tracking-wide">SEJA WYRMPIXEL PRO</h3>
                          <p className="text-xs text-yellow-300/80 font-bold mt-0.5">ExportaÃ§Ã£o HD â€¢ Sem Marca D'Ã¡gua â€¢ Selos Exclusivos</p>
                        </div>
                        <ChevronRight size={24} className="text-yellow-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-black flex items-center gap-3">
                      <LayersIcon className="text-[var(--accent-color)]" size={24} /> Meus Projetos
                    </h2>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Ver:</span>
                      <input 
                        type="range" 
                        min="1" max="5" 
                        value={projectGridSize} 
                        onChange={(e) => setProjectGridSize(Number(e.target.value))}
                        className="w-24 md:w-32 accent-[var(--accent-color)]"
                      />
                    </div>
                  </div>
                  <div className={`grid gap-4 ${
                    {
                      1: "grid-cols-1",
                      2: "grid-cols-2",
                      3: "grid-cols-2 sm:grid-cols-3",
                      4: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5",
                      5: "grid-cols-4 sm:grid-cols-5 lg:grid-cols-6",
                    }[projectGridSize] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}>
                    {savedProjects.length === 0 ? (
                      <div className="col-span-full py-16 px-6 text-center bg-[#141418]/60 backdrop-blur-2xl rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-[var(--accent-color)]/10 rounded-2xl text-[var(--accent-color)] border border-[var(--accent-color)]/20 shadow-inner">
                          <Palette size={36} />
                        </div>
                        <h3 className="text-base font-bold text-white tracking-wide">Sua galeria está vazia</h3>
                        <p className="text-xs text-white/50 max-w-sm">Crie seu primeiro projeto de pixel art no painel ao lado para começar a desenhar!</p>
                      </div>
                    ) : (
                      savedProjects.map(p => (
                        <div 
                          key={p.id} 
                          className="bg-[#141418]/90 hover:bg-[#18181e] rounded-3xl border border-white/10 hover:border-[var(--accent-color)]/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_30px_rgba(99,102,241,0.2)] relative group flex flex-col overflow-hidden"
                        >
                          <div 
                            className="cursor-pointer relative aspect-square bg-gradient-to-b from-black/40 to-black/20 flex items-center justify-center p-3 overflow-hidden rounded-t-3xl border-b border-white/5"
                            onClick={() => openProjectWithTransition(p)}
                          >
                            {p.thumbnail ? (
                              <img 
                                src={p.thumbnail} 
                                alt={p.name} 
                                className="w-full h-full object-contain image-pixelated group-hover:scale-105 transition-transform duration-300 drop-shadow-md" 
                              />
                            ) : (
                              <Palette className="text-white/20 group-hover:text-[var(--accent-color)]/50 transition-colors" size={48} />
                            )}
                            
                            {/* Overlay de hover play */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <div className="p-3 bg-[var(--accent-color)] text-white rounded-2xl shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                                <Play size={24} className="fill-white translate-x-0.5" />
                              </div>
                            </div>

                            {/* Dimensions Badge */}
                            <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-[9px] font-bold text-white/90 px-2 py-0.5 rounded-full border border-white/10 tracking-wider uppercase">
                              {p.width}×{p.height}px{p.frames && p.frames.length > 1 ? ` • ${p.frames.length}f` : ''}
                            </div>
                          </div>

                          <div className="p-3.5 flex items-center justify-between gap-2">
                            <div 
                              className="min-w-0 flex-1 cursor-pointer" 
                              onClick={() => openProjectWithTransition(p)}
                            >
                              <h4 className="font-bold truncate text-sm text-white/90 group-hover:text-white transition-colors">{p.name}</h4>
                              <span className="text-[10px] font-bold text-[var(--accent-color)] tracking-wider uppercase">Abrir Projeto</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  shareProject(p); 
                                }} 
                                className="p-2 text-white/40 hover:text-[var(--accent-color)] hover:bg-white/10 rounded-xl transition-colors" 
                                title="Compartilhar"
                              >
                                <Share2 size={16} />
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setOpenMenuId(openMenuId === p.id ? null : p.id); 
                                }} 
                                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors" 
                                title="Opções"
                              >
                                <Settings size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Dropdown Options Menu */}
                          <AnimatePresence>
                            {openMenuId === p.id && (
                              <>
                                <motion.div 
                                  key="menu-backdrop"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="fixed inset-0 z-[998]" 
                                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} 
                                />
                                <motion.div 
                                  key="menu-content"
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-1 bg-[var(--bg-panel)] rounded-2xl shadow-2xl border border-white/10 z-[999] overflow-hidden min-w-[220px]"
                                  style={{ position: 'absolute', top: '100%', right: 0 }}
                                >
                                  {/* Título/Cabeçalho do Menu */}
                                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">Opções do Desenho</span>
                                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} className="text-white/40 hover:text-white transition-colors">
                                      <X size={14} />
                                    </button>
                                  </div>

                                  {/* Exportar PNG */}
                                  <div className="p-3 border-b border-white/5">
                                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileImage size={12} /> Exportar PNG</div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'png'); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Download size={12} /><span>Original</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'png', 1); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Download size={12} /><span>1080p</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'png', 4); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Download size={12} /><span>4K</span></button>
                                    </div>
                                  </div>

                                  {/* Exportar JPG */}
                                  <div className="p-3 border-b border-white/5">
                                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><ImageIcon size={12} /> Exportar JPG</div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'jpeg'); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Download size={12} /><span>Original</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'jpeg', 1); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Download size={12} /><span>1080p</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'jpeg', 4); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Download size={12} /><span>4K</span></button>
                                    </div>
                                  </div>

                                  {/* GIF Animado (se aplicável) */}
                                  {p.frames && p.frames.length > 1 && (
                                    <div className="p-3 border-b border-white/5">
                                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Film size={12} /> GIF Animado</div>
                                      <div className="grid grid-cols-3 gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); downloadGif(p); setOpenMenuId(null); }} disabled={exportingId === p.id} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-green-600 hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"><Film size={12} /><span>Original</span></button>
                                        <button onClick={(e) => { e.stopPropagation(); downloadGif(p, 1); setOpenMenuId(null); }} disabled={exportingId === p.id} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-green-600 hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"><Film size={12} /><span>1080p</span></button>
                                        <button onClick={(e) => { e.stopPropagation(); downloadGif(p, 4); setOpenMenuId(null); }} disabled={exportingId === p.id} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-green-600 hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"><Film size={12} /><span>4K</span></button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Compartilhar */}
                                  <div className="p-3 border-b border-white/5">
                                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Share2 size={12} /> Compartilhar</div>
                                    <div className="grid grid-cols-2 gap-1">
                                      <button onClick={(e) => { e.stopPropagation(); shareProject(p, 'png'); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-center flex items-center justify-center gap-1"><FileImage size={12} /><span>PNG</span></button>
                                      <button onClick={(e) => { e.stopPropagation(); shareProject(p, 'jpeg'); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold bg-white/5 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-center flex items-center justify-center gap-1"><ImageIcon size={12} /><span>JPG</span></button>
                                    </div>
                                  </div>

                                  {/* Ações do Projeto */}
                                  <div className="p-2 grid grid-cols-3 gap-1 bg-white/[0.01]">
                                    <button onClick={(e) => { e.stopPropagation(); duplicateProject(p.id); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold text-white/70 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Copy size={12} /><span>Duplicar</span></button>
                                    <button onClick={(e) => { e.stopPropagation(); renameProject(p.id); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold text-white/70 hover:bg-[var(--accent-color)] hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Pencil size={12} /><span>Renomear</span></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); setOpenMenuId(null); }} className="py-2 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all text-center flex flex-col items-center justify-center gap-0.5"><Trash2 size={12} /><span>Excluir</span></button>
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Rodapé de Comunidade & Redes Sociais */}
                  <div className="mt-10 p-6 bg-[#121216]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg.pink-500/10 text-pink-400 rounded-2xl border border-pink-500/20 shadow-inner">
                        <Instagram size={28} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Comunidade WyrmPIXEL</h4>
                        <p className="text-xs text-white/50">Compartilhe suas artes no Instagram usando <strong className="text-pink-400">#WyrmPIXEL</strong>!</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a 
                        href={CONFIG.INSTAGRAM_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                      >
                        <Instagram size={16} /> Siga no Instagram
                      </a>
                      <button 
                        onClick={() => { sound.playClick(); setShowTutorials(true); }}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs uppercase tracking-wider rounded-2xl border border-white/10 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <BookOpen size={16} /> Guia
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Aba de Perfil do Artista - Layout Clean & Otimizado */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6"
            >
              {/* Header Clean do Perfil com Botão X de Voltar */}
              <div className="bg-[#121216]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col gap-6">
                
                {/* Botão X para Voltar ao Menu Principal */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-xl border border-[var(--accent-color)]/20">
                      <User size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-wide">Meu Perfil de Artista</h2>
                      <p className="text-xs text-white/50">Gerencie sua foto, nome e veja suas estatísticas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session && (
                      <button
                        onClick={() => { sound.playClick(); handleSignOut(); }}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30 transition-all active:scale-95 flex items-center gap-2 font-bold text-xs"
                        title="Sair da Conta (Logout)"
                      >
                        <LogOut size={16} />
                        <span>Deslogar</span>
                      </button>
                    )}
                    <button
                      onClick={() => { sound.playClick(); setActiveTab('home'); }}
                      className="p-2.5 bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 text-white/70 hover:text-red-400 rounded-2xl border border-white/10 transition-all active:scale-95 flex items-center gap-2 font-bold text-xs"
                      title="Voltar aos Projetos (X)"
                    >
                      <span>Voltar</span>
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Perfil & Detalhes do Usuário */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full md:w-auto">
                    
                    {/* Foto de Perfil / Avatar Ultra Profissional */}
                    <div 
                      className="relative group shrink-0 cursor-pointer" 
                      onClick={() => { sound.playClick(); setShowAvatarPicker(true); }}
                      title="Clique para alterar sua foto de perfil"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[var(--accent-color)] shadow-[0_0_25px_rgba(99,102,241,0.35)] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center relative transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(99,102,241,0.6)]">
                        {profileImage ? (
                          <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                          <User size={48} className="text-white/40 group-hover:text-white/70 transition-colors" />
                        )}
                        
                        {/* Hover Overlay Profissional */}
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                          <ImageIcon size={22} className="text-amber-400 mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-center px-1">Alterar Foto</span>
                        </div>
                      </div>

                      {/* Selo único e elegante da Câmera no Canto */}
                      <button
                        onClick={(e) => { e.stopPropagation(); sound.playClick(); avatarFileInputRef.current?.click(); }}
                        className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-r from-[var(--accent-color)] to-purple-600 hover:brightness-110 text-white rounded-full shadow-xl border-2 border-[#121216] group-hover:scale-110 transition-transform"
                        title="Enviar Foto da Galeria / PC"
                      >
                        <ImageIcon size={14} />
                      </button>
                      <input 
                        type="file" 
                        ref={avatarFileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleCustomAvatarUpload} 
                      />
                    </div>

                    {/* Nome do Artista & Status */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => handleUpdateProfileName(e.target.value)}
                          placeholder="Seu Nome de Artista..."
                          className="text-xl sm:text-2xl font-black bg-white/5 hover:bg-white/10 focus:bg-black/60 border border-white/10 focus:border-[var(--accent-color)] px-3.5 py-1 rounded-xl outline-none text-white transition-all max-w-[260px]"
                        />
                        <Pencil size={16} className="text-white/40 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Star size={12} className="fill-amber-400" /> WyrmPIXEL PRO
                        </span>
                        <span className="text-xs font-semibold text-white/50">
                          {savedProjects.length} Artes Criadas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas Limpas + Botão Baixar APK */}
                  <div className="flex items-center gap-6 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 shrink-0 w-full md:w-auto justify-around flex-wrap">
                    <div className="text-center">
                      <div className="text-2xl font-black text-[var(--accent-color)]">{savedProjects.length}</div>
                      <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Projetos</div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-400">
                        {savedProjects.reduce((acc, p) => acc + (p.frames?.length || 1), 0)}
                      </div>
                      <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Quadros</div>
                    </div>
                    {/* Botão Baixar APK (Visível apenas na Web) */}
                    {!Capacitor.isNativePlatform() && (
                      <a
                        href={CONFIG.DOWNLOAD_APK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 no-underline uppercase tracking-wider ml-auto"
                      >
                        <Download size={16} /> <span>Baixar APK Android</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Seção de Planos de Assinatura & Acesso Vitalício */}
                {localStorage.getItem('wyrm_pro_plan') === 'lifetime' ? (
                  <div className="mt-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-2xl p-5 border border-yellow-500/40 shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star size={24} className="text-yellow-400 fill-yellow-400" />
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-wider">PRO VITALÍCIO ATIVADO 👑</h3>
                        <p className="text-xs text-yellow-300/90 font-medium">Você tem acesso ilimitado a todos os recursos para sempre!</p>
                      </div>
                    </div>
                  </div>
                ) : localStorage.getItem('wyrm_pro_plan') === 'monthly' ? (
                  <div className="mt-2 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 rounded-2xl p-5 border border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Star size={24} className="text-blue-400 fill-blue-400" />
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-wider">ASSINATURA MENSAL ATIVA ✨</h3>
                        <p className="text-xs text-blue-300/90 font-medium">Sua conta PRO Mensal está 100% ativa!</p>
                      </div>
                    </div>
                    {/* Botão de upgrade pro Vitalício */}
                    <button 
                      onClick={() => { sound.playClick(); window.open('https://buy.stripe.com/test_5kQfZgagw4KYa06fVMaIM02', '_blank'); }}
                      className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black rounded-xl shadow-md uppercase tracking-wider shrink-0"
                    >
                      👑 Mudar para Vitalício (R$ 49,90)
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 bg-gradient-to-r from-[#181824] via-[#1c1a2e] to-[#181824] rounded-2xl p-5 border border-yellow-500/20 shadow-xl flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                      <div>
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <Star size={18} className="text-yellow-400 fill-yellow-400" />
                          <h3 className="text-base font-black text-white uppercase tracking-wider">Planos WyrmPIXEL PRO Pass</h3>
                        </div>
                        <p className="text-xs text-white/60 mt-0.5">Desbloqueie exportação em HD/4K, sem marcas d'água e camadas ilimitadas</p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 shrink-0">
                        OFERTA DE LANÇAMENTO
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Opção Mensal (R$ 17,90 / mês) */}
                      <div 
                        onClick={() => { sound.playClick(); window.open('https://buy.stripe.com/test_dRmbJ00FW91e6NU10SaIM01', '_blank'); }}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-blue-400/50 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Plano Mensal</span>
                            <span className="text-[10px] text-white/30 line-through font-bold">R$ 29,90</span>
                          </div>
                          <div className="text-xl font-black text-white mt-0.5">R$ 17,90 <span className="text-xs text-white/40 font-normal">/ mês</span></div>
                          <p className="text-[11px] text-white/50 mt-1">Cancele quando quiser</p>
                        </div>
                        <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all uppercase tracking-wider shadow-md">
                          Assinar Stripe
                        </button>
                      </div>

                      {/* Opção Vitalícia (R$ 49,90 único) */}
                      <div 
                        onClick={() => { sound.playClick(); window.open('https://buy.stripe.com/test_5kQfZgagw4KYa06fVMaIM02', '_blank'); }}
                        className="p-4 bg-gradient-to-br from-yellow-400/10 via-amber-500/15 to-yellow-500/10 hover:from-yellow-400/20 rounded-2xl border-2 border-yellow-400/50 transition-all cursor-pointer group flex items-center justify-between relative overflow-hidden shadow-lg"
                      >
                        <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-widest">
                          MAIS VENDIDO (80% OFF)
                        </div>
                        <div>
                          <div className="flex items-center gap-2 pr-12">
                            <span className="text-[10px] font-black uppercase text-yellow-300 tracking-wider flex items-center gap-1">
                              👑 Acesso Vitalício
                            </span>
                            <span className="text-[10px] text-amber-200/40 line-through font-bold">R$ 299,00</span>
                          </div>
                          <div className="text-xl font-black text-amber-300 mt-0.5">R$ 49,90 <span className="text-xs text-amber-200/60 font-normal">único</span></div>
                          <p className="text-[11px] text-amber-200/70 mt-1">Pague 1x e use PARA SEMPRE</p>
                        </div>
                        <button className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black rounded-xl shadow-md group-hover:scale-105 transition-all uppercase tracking-wider">
                          Garantir Stripe
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card de Segurança da Conta & Alteração de Senha */}
                <div className="mt-4 bg-[#141420]/90 rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-2xl text-amber-400">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-wider">Segurança da Conta & Senha</h3>
                        <p className="text-xs text-white/50">E-mail Cadastrado: <strong className="text-amber-300">{session?.user?.email || localStorage.getItem('pixel_user_email') || 'pixelartklk@gmail.com'}</strong></p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      ✓ CONTA ATIVA
                    </span>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Alterar Senha de Acesso</h4>

                    {passwordChangeSuccess && (
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                        <span>{passwordChangeSuccess}</span>
                      </div>
                    )}

                    {passwordChangeError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl flex items-center gap-2">
                        <span>{passwordChangeError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-1">Nova Senha</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres..."
                          className="w-full bg-white/5 hover:bg-white/10 focus:bg-black/60 border border-white/10 focus:border-amber-400 px-4 py-2.5 rounded-xl text-xs text-white outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-1">Confirmar Nova Senha</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita a nova senha..."
                          className="w-full bg-white/5 hover:bg-white/10 focus:bg-black/60 border border-white/10 focus:border-amber-400 px-4 py-2.5 rounded-xl text-xs text-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Lock size={15} />
                      <span>{isChangingPassword ? 'Atualizando Senha...' : '🔐 Atualizar Senha'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Seção da Galeria Pessoal do Artista */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2.5">
                    <Palette size={22} className="text-[var(--accent-color)]" /> Desenhos Salvos no Perfil
                  </h3>
                  <span className="text-xs font-semibold text-white/40 hidden sm:inline">
                    Toque em qualquer projeto para abrir no editor!
                  </span>
                </div>

                {savedProjects.length === 0 ? (
                  <div className="py-16 text-center bg-[#121216]/60 backdrop-blur-2xl rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3">
                    <Palette size={40} className="text-white/20" />
                    <p className="text-sm font-bold text-white/60">Sua galeria pessoal está vazia.</p>
                    <button 
                      onClick={() => { sound.playClick(); setActiveTab('home'); }} 
                      className="px-5 py-2.5 bg-[var(--accent-color)] text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                    >
                      Criar Novo Desenho
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {savedProjects.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => openProjectWithTransition(p)}
                        className="bg-[#121216]/90 hover:bg-[#16161c] rounded-2xl border border-white/10 hover:border-[var(--accent-color)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group flex flex-col overflow-hidden relative"
                      >
                        <div className="aspect-square bg-black/40 flex items-center justify-center p-3 relative overflow-hidden rounded-t-2xl border-b border-white/5">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain image-pixelated group-hover:scale-105 transition-transform duration-300 drop-shadow-md" />
                          ) : (
                            <Palette size={36} className="text-white/20" />
                          )}
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-[9px] font-bold text-white/90 px-2 py-0.5 rounded-full border border-white/10 tracking-wider uppercase">
                            {p.width}×{p.height}px
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold truncate text-xs text-white/90 group-hover:text-white transition-colors">{p.name}</h4>
                            <span className="text-[9px] font-bold text-[var(--accent-color)] tracking-wider uppercase">Abrir Projeto</span>
                          </div>
                          <Play size={16} className="text-white/30 group-hover:text-[var(--accent-color)] transition-all shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegação Inferior Removida */}

      {/* Modais fora das abas */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => setZoomedImage(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={zoomedImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl image-pixelated" />
          </motion.div>
        )}
        
        {showSettings && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={() => setShowSettings(false)}>
             <div className="bg-[var(--bg-panel)] w-full max-w-4xl p-8 rounded-[40px] border border-white/5 relative my-auto flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <h3 className="text-2xl font-black flex items-center gap-3"><Settings className="text-[var(--accent-color)]" /> ConfiguraÃ§Ãµes</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>
                
                <div className="flex flex-col gap-8">
                  {/* Themes */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Palette className="text-[var(--accent-color)]" /> Cores de Fundo (Temas)
                    </h4>
                    {/* Free Themes */}
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                      ✦ Cores Opacas & Suaves (Gratuitos)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
                      {themes.filter(t => FREE_THEME_IDS.has(t.id)).map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => changeTheme(theme.id)}
                          className={`relative flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all duration-200 ${currentThemeId === theme.id ? 'border-emerald-400 bg-emerald-400/10 scale-105 shadow-lg shadow-emerald-500/10' : 'border-white/5 bg-white/5 hover:border-white/20 hover:-translate-y-1'}`}
                        >
                          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-inner flex relative border border-white/10" style={{ backgroundColor: theme.colors.bgApp }}>
                            <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors.bgSurface }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-lg border-2 shadow" style={{ backgroundColor: theme.colors.accentColor, borderColor: theme.colors.bgElement }}></div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-center text-white/90">{theme.name}</span>
                          {currentThemeId === theme.id && <span className="absolute top-2 right-2 text-emerald-400 bg-black/40 rounded-full p-0.5"><Check size={12} /></span>}
                        </button>
                      ))}
                    </div>

                    {/* PRO Animated Themes */}
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                      <Star size={12} className="fill-amber-400 text-amber-400 animate-pulse" /> 👑 Temas Animados & Cinemáticos (PRO) {!isPro && <Lock size={11} className="ml-1 opacity-70" />}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[40vh] overflow-y-auto pr-2">
                      {themes.filter(t => !FREE_THEME_IDS.has(t.id)).map((theme) => {
                        const isActive = currentThemeId === theme.id;
                        const isLocked = !isPro;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => changeTheme(theme.id)}
                            className={`relative flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                              isActive
                                ? 'border-amber-400 bg-amber-400/10 scale-105 shadow-xl shadow-amber-400/25 ring-2 ring-amber-400/50'
                                : isLocked
                                  ? 'border-amber-500/20 bg-white/[0.03] hover:border-amber-400/50 hover:-translate-y-1 group'
                                  : 'border-white/10 bg-white/5 hover:border-amber-400/40 hover:-translate-y-1'
                            }`}
                          >
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-2xl overflow-hidden shadow-xl flex relative border-2 border-amber-400/40 ${theme.animatedClass || ''}`} style={{ backgroundColor: theme.colors.bgApp }}>
                                <div className="w-1/2 h-full opacity-60" style={{ backgroundColor: theme.colors.bgSurface }}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-5 h-5 rounded-lg border-2 shadow-lg animate-pulse" style={{ backgroundColor: theme.colors.accentColor, borderColor: '#ffffff' }}></div>
                                </div>
                              </div>
                              {isLocked && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 text-black rounded-full flex items-center justify-center shadow-md font-black">
                                  <Lock size={10} />
                                </div>
                              )}
                            </div>
                            <span className={`text-xs font-bold text-center ${isLocked ? 'text-amber-200/70' : 'text-white'}`}>{theme.name}</span>
                            {isActive && <span className="absolute top-2 right-2 text-amber-400 bg-black/60 rounded-full p-0.5"><Check size={12} /></span>}
                            {isLocked && (
                              <span className="absolute top-1.5 left-1.5 text-[8px] font-black text-amber-400 bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 rounded-full uppercase">PRO</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Audio */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      Ã udio e Sons
                    </h4>
                    <div className="space-y-4">
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="block font-bold">Efeitos Sonoros</span>
                          <span className="text-xs opacity-40 font-bold">Sons de interface</span>
                        </div>
                        <button onClick={toggleSfx} className={`w-14 h-7 rounded-full relative transition-colors ${sfxEnabled ? 'bg-[var(--accent-color)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${sfxEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="block font-bold">MÃºsica de Fundo</span>
                          <span className="text-xs opacity-40 font-bold">Ambiente relaxante</span>
                        </div>
                        <button onClick={toggleBgm} className={`w-14 h-7 rounded-full relative transition-colors ${bgmEnabled ? 'bg-[var(--accent-color)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${bgmEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Tutorials & Help */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <BookOpen className="text-[var(--accent-color)]" /> Tutoriais e Ajuda
                    </h4>
                    <div className="space-y-4">
                      <button onClick={() => { setShowSettings(false); setIsTutorialOpen(true); }} className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 flex items-center justify-between transition-colors text-left group">
                        <div>
                          <span className="block font-bold group-hover:text-[var(--accent-color)] transition-colors">Assistir Tutorial Novamente</span>
                          <span className="text-xs opacity-40 font-bold">Reveja o guia inicial passo a passo</span>
                        </div>
                        <PlayCircle size={24} className="text-[var(--accent-color)] opacity-50 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {showTutorials && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowTutorials(false)}>
             <div className="bg-[var(--bg-panel)] w-full max-w-2xl p-8 rounded-[40px] border border-white/5 relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><BookOpen className="text-[var(--accent-color)]" /> Diretrizes</h3>
                <div className="space-y-4 text-sm opacity-70 leading-relaxed font-bold">
                  <p>1. O Dragon Art Ã© uma ferramenta profissional de pixel art.</p>
                  <p>2. Suas artes sÃ£o de sua propriedade exclusiva.</p>
                  <p>3. Use gestos (2 dedos) para navegar livremente pela folha.</p>
                  <p>4. Toque com 2 dedos fora da folha para desfazer aÃ§Ãµes rapidamente.</p>
                </div>
                <button onClick={() => setShowTutorials(false)} className="mt-8 w-full p-4 bg-[var(--accent-color)] rounded-2xl font-black text-white transition-all">ENTENDI TUDO</button>
             </div>
          </div>
        )}


      </AnimatePresence>

      <OnboardingTutorial 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
        mode="menu" 
      />


      {/* ========== PRO FEATURES MODAL ========== */}
      <AnimatePresence>
        {showProModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowProModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-[32px] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-yellow-400/20"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-8 pb-4 text-center">
                <button onClick={() => setShowProModal(false)} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
                >
                  <Star size={40} className="text-black fill-black" />
                </motion.div>
                <h2 className="text-2xl font-black text-white">WyrmPIXEL PRO</h2>
                <p className="text-sm text-yellow-300/60 font-bold mt-1">Desbloqueie todo o poder criativo</p>
              </div>

              {/* Features List (Com trava interativa) */}
              <div className="px-6 pb-4 space-y-2.5">
                <p className="text-[11px] text-white/50 text-center font-bold mb-1">
                  Clique em qualquer recurso abaixo para desbloquear nos planos:
                </p>
                {[
                  { icon: '📐', title: 'Exportação HD / 4K / 8K / 16K', desc: 'Exporte suas artes em altíssima resolução para impressão e portfólio profissional' },
                  { icon: '✨', title: 'Sem Marca D\'água', desc: 'Suas artes limpas, sem nenhum logo sobreposto nas exportações' },
                  { icon: '🏅', title: 'Selos PRO Exclusivos', desc: 'Selos animados com efeitos de brilho para destacar seu perfil na comunidade' },
                  { icon: '📚', title: 'Camadas Ilimitadas', desc: 'Sem limite de layers por frame, trabalhe com composições complexas' },
                  { icon: '🎬', title: 'GIF HD / 4K', desc: 'Exporte suas animações em alta definição com qualidade profissional' },
                  { icon: '🖼️', title: 'Sprite Sheet HD', desc: 'Perfeito para game devs que precisam de assets em alta resolução' },
                  { icon: '🎨', title: 'Efeitos Avançados', desc: 'Acesso a todos os filtros e efeitos de imagem premium' },
                  { icon: '⚡', title: 'Prioridade de Suporte', desc: 'Atendimento prioritário e acesso antecipado a novas features' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      sound.playClick();
                      setSelectedFeatureNotice(feature.title);
                      if (plansSectionRef.current) {
                        plansSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                      selectedFeatureNotice === feature.title
                        ? 'bg-yellow-400/20 border-yellow-400 shadow-md shadow-yellow-400/20 scale-[1.02]'
                        : 'bg-white/[0.03] hover:bg-yellow-400/[0.08] border-white/5 hover:border-yellow-400/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{feature.icon}</span>
                      <div>
                        <h4 className="font-black text-white text-xs group-hover:text-yellow-300 transition-colors">{feature.title}</h4>
                        <p className="text-[10px] text-white/40 font-bold mt-0.5 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-[9px] font-black rounded-lg shrink-0 flex items-center gap-1 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                      <Lock size={10} />
                      REQUER PRO
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Seletor de Planos Promocionais Estratégicos */}
              <div ref={plansSectionRef} className="px-6 pb-5 space-y-3">
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-3 py-0.5 rounded-full border border-yellow-400/20">
                    ⚡ OFERTA PROMOCIONAL DE LANÇAMENTO
                  </span>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">Escolha o seu Plano Promocional</h4>
                </div>

                {selectedFeatureNotice && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="p-3 bg-gradient-to-r from-yellow-400/20 via-amber-500/25 to-yellow-400/20 border border-yellow-400/60 rounded-2xl text-center shadow-lg"
                  >
                    <p className="text-xs font-black text-yellow-300 flex items-center justify-center gap-1.5">
                      <span>🔓</span> Para liberar <span className="underline decoration-amber-400">{selectedFeatureNotice}</span>, escolha um plano abaixo:
                    </p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Plano Mensal */}
                  <div 
                    onClick={() => {
                      window.open(CONFIG.STRIPE_PRO_LINK, '_blank');
                      setShowProModal(false);
                    }}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group relative"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-white/50 tracking-wider">Assinatura Mensal</span>
                        <span className="text-[10px] text-white/30 line-through font-bold">R$ 29,90</span>
                      </div>
                      <div className="text-xl font-black text-white mt-1">
                        R$ 14,90 <span className="text-xs text-white/40 font-normal">/mês</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1 leading-tight">Renovação mensal flexível. Cancele quando quiser.</p>
                    </div>
                    <button className="w-full py-2 bg-white/10 group-hover:bg-yellow-400 group-hover:text-black text-white text-xs font-black rounded-xl transition-all uppercase tracking-wider">
                      Assinar Mensal
                    </button>
                  </div>

                  {/* Plano Vitalício - Estratégico & Recomendado */}
                  <div 
                    onClick={() => {
                      window.open(CONFIG.STRIPE_PRO_LINK, '_blank');
                      setShowProModal(false);
                    }}
                    className={`p-4 bg-gradient-to-br from-yellow-400/20 via-amber-500/25 to-yellow-500/20 hover:from-yellow-400/30 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden shadow-xl group ${
                      selectedFeatureNotice ? 'border-yellow-400 animate-pulse shadow-yellow-400/40 scale-[1.02]' : 'border-yellow-400/70'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest shadow-md">
                      MAIS VENDIDO (80% OFF)
                    </div>
                    <div>
                      <div className="flex items-center justify-between pr-14">
                        <span className="text-[10px] font-black uppercase text-yellow-300 tracking-wider flex items-center gap-1">
                          👑 Acesso Vitalício
                        </span>
                        <span className="text-[10px] text-amber-200/40 line-through font-bold">R$ 299,00</span>
                      </div>
                      <div className="text-2xl font-black text-amber-300 mt-1">
                        R$ 49,90 <span className="text-xs text-amber-200/60 font-normal">único</span>
                      </div>
                      <p className="text-[10px] text-amber-100/80 mt-1 font-bold leading-tight">
                        Pague 1x e use <span className="text-yellow-300 underline">PARA SEMPRE</span>. Sem mensalidades!
                      </p>
                    </div>
                    <button className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black rounded-xl shadow-lg group-hover:scale-105 transition-all uppercase tracking-wider flex items-center justify-center gap-1">
                      <span>Garantir Vitalício</span> 🚀
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-6 pt-0">
                <p className="text-center text-[10px] text-white/30 font-bold">Pagamento 100% seguro via Stripe • Acesso instantâneo às funções PRO</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== THEME PREVIEW OVERLAY ========== */}
      <AnimatePresence>
        {previewTheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex flex-col"
            style={{ backgroundColor: previewTheme.colors.bgApp }}
          >
            {/* Simulated editor background to show how the theme looks */}
            <div className="flex-1 relative overflow-hidden">
              {/* Top bar simulation */}
              <div className="h-12 flex items-center px-4 gap-3" style={{ backgroundColor: previewTheme.colors.bgSurface, borderBottom: `1px solid ${previewTheme.colors.borderSubtle}` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: previewTheme.colors.accentColor }} />
                <div className="h-2 w-20 rounded-full" style={{ backgroundColor: previewTheme.colors.bgElement }} />
                <div className="flex-1" />
                <div className="h-2 w-16 rounded-full" style={{ backgroundColor: previewTheme.colors.bgElement }} />
              </div>

              {/* Canvas area */}
              <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: previewTheme.colors.bgApp }}>
                {/* White drawing sheet */}
                <div className="w-[280px] h-[280px] bg-white rounded-lg shadow-2xl relative" style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${previewTheme.colors.borderSubtle}` }}>
                  {/* Simple pixel art grid preview */}
                  <div className="absolute inset-4 grid grid-cols-8 grid-rows-8 gap-px opacity-10">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="bg-gray-300" />
                    ))}
                  </div>
                  {/* Simple pixel art drawing */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="120" height="120" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
                      {/* Dragon silhouette */}
                      <rect x="3" y="0" width="2" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="2" y="1" width="4" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="1" y="2" width="6" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="2" y="3" width="4" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="3" y="4" width="2" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="2" y="5" width="1" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="5" y="5" width="1" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="1" y="6" width="2" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="5" y="6" width="2" height="1" fill={previewTheme.colors.accentColor} />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom panel simulation */}
              <div className="h-14 flex items-center justify-center gap-4 px-4" style={{ backgroundColor: previewTheme.colors.bgPanel, borderTop: `1px solid ${previewTheme.colors.borderSubtle}` }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-lg" style={{ backgroundColor: previewTheme.colors.bgElement }} />
                ))}
              </div>

              {/* Theme name badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full shadow-xl flex items-center gap-2"
                style={{ backgroundColor: previewTheme.colors.bgPanel, border: `1px solid ${previewTheme.colors.borderStrong}` }}
              >
                <Palette size={14} style={{ color: previewTheme.colors.accentColor }} />
                <span className="text-sm font-black" style={{ color: previewTheme.colors.textPrimary }}>{previewTheme.name}</span>
              </motion.div>
            </div>

            {/* Purchase overlay at bottom */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 p-5 pb-8"
              style={{ background: `linear-gradient(to top, ${previewTheme.colors.bgApp} 60%, transparent)` }}
            >
              <div className="max-w-md mx-auto flex flex-col gap-3">
                <div className="text-center">
                  <p className="text-xs font-bold opacity-60" style={{ color: previewTheme.colors.textSecondary }}>Este tema requer</p>
                  <h3 className="text-xl font-black flex items-center justify-center gap-2" style={{ color: previewTheme.colors.textPrimary }}>
                    <Star size={20} className="fill-yellow-400 text-yellow-400" /> Dragon Art PRO
                  </h3>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    cancelThemePreview();
                    setPreviewTheme(null);
                    setShowSettings(false);
                    setShowProModal(true);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-2xl text-black font-black text-base shadow-[0_0_30px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Star size={18} className="fill-black" /> DESBLOQUEAR TODOS OS TEMAS
                </motion.button>
                <button
                  onClick={cancelThemePreview}
                  className="w-full p-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 hover:bg-white/10"
                  style={{ color: previewTheme.colors.textMuted }}
                >
                  <X size={16} /> Voltar às configurações
                </button>
              </div>
            </motion.div>

            {/* Close button at top */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={cancelThemePreview}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ backgroundColor: `${previewTheme.colors.bgPanel}cc`, color: previewTheme.colors.textPrimary }}
            >
              <X size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAvatarPicker(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-panel)] rounded-[40px] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Escolha seu Avatar</h3>
                  <p className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mt-0.5">Fotos Profissionais & Dinâmicas</p>
                </div>
                <button onClick={() => setShowAvatarPicker(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Standard Avatars */}
                <div className="mb-8">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={14} /> Avatares Padrão
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {avatars.map((url, i) => (
                      <motion.button 
                        key={i} 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={async () => {
                          setProfileImage(url);
                          setShowAvatarPicker(false);
                          sound.playClick();
                          
                          localStorage.setItem('pixel_avatar', url);
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                          profileImage === url ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/20' : 'border-white/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} className="w-full h-full object-cover" />
                        {profileImage === url && <div className="absolute inset-0 bg-[var(--accent-color)]/20 flex items-center justify-center"><Check className="text-white bg-[var(--accent-color)] rounded-full p-1" size={16} /></div>}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* PRO Avatars */}
                <div className="mb-4">
                  <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Star size={14} className="fill-yellow-500" /> Avatares Animados PRO
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {proAvatars.map((url, i) => (
                      <motion.button 
                        key={i} 
                        whileHover={{ scale: isPro ? 1.05 : 1 }} 
                        whileTap={{ scale: isPro ? 0.95 : 1 }} 
                        onClick={async () => { 
                          if (isPro) {
                            setProfileImage(url); 
                            setShowAvatarPicker(false);
                            sound.playClick(); 
                            
                            localStorage.setItem('pixel_avatar', url);
                          } else {
                            alert('Este avatar animado é exclusivo para membros PRO! 🌟');
                          }
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                          profileImage === url ? 'border-yellow-500 ring-4 ring-yellow-500/20' : 'border-white/5'
                        } ${!isPro ? 'grayscale opacity-40' : 'hover:opacity-100'}`}
                      >
                        <img src={url} className="w-full h-full object-cover" />
                        {!isPro && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Lock size={16} className="text-white" />
                          </div>
                        )}
                        {profileImage === url && <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center"><Check className="text-white bg-yellow-500 rounded-full p-1" size={16} /></div>}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase text-center max-w-xs">Essas fotos aparecem no seu perfil de artista.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cinematic Transition Overlay */}
      <AnimatePresence>
        {openingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-[#0a0a0c] z-[99999] flex flex-col items-center justify-center gap-5 backdrop-blur-3xl"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1.15, rotate: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="relative p-4 bg-[var(--accent-color)]/10 rounded-3xl border border-[var(--accent-color)]/30 shadow-[0_0_50px_rgba(99,102,241,0.3)]"
            >
              <img 
                src="/logo.png" 
                alt="WyrmPIXEL Loading Logo" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain image-pixelated drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]" 
              />
            </motion.div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] animate-ping" />
                <span className="text-base font-black text-white tracking-widest uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  Abrindo {openingProject.name}...
                </span>
              </div>
              <p className="text-xs font-semibold text-white/40">Preparando tela de desenho e camadas...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal do Livro E-Book de Pixel Art */}
      <EbookModal 
        isOpen={showEbookModal} 
        onClose={() => setShowEbookModal(false)} 
        isPro={isPro}
        onOpenProModal={() => setShowProModal(true)}
      />
    </div>
  );
}
