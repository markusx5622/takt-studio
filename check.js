const ts = require('typescript');
const fs = require('fs');

const configPath = ts.findConfigFile(
  "c:/Users/es00700248/Desktop/Personal/takt-studio",
  ts.sys.fileExists,
  "tsconfig.json"
);

if (!configPath) {
  throw new Error("Could not find a valid 'tsconfig.json'.");
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  "c:/Users/es00700248/Desktop/Personal/takt-studio"
);

const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
const allDiagnostics = ts.getPreEmitDiagnostics(program);

let hasError = false;
allDiagnostics.forEach(diagnostic => {
  if (diagnostic.file) {
    let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    hasError = true;
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
});

if (!hasError) console.log("No type errors found!");
