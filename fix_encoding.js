const fs = require('fs');
const path = require('path');

const safeReplacements = [
  [/VocǦ/g, 'Você'],
  [/Voc/g, 'Você'],
  [/exportaǟǟo/g, 'exportação'],
  [/exportaǜo/g, 'exportação'],
  [/AvanÃ§ado/g, 'Avançado'],
  [/IntermediÃ¡rio/g, 'Intermediário'],
  [/ðŸŒ±/g, '🌱'],
  [/âš¡/g, '⚡'],
  [/ðŸ”¥/g, '🔥'],
  [/ðŸ‘‘/g, '👑'],
  [/NÃ£o/g, 'Não'],
  [/JÃ¡/g, 'Já'],
  [/FaÃ§a/g, 'Faça'],
  [/ConfiguraÃ§Ãµes/g, 'Configurações'],
  [/MÃºsica/g, 'Música'],
  [/Ã udio/g, 'Áudio'],
  [/aÃ§Ãµes/g, 'ações'],
  [/AÃ§Ãµes/g, 'Ações'],
  [/sÃ£o/g, 'são'],
  [/SÃ£o/g, 'São'],
  [/Ã©/g, 'é'],
  [/Coleǜo/g, 'Coleção'],
  [/versǜo/g, 'versão'],
  [/usuǟrios/g, 'usuários'],
  [/Gravaǜo/g, 'Gravação'],
  [/funǜo/g, 'função'],
  [/atǸ/g, 'até'],
  [/YOY/g, '😢'],
  [/YZ/g, '🎥'],
  [/grtis/gi, 'grátis'],
  [/Inicio/gi, 'Início'],
  [/avanadas/gi, 'avançadas'],
  [/animaes/gi, 'animações'],
  [/resolues/gi, 'resoluções'],
  [/estdio/gi, 'estúdio'],
  [/As obras que voc desenha no canvas so 100% suas/g, 'As obras que você desenha no canvas são 100% suas'],
  [/Voc detm todo/g, 'Você detém todo'],
  [/verso gratuita/g, 'versão gratuita'],
  [/incrveis/g, 'incríveis'],
  [/prximo/g, 'próximo'],
  [/nvel/g, 'nível'],
  [/Voc atingiu/g, 'Você atingiu'],
  [/lendrio/g, 'lendário'],
  [/Voc pode/g, 'Você pode'],
  [/marca d\\'gua/g, "marca d'água"],
  [/VocÃª/g, 'Você'],
  [/ComeÃ§ando/g, 'Começando']
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [regex, replacement] of safeReplacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}
processDir('src');
