const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');

const inputFile = './ui/scripts.js';
const outputFile = './ui/scripts-obfuscated.js';

const code = fs.readFileSync(inputFile, 'utf8');
const obfuscated = JavaScriptObfuscator.obfuscate(code, {
  compact: true,
  controlFlowFlattening: true,
  deadCodeInjection: true,
  stringArray: true,
  stringArrayThreshold: 0.75,
});
fs.writeFileSync(outputFile, obfuscated.getObfuscatedCode());
console.log('Obfuscation complete');