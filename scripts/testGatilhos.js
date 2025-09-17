const fs = require('fs');
const path = require('path');
const gatPath = path.join(process.cwd(), 'data', 'gatilhos.json');
let data = {};
try { data = JSON.parse(fs.readFileSync(gatPath, 'utf8')); } catch(e){ console.error('Erro lendo gatilhos.json', e); process.exit(2); }

const normalize = (s) => String(s || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\w\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

const testMessages = [
  'e uma batata crinkles',
  'batata crinkle',
  'crinkles',
  'qual x da questao'
];

for (const msg of testMessages) {
  const normalizedMsg = normalize(msg);
  const tokens = normalizedMsg.split(/\s+/).filter(Boolean);
  console.log('\n--- MSG:', msg, '->', normalizedMsg);
  for (const [id, gatilho] of Object.entries(data)) {
    for (const palavraRaw of (gatilho.palavras || [])) {
      const palavra = normalize(palavraRaw);
      if (!palavra) continue;
      let encontrou = false;
      if (/\s+/.test(palavra)) {
        const phrasePattern = '\\b' + palavra.split(/\s+/).map(p => escapeRegex(p)).join('\\s+') + '\\b';
        const re = new RegExp(phrasePattern, 'i');
        if (re.test(normalizedMsg)) encontrou = true;
      } else {
        if (tokens.includes(palavra)) encontrou = true;
      }
      if (encontrou) console.log('MATCH ->', id, gatilho.palavras, 'normalized->', palavra);
    }
  }
}

console.log('\nDone');
