import ROSLIB from 'roslib';


const rosMsgFromTarget = target => ({
  type: { data: target.type },
  orientation: { data: target.orientation },
  shape: { data: target.shape },
  background_color: { data: target.background_color },
  alphanumeric_color: { data: target.alphanumeric_color },
  alphanumeric: target.alphanumeric,
  description: target.description,

  // Unset by GUI.
  autonomous: false,
  latitude: 0,
  longitude: 0,
});

const targetFromRosMsg = (targetMsg, id) => ({
  id,
  type: targetMsg.type.data,
  orientation: targetMsg.orientation.data,
  shape: targetMsg.shape.data,
  background_color: targetMsg.background_color.data,
  alphanumeric_color: targetMsg.alphanumeric_color.data,
  alphanumeric: targetMsg.alphanumeric.data,
  description: targetMsg.description.data,
});

const compressedImageFromDataURL = (dataURL) => {
  const base64 = dataURL.replace('data:image/png;base64,', '');
  const blob = atob(base64);
  const data = new Array(blob.length);
  for (let i = 0; i < blob.length; i += 1) {
    data[i] = blob.charCodeAt(i);
  }

  return { format: 'png', data };
};


class ROSClient {
  constructor(notificationCb) {
    this.notificationCb = notificationCb;
  }

  connect(addr) {
    // Connect and set up connection callbacks.
    this.ros = new ROSLIB.Ros({ url: addr });
    this.ros.on('connection', () => this.notificationCb('CONNECTED'));
    this.ros.on('error', e => this.notificationCb(`ERROR CONNECTING: ${e}`));
    this.ros.on('close', () => this.notificationCb('DISCONNECTED'));

    // Setup target service clients.
    this.getAllTargetsClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/targets/all',
      serviceType: 'interop/GetAllTargets',
    });
    this.addTargetClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/targets/add',
      serviceType: 'interop/AddTarget',
    });
    this.updateTargetClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/targets/update',
      serviceType: 'interop/UpdateTarget',
    });
    this.deleteTargetClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/targets/delete',
      serviceType: 'interop/DeleteTarget',
    });

    // Setup target image service clients.
    this.getTargetImageClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/targets/image/compressed/get',
      serviceType: 'interop/GetTargetCompressedImage',
    });
    this.setTargetImageClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/targets/image/compressed/set',
      serviceType: 'interop/SetTargetCompressedImage',
    });
    this.deleteTargetImageClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/targets/image/delete',
      serviceType: 'interop/DeleteTargetImage',
    });
  }

  getAllTargets(cb) {
    const request = new ROSLIB.ServiceRequest({});
    this.addTargetClient.callService(request, (result) => {
      if (result.success) {
        const targets = {};
        for (let i = 0; i < result.ids.length; i += 1) {
          const id = result.ids[i];
          const targetMsg = result.targets[i];
          const target = targetFromRosMsg(targetMsg, id);
          targets[id] = target;
        }
        cb(targets);
      } else {
        this.notificationCb('FAILED TO GET ALL TARGETS');
      }
    });
  }

  addTarget(target, cb) {
    const targetMsg = rosMsgFromTarget(target);
    const request = new ROSLIB.ServiceRequest({ target: targetMsg });
    this.addTargetClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(result.id);
      } else {
        this.notificationCb('FAILED TO ADD TARGET');
      }
    });
  }

  updateTarget(target, cb) {
    const targetMsg = rosMsgFromTarget(target);
    const request = new ROSLIB.ServiceRequest({
      id: target.id,
      target: targetMsg,
    });
    this.updateTargetClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(target.id);
      } else {
        this.notificationCb('FAILED TO UPDATE TARGET');
      }
    });
  }

  setTarget(id, target, cb) {
    if (id !== undefined) {
      this.updateTarget(target, cb);
    } else {
      this.addTarget(target, cb);
    }
  }

  deleteTarget(id, cb) {
    const request = new ROSLIB.ServiceRequest({ id });
    this.deleteTargetClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(id);
      } else {
        this.notificationCb('FAILED TO DELETE TARGET');
      }
    });
  }

  setTargetImage(id, dataURL, cb) {
    const request = new ROSLIB.ServiceRequest({
      id,
      image: compressedImageFromDataURL(dataURL),
    });
    this.setTargetImageClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(id);
      } else {
        this.notificationCb('FAILED TO SET TARGET IMAGE');
      }
    });
  }

  getTargetImage(id, cb) {
    const request = new ROSLIB.ServiceRequest({ id });
    this.getTargetImageClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(id, result.image.data);
      } else {
        this.notificationCb('FAILED TO GET TARGET IMAGE');
      }
    });
  }

  deleteTargetImage(id, cb) {
    const request = new ROSLIB.ServiceRequest({ id });
    this.deleteTargetImageClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(id);
      } else {
        this.notificationCb('FAILED TO DELETE TARGET IMAGE');
      }
    });
  }
}

export default ROSClient;
