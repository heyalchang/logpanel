const base = require('../../tailwind.config.ts');
module.exports = {
  ...base,
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
}; 