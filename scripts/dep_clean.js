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

const readline = require('readline');

// Crea un'interfaccia per leggere l'input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function step2() {
  rl.question('a. Rebuild Android\nb. Rebuild All\nd. Nothing\n', (answer) => {
    if (answer !== 'a' && answer !== 'b' && answer !== 'c' && answer !== 'd') {
      step2();
      return;
    }
    rl.close();
    if (answer === 'd') {
      return;
    }
    console.log('removing react-native-bluetoothz...');
    execSync(`npm r react-native-bluetoothz --prefix ${exampleDIR}`, {
      stdio: 'inherit',
    });
    if (answer === 'b') {
      console.log('removing react-native-bluetoothz POD...');
      execSync(`cd ${path.join(exampleDIR, 'ios')} && pod install`, {
        stdio: 'inherit',
      });
    }
    console.log('installing react-native-bluetoothz...');
    execSync(`npm i react-native-bluetoothz --prefix ${exampleDIR}`, {
      stdio: 'inherit',
    });
    console.log('running preflight script...');
    execSync(`npm run preflight`, {
      stdio: 'inherit',
    });
    if (answer === 'b') {
      console.log('installing react-native-bluetoothz POD...');
      execSync(`cd ${path.join(exampleDIR, 'ios')} && pod install`, {
        stdio: 'inherit',
      });
    }
    console.log('packing library...');
    execSync('npm pack');
    console.log('Done.');
  });
}

// Chiedi all'utente di inserire qualcosa
rl.question('\n > Are you sure you want to run dep-clean? [Y/n] ', (answer) => {
  // Chiudi l'interfaccia dopo aver ottenuto l'input
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    step2();
  } else {
    rl.close();
    console.log('Script execution canceled.');
  }
});

// Gestisci l'evento di chiusura dell'interfaccia
rl.on('close', () => {
  console.log('Input terminato.');
});
