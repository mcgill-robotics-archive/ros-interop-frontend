const fs = require('fs');
const packager = require('electron-packager');

const pkg = {
  name: 'Interop',
  productName: 'Interop',
  version: '0.1.0',
  main: 'main.js',
}

fs.writeFile('./build/package.json', JSON.stringify(pkg), (err) => {
  if (err) {
    console.log(err);
  } else {
    packager({
      dir: './build',
      arch: 'all', // ia32, x64, all
      platform: [
        'darwin',
        'linux',
      ],
      appCopyright: 'McGill Robotics',
      appVersion: pkg.version,
      icon: './src/assets/images/ros.ico',
      prune: false,
      out: './release',
    }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
});
