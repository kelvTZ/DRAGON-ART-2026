/**
 * CONFIGURAÇÃO GLOBAL DO DRAGON ART
 * Altere estas informações para personalizar sua plataforma.
 */
export const CONFIG = {
  // LINKS DO STRIPE
  STRIPE_MONTHLY_LINK: "https://buy.stripe.com/test_dRmbJ00FW91e6NU10SaIM01",
  STRIPE_PRO_LINK: "https://buy.stripe.com/test_5kQfZgagw4KYa06fVMaIM02",
  
  // INFORMAÇÕES DA PLATAFORMA
  VERSION: "1.13.1",
  APP_NAME: "WyrmPIXEL",
  PLATFORM_NAME: "WyrmPIXEL Studio",
  
  // LINKS DE DOWNLOAD / REDES SOCIAIS
  DOWNLOAD_APK_URL: "https://drive.google.com/uc?export=download&id=1TWz60_idJJy5mBWfi1Ng-l2s81_ZshdU",
  INSTAGRAM_URL: "https://www.instagram.com/dragonart_pixel/",
  DISCORD_URL: "https://discord.gg/gFvckFY5",
  
  // CONFIGURAÇÕES DA COMUNIDADE
  MAX_POSTS_PER_PAGE: 20,
  
  // CONFIGURAÇÕES DO SUPABASE
  SUPABASE_URL: (import.meta as any).env?.VITE_SUPABASE_URL || "https://sggovojcazdfdkjsqzfm.supabase.co",
  SUPABASE_ANON_KEY: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_IJnpMH1ZJ1j6t-clyqNSjg_iqXFQ_Y_",

  WEB_URL: "http://192.168.3.172:3000",
};
