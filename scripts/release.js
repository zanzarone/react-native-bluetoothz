const path = require('path');
const fs = require('fs');
const tar = require('tar');
const { name, version } = require('../package.json');
const { execSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const exampleAppNodeModulesFolder = path.join(root, `example/node_modules`);
// const exampleAppNodeModulesFolder = path.join(root, `example/node_modules/${name}`);

console.log('PRE FLIGHT SCRIPT ', name, version);

function pre() {
  console.log('pre ', root, exampleAppNodeModulesFolder, name, version);
  let tarGZ = path.join(root, `${name}-${version}.tgz`);
  console.log('aft ', tarGZ);
  if (fs.existsSync(tarGZ)) fs.rmSync(tarGZ);
  const oldPath = path.join(root, 'extract');
  if (fs.existsSync(oldPath)) fs.rmSync(oldPath, { recursive: true });
}

function move() {
  const extractFolder = path.join(root, 'extract');
  if (!fs.existsSync(extractFolder)) {
    fs.mkdirSync(extractFolder);
  }
  console.log('move ', name, version);
  tar.x({
    cwd: extractFolder,
    file: path.join(root, `${name}-${version}.tgz`),
    sync: true,
  });
  fs.renameSync(
    path.join(extractFolder, 'package'),
    path.join(extractFolder, `${name}`)
  );
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
  const extractFolder = path.join(root, 'extract', `${name}`);
  if (fs.existsSync(exampleAppNodeModulesFolder)) {
    const moduleFolder = path.join(exampleAppNodeModulesFolder, name);
    if (fs.existsSync(moduleFolder)) {
      fs.rmSync(moduleFolder, { recursive: true });
    }
    fs.mkdirSync(moduleFolder);
    copyFiles(extractFolder, exampleAppNodeModulesFolder);
  }
  copyFiles(extractFolder, path.join(root, `${name}`));
}

pre();
execSync('npm pack');
move();
copy();
