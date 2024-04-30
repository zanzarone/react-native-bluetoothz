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
