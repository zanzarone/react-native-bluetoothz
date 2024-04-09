const path = require('path');
const fs = require('fs');
const tar = require('tar');
const { name, version } = require('../package.json');
const { execSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const dest = path.join(root, `example/node_modules/${name}`);
const bin = path.join(root, `bin/`);

console.log('PRE FLIGHT SCRIPT ', name, version);

function pre() {
  console.log('pre ', root, dest, name, version);
  let oldPath = path.join(root, `${name}-${version}.tgz`);
  console.log('aft ', oldPath);
  if (fs.existsSync(oldPath)) fs.rmSync(oldPath);
  oldPath = path.join(root, `${name}`);
  if (fs.existsSync(oldPath)) fs.rmSync(oldPath, { recursive: true });
}

function move() {
  console.log('move ', name, version);
  tar.x({ file: path.join(root, `${name}-${version}.tgz`), sync: true });
  fs.renameSync(path.join(root, 'package'), `${name}`);
}

function copyFiles(sourceDir, targetDir) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  // Read all files and directories in the source directory
  fs.readdir(sourceDir, { withFileTypes: true }, (err, files) => {
    if (err) throw err;

    // Iterate through each file/directory
    files.forEach((file) => {
      const sourcePath = path.join(sourceDir, file.name);
      const targetPath = path.join(targetDir, file.name);

      // Check if it's a file or a directory
      if (file.isDirectory()) {
        // If it's a directory, recursively copy it
        copyFiles(sourcePath, targetPath);
      } else {
        // If it's a file, copy it
        fs.copyFile(sourcePath, targetPath, (err) => {
          if (err) throw err;
          console.log(`${file.name} copied successfully.`);
        });
      }
    });
  });
}

function copy() {
  console.log('copy ', name, version);
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
  fs.mkdirSync(dest);
  copyFiles(path.join(root, `${name}`), dest);
  // fs.renameSync(path.join(root, `${name}`), dest);
}

pre();
execSync('npm pack');
move();
copy();
