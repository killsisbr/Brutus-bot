const carrinhoService = require('./src/services/carrinhoService');

console.log('Carrinhos em memória:', Object.keys(carrinhoService.carrinhos).length);

Object.keys(carrinhoService.carrinhos).forEach(id => {
  const c = carrinhoService.carrinhos[id];
  console.log(`ID: ${id}`);
  console.log(`  Estado: ${c.estado}`);
  console.log(`  Total: ${c.valorTotal}`);
  console.log(`  TS: ${c.ts}`);
  console.log(`  Data: ${c.ts ? new Date(c.ts).toLocaleString() : 'N/A'}`);
  console.log('---');
});