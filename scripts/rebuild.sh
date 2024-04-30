echo "=======================";
echo "Cleaning all the things";
echo "=======================";
# watchman watch-del-all;
rm -rf node_modules;
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/npm-*
echo "=======================";
echo "Cleaning inside iOS folder";
echo "=======================";
cd ios
rm -rf Pods;
rm -rf Podfile.lock;
rm -rf build;
npm cache clean --force
pod cache clean --all
echo "=======================";
echo "Cleaning inside Android folder";
cd ../android
rm -rf build
cd ..
rm -rf ~/Library/Developer/Xcode/DerivedData
echo "=======================";
echo "Installing Node dependencies";
echo "=======================";
npm install;
cd ios
echo "=======================";
echo "Installing PODs again";
echo "=======================";
pod install
cd ..;
echo "=======================";
echo "Resetting NPM cache";
echo "=======================";
npm start -- --reset-cache;

