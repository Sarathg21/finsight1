const fs = require('fs');
let code = fs.readFileSync('src/services/bsApi.js', 'utf8');

code = code.replace(
  "return val && val !== 'All' && val !== 'all' ? val : undefined;",
  "if (typeof val === 'object' && val !== null && val.period) return val.period;\n      return val && val !== 'All' && val !== 'all' ? val : undefined;"
);

fs.writeFileSync('src/services/bsApi.js', code);
