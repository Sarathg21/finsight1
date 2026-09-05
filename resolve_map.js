const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

async function resolve() {
  const mapPath = fs.readdirSync('dist/assets').find(f => f.endsWith('.js.map'));
  const rawMap = fs.readFileSync('dist/assets/' + mapPath, 'utf8');
  
  const consumer = await new SourceMapConsumer(rawMap);
  const pos = consumer.originalPositionFor({
    line: 2538,
    column: 85229
  });
  console.log(pos);
}
resolve();
