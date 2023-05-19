const path = require('path');
// const fs = require('fs');
// const tar = require('tar');
// const { name, version } = require('../package.json');
const { execSync } = require('child_process');
const root = path.resolve(__dirname, '..');
// const dest = path.join(root, `example/node_modules/${name}`);

// console.log('PRE FLIGHT SCRIPT ', name, version);

// function pre() {
//   console.log('pre ', name, version);
//   let oldPath = path.join(root, `${name}-${version}.tgz`);
//   if (fs.existsSync(oldPath)) fs.rmSync(oldPath);
//   oldPath = path.join(root, `${name}`);
//   if (fs.existsSync(oldPath)) fs.rmSync(oldPath, { recursive: true });
// }

// function move() {
//   console.log('move ', name, version);
//   tar.x({ file: path.join(root, `${name}-${version}.tgz`), sync: true });
//   fs.renameSync(path.join(root, 'package'), `${name}`);
// }

// function copy() {
//   console.log('copy ', name, version);
//   if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
//   fs.renameSync(path.join(root, `${name}`), dest);
// }
const exampleDIR = path.join(root, 'example');
console.log(root, exampleDIR);
// execSync(`cd ${path.join(root, 'example')}`, { stdio: 'inherit' });
// execSync('cwd', { stdio: 'inherit' });
execSync(`npm r react-native-bluetoothz --prefix ${exampleDIR}`, {
  stdio: 'inherit',
});
execSync(`cd ${path.join(exampleDIR, 'ios')} && pod install`, {
  stdio: 'inherit',
});
execSync(`npm i react-native-bluetoothz --prefix ${exampleDIR}`, {
  stdio: 'inherit',
});
execSync(`npm run preflight`, {
  stdio: 'inherit',
});
execSync(`cd ${path.join(exampleDIR, 'ios')} && pod install`, {
  stdio: 'inherit',
});
// execSync('npm pack');
