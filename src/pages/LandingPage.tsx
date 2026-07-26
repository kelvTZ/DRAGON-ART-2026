import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Star, BookOpen, Download, Palette, Lock, 
  Check, ArrowRight, Shield, Zap, Flame, Eye, ChevronDown, 
  ChevronRight, Play, ZoomIn, X, Users, Smartphone, Monitor, ChevronLeft, Layers, Bookmark
} from 'lucide-react';
import { CONFIG } from '../config';
import { sound } from '../sound';
import { EBOOK_CHAPTERS, EbookModal } from '../components/EbookModal';

interface LandingPageProps {
  onEnterApp: () => void;
  isPro?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, isPro = false }) => {
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomTitle, setZoomTitle] = useState<string>('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const sampleChapters = EBOOK_CHAPTERS.slice(0, 8);

  const currentZoomIndex = zoomImage 
    ? EBOOK_CHAPTERS.findIndex(c => c.image === zoomImage) 
    : -1;

  const handleNextZoom = () => {
    if (currentZoomIndex >= 0 && currentZoomIndex < EBOOK_CHAPTERS.length - 1) {
      const nextCh = EBOOK_CHAPTERS[currentZoomIndex + 1];
      setZoomImage(nextCh.image);
      setZoomTitle(`Capítulo ${nextCh.number}: ${nextCh.title}`);
      sound.playClick();
    }
  };

  const handlePrevZoom = () => {
    if (currentZoomIndex > 0) {
      const prevCh = EBOOK_CHAPTERS[currentZoomIndex - 1];
      setZoomImage(prevCh.image);
      setZoomTitle(`Capítulo ${prevCh.number}: ${prevCh.title}`);
      sound.playClick();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090e] text-white font-sans overflow-x-hidden selection:bg-amber-400 selection:text-black">
      
      {/* 1. NAVBAR FIXA */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0c0c14]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onEnterApp}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <img src="/logo.png" alt="Dragon Art Logo" className="w-full h-full object-contain image-pixelated" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              Dragon<span className="text-amber-400">ART</span>
            </h1>
            <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest block -mt-1">
              WyrmPIXEL Studio v1.17.0
            </span>
          </div>
        </div>

        {/* Links Centrais */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-white/70">
          <a href="#recursos" className="hover:text-amber-400 transition-colors">Recursos</a>
          <a href="#ebook" className="hover:text-amber-400 transition-colors flex items-center gap-1">
            <BookOpen size={14} className="text-amber-400" />
            <span>Livro E-Book (66 Caps)</span>
          </a>
          <a href="#precos" className="hover:text-amber-400 transition-colors">Planos & Preços</a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">Perguntas Frequentes</a>
        </div>

        {/* Ações Diretas */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sound.playClick(); onEnterApp(); }}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Entrar no Estúdio</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center flex flex-col items-center justify-center">
        {/* Luzes de Fundo Cinemáticas */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/20 via-yellow-500/15 to-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Badge Flutuante */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-6 shadow-xl"
        >
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>ESTÚDIO DE PIXEL ART & E-BOOK MESTRE ILUSTRADO</span>
        </motion.div>

        {/* Título Principal */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.1] max-w-5xl"
        >
          Transforme Suas Ideias em <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">Pixel Arts Profissionais</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm sm:text-base md:text-lg text-gray-300 font-medium max-w-3xl leading-relaxed"
        >
          O aplicativo definitivo para ilustradores, game devs e entusiastas. Desenhe em alta precisão, anime quadros por quadro, exporte em HD/4K e aprenda com o nosso <strong className="text-amber-300 underline">E-Book Sagrado do Pixel Art com 66 Capítulos Ilustrados</strong>.
        </motion.p>

        {/* Botões de Ação Principal (CTAs) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => { sound.playClick(); onEnterApp(); }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 group"
          >
            <Palette size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Começar a Desenhar Agora</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => { sound.playClick(); setShowEbookModal(true); }}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-black text-sm uppercase tracking-wider rounded-2xl border border-white/20 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
          >
            <BookOpen size={20} className="text-amber-400" />
            <span>Ver E-Book (66 Capítulos)</span>
          </button>
        </motion.div>

        {/* Métricas e Garantias */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-8 flex-wrap text-xs font-bold text-white/60 border-t border-white/10 pt-6 max-w-4xl w-full"
        >
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400"><Star size={14} className="fill-amber-400" /><Star size={14} className="fill-amber-400" /><Star size={14} className="fill-amber-400" /><Star size={14} className="fill-amber-400" /><Star size={14} className="fill-amber-400" /></div>
            <span>Nota 4.9/5 por Artistas</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-amber-400" />
            <span>Disponível para Web & APK Android</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-amber-400" />
            <span>Sem Mensalidades Obrigatórias</span>
          </div>
        </motion.div>
      </section>

      {/* 3. VITRINE DO E-BOOK DE PIXEL ART (66 CAPÍTULOS ILUSTRADOS) */}
      <section id="ebook" className="py-20 px-4 sm:px-8 bg-gradient-to-b from-[#0c0c14] via-[#120f1c] to-[#09090e] border-y border-amber-500/20 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 inline-block shadow-md">
              📖 O LIVRO SAGRADO DO PIXEL ART
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
              66 Capítulos Ilustrados com <span className="text-amber-400">Zoom HD</span>
            </h2>
            <p className="text-sm text-gray-300 font-medium leading-relaxed">
              Confira uma amostragem dos capítulos do livro oficial! Clique em qualquer imagem abaixo para ver a arte ampliada em tela cheia antes mesmo de entrar no estúdio.
            </p>
          </div>

          {/* Grid de Prévia dos Capítulos do E-Book com Zoom HD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sampleChapters.map((ch) => {
              const isLocked = ch.number > 10 && !isPro;

              return (
                <div 
                  key={ch.id}
                  onClick={() => {
                    sound.playClick();
                    if (isLocked) {
                      setShowEbookModal(true);
                    } else {
                      setZoomImage(ch.image);
                      setZoomTitle(`Capítulo ${ch.number}: ${ch.title}`);
                    }
                  }}
                  className="bg-[#141420] rounded-3xl border border-white/10 hover:border-amber-400 transition-all duration-300 shadow-xl overflow-hidden cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-black/60 overflow-hidden">
                    <img 
                      src={ch.image} 
                      alt={ch.title} 
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        isLocked ? 'filter blur-[2px] grayscale brightness-60' : ''
                      }`}
                      loading="lazy"
                    />

                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/40">
                      CAPÍ. {ch.number}
                    </div>

                    <div className="absolute top-3 right-3">
                      {ch.number <= 10 ? (
                        <span className="bg-emerald-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ✓ GRÁTIS
                        </span>
                      ) : (
                        <span className="bg-amber-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Lock size={9} /> PRO
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                      <ZoomIn size={24} className="text-amber-400 mb-1" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">AMPLIAR EM HD</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                        {ch.categoryName}
                      </span>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {ch.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1 line-clamp-2">
                        {ch.summary}
                      </p>
                    </div>

                    <button 
                      className="w-full py-2 bg-white/5 group-hover:bg-amber-400 group-hover:text-black text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <ZoomIn size={14} />
                      <span>{isLocked ? 'Desbloquear no PRO' : 'Ampliar Imagem'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chamada para Abrir Todo o E-Book (66 Caps) */}
          <div className="mt-12 text-center">
            <button
              onClick={() => { sound.playClick(); setShowEbookModal(true); }}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/25 active:scale-95 transition-all inline-flex items-center gap-3"
            >
              <BookOpen size={20} />
              <span>Acessar o Livro Completo (66 Capítulos)</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </section>

      {/* 4. RECURSOS DO APLICATIVO */}
      <section id="recursos" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 inline-block">
            ⚡ FERRAMENTAS PROFISSIONAIS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            Tudo o que Você Precisa para <span className="text-amber-400">Criar Arte Retrô</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '🎨',
              title: 'Canvas Personalizado 512x512',
              desc: 'Crie desenhos desde ícones clássicos 16x16 até ilustrações gigantescas de 512x512 com controle total por pixels.'
            },
            {
              icon: '🎬',
              title: 'Animação em Frames & Timeline',
              desc: 'Construa animações fluídas por quadros com suporte a Onion Skinning (Papel Vegetal) e taxa de quadros ajustável.'
            },
            {
              icon: '🚀',
              title: 'Exportação em 4K e GIF HD',
              desc: 'Exporte suas criações sem perda de qualidade em PNG, JPG ou GIF animado diretamente para redes sociais e jogos.'
            },
            {
              icon: '📱',
              title: 'Gerenciador de 10 Contas no APK',
              desc: 'Crie e alterne facilmente entre até 10 contas no aplicativo Android com proteção por biometria ou senha do celular.'
            },
            {
              icon: '🌌',
              title: 'Temas Animados & Cinemáticos PRO',
              desc: 'Personalize seu estúdio com fundos animados como Eclipse Roxo, Aurora Boreal, Pulso Cyberpunk e Chama Dracônica.'
            },
            {
              icon: '📺',
              title: 'Filtro CRT Retrô & Pincel Dithering',
              desc: 'Simule o visual clássico de TVs de tubo de raio catódico e aplique padrões de sombreamento quadriculado em 1 toque.'
            }
          ].map((feature, i) => (
            <div key={i} className="bg-[#12121c] p-8 rounded-[32px] border border-white/10 hover:border-amber-400/50 transition-all duration-300 shadow-xl space-y-4 group hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PLANOS E PREÇOS */}
      <section id="precos" className="py-20 px-4 sm:px-8 bg-gradient-to-b from-[#09090e] via-[#14101e] to-[#09090e] border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 inline-block">
              👑 ADQUIRA SEU ACESSO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              Escolha o Plano Ideal para Você
            </h2>
            <p className="text-sm text-gray-300 font-medium">
              Acesso imediato no aplicativo web e no APK Android.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Plano Gratuito */}
            <div className="bg-[#12121a] p-8 rounded-[36px] border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-white/50 tracking-widest block">PLANO GRATUITO</span>
                <div className="text-3xl font-black text-white">R$ 0,00</div>
                <p className="text-xs text-gray-400 font-bold">Ideal para começar seus primeiros desenhos pixelados.</p>
                <ul className="space-y-3 pt-4 border-t border-white/10 text-xs font-medium text-gray-300">
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> 10 Capítulos Gratuitos do E-Book</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Desenho em Canvas 16x16 até 120x120</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Exportação de PNG Padrão</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> 7 Temas Opacos Gratuitos</li>
                </ul>
              </div>

              <button
                onClick={() => { sound.playClick(); onEnterApp(); }}
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider rounded-2xl border border-white/10 transition-all"
              >
                Usar Versão Gratuita
              </button>
            </div>

            {/* Plano Vitalício (Destaque Principal) */}
            <div className="bg-gradient-to-br from-amber-950/90 via-[#1e1708] to-[#161024] p-8 rounded-[36px] border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                👑 RECOMENDADO (80% OFF)
              </div>

              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-amber-300 tracking-widest block">ACESSO VITALÍCIO PRO</span>
                <div>
                  <span className="text-xs text-amber-200/50 line-through font-bold">R$ 299,00</span>
                  <div className="text-4xl font-black text-amber-300 mt-1">
                    R$ 49,90 <span className="text-xs text-amber-200/70 font-normal">pagamento único</span>
                  </div>
                </div>
                <p className="text-xs text-amber-100/90 font-bold">Pague uma única vez e use PARA SEMPRE no Web e APK Android.</p>

                <ul className="space-y-3 pt-4 border-t border-amber-500/30 text-xs font-bold text-amber-100/90">
                  <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" /> Acesse o E-Book Completo (66 Capítulos)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" /> Exportação HD / 4K Sem Marca d’Água</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" /> Desenho Personalizado até 512x512</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" /> 8 Temas Animados & Cinemáticos PRO</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-amber-400" /> Suporte Prioritário & Atualizações Futuras</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  window.open(CONFIG.STRIPE_PRO_LINK, '_blank');
                }}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Star size={18} className="fill-black" />
                <span>Garantir Acesso Vitalício PRO</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FAQ (PERGUNTAS FREQUENTES) */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30 inline-block">
            ❓ TIRE SUAS DÚVIDAS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Como funciona o acesso ao E-Book de 66 Capítulos?',
              a: 'Os primeiros 10 capítulos são totalmente gratuitos no aplicativo. Para liberar o acesso completo aos capítulos 11 a 66 com zoom HD em todas as páginas, basta adquirir a conta PRO Vitalícia!'
            },
            {
              q: 'O aplicativo funciona offline no celular Android?',
              a: 'Sim! Ao instalar o APK DragonPIXEL v1.17.0 no seu celular Android, todo o aplicativo e as imagens do E-Book funcionam 100% offline sem consumir sua internet.'
            },
            {
              q: 'O pagamento do plano PRO é único ou mensalidade?',
              a: 'O plano PRO Vitalício de R$ 49,90 é um pagamento 100% ÚNICO. Você não paga mensalidades e tem acesso liberado para sempre.'
            },
            {
              q: 'Posso usar minhas pixel arts para comercializar meus jogos?',
              a: 'Com certeza! Todas as artes que você criar no Dragon Art são 100% suas, livres para uso em jogos comerciais na Steam, Google Play, itch.io ou redes sociais.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => { sound.playClick(); setActiveFaq(activeFaq === idx ? null : idx); }}
                className="w-full p-5 text-left font-black text-sm text-white flex items-center justify-between gap-4 hover:text-amber-300 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown size={18} className={`transition-transform ${activeFaq === idx ? 'rotate-180 text-amber-400' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 text-xs text-gray-300 font-medium leading-relaxed border-t border-white/5 bg-black/20">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 px-4 sm:px-8 bg-[#06060a] border-t border-white/10 text-center space-y-6 text-xs text-white/50 font-bold">
        <div className="flex items-center justify-center gap-3">
          <img src="/logo.png" alt="Dragon Art" className="w-8 h-8 object-contain image-pixelated" />
          <span className="text-white text-sm font-black uppercase tracking-wider">DragonART Studio</span>
        </div>
        <p className="max-w-md mx-auto leading-relaxed">
          Sua plataforma definitiva de criação em Pixel Art e estudo de técnicas clássicas e modernas.
        </p>

        <div className="flex items-center justify-center gap-6 text-xs font-bold text-white/70">
          <button onClick={onEnterApp} className="hover:text-amber-400 transition-colors">Entrar no Estúdio</button>
          <button onClick={() => setShowEbookModal(true)} className="hover:text-amber-400 transition-colors">E-Book (66 Caps)</button>
          <a href={CONFIG.INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Instagram Oficial</a>
        </div>

        <div className="pt-6 border-t border-white/5 text-[10px] text-white/40 font-semibold">
          © 2026 DragonART WyrmPIXEL Studio v1.17.0 • Todos os direitos reservados.
        </div>
      </footer>

      {/* MODAL DO E-BOOK DE PIXEL ART */}
      <EbookModal 
        isOpen={showEbookModal} 
        onClose={() => setShowEbookModal(false)} 
        isPro={isPro}
        onOpenProModal={() => window.open(CONFIG.STRIPE_PRO_LINK, '_blank')}
      />

      {/* LIGHTBOX DE ZOOM INDIVIDUAL DAS IMAGENS NA LANDING PAGE */}
      {zoomImage && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setZoomImage(null)}
        >
          <div className="w-full max-w-5xl flex items-center justify-between gap-4 text-white z-10" onClick={e => e.stopPropagation()}>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">MODO VISUALIZAÇÃO EM HD</span>
              <h3 className="text-base sm:text-lg font-black text-white drop-shadow-md">{zoomTitle}</h3>
            </div>
            <button 
              onClick={() => { sound.playClick(); setZoomImage(null); }}
              className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all active:scale-95 shadow-2xl flex items-center gap-2 font-bold text-xs"
            >
              <span>Fechar</span>
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <motion.img 
              key={zoomImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 25 }}
              src={zoomImage} 
              alt={zoomTitle} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 image-pixelated"
            />

            {currentZoomIndex > 0 && (
              <button 
                onClick={handlePrevZoom}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3.5 bg-black/80 hover:bg-amber-400 hover:text-black text-white rounded-full border border-white/20 shadow-2xl transition-all active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {currentZoomIndex < EBOOK_CHAPTERS.length - 1 && (
              <button 
                onClick={handleNextZoom}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3.5 bg-black/80 hover:bg-amber-400 hover:text-black text-white rounded-full border border-white/20 shadow-2xl transition-all active:scale-95"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          <div className="text-center text-xs font-bold text-white/60 z-10" onClick={e => e.stopPropagation()}>
            <span>Pressione <kbd className="px-2 py-1 bg-white/10 rounded text-amber-400">ESC</kbd> ou toque fora para sair. Use as setas para navegar pelos capítulos.</span>
          </div>
        </motion.div>
      )}

    </div>
  );
};
