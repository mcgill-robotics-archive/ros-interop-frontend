const remote = window.require('electron').remote;

const electronFs = remote.require('fs');
const path = require('path');


class BaseImageSource {
  canRewind = () => false;
  canSeek = () => false;

  prev = () => undefined;
  curr = () => undefined;
  next = () => undefined;
}


export class TestImageSource extends BaseImageSource {
  curr = () => (
    'http://roadmanfong.github.io/react-cropper/example/img/child.jpg'
  );
}


export class FSImageSource extends BaseImageSource {
  canRewind = () => true;
  canSeek = () => true;

  constructor(dirPath, onLoadCb, notificationCb) {
    super();
    this.dir_path = dirPath;
    this.curr_index = 0;
    this.files = undefined;
    this.notificationCb = notificationCb;

    const filter = (f) => {
      const x = f.toLowerCase();
      return x.endsWith('.png') || x.endsWith('.jpg') || x.endsWith('.jpeg');
    };
    electronFs.readdir(dirPath, (e, files) => {
      if (e) {
        this.notificationCb(`FAILED TO LOAD IMAGES; ${e}`);
        return;
      }
      this.files = files.filter(filter);
      if (onLoadCb) {
        onLoadCb();
      }
    });
  }

  prev = () => {
    if (this.curr_index <= 0) {
      this.notificationCb('REACHED BEGINNING');
      return;
    }

    this.curr_index -= 1;
  };

  curr = () => {
    if (this.files) {
      const filename = this.files[this.curr_index];
      return path.join(this.dir_path, filename);
    }

    return '';
  };

  next = () => {
    if (this.curr_index >= this.files.length - 1) {
      this.notificationCb('REACHED END');
      return;
    }

    this.curr_index += 1;
  };
}
