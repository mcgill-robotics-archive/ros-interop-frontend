import ROSLIB from 'roslib';


const rosMsgFromTarget = target => ({
  type: { data: target.type },
  orientation: { data: target.orientation },
  shape: { data: target.shape },
  background_color: { data: target.background_color },
  alphanumeric_color: { data: target.alphanumeric_color },
  alphanumeric: target.alphanumeric,
  description: target.description,
  autonomous: target.autonomous,
  latitude: target.latitude,
  longitude: target.longitude,
});

const targetFromRosMsg = targetMsg => ({
  type: targetMsg.type.data,
  orientation: targetMsg.orientation.data,
  shape: targetMsg.shape.data,
  background_color: targetMsg.background_color.data,
  alphanumeric_color: targetMsg.alphanumeric_color.data,
  alphanumeric: targetMsg.alphanumeric,
  description: targetMsg.description,
  autonomous: targetMsg.autonomous,
  latitude: targetMsg.latitude,
  longitude: targetMsg.longitude,
});

const compressedImageFromDataURL = (dataURL) => {
  const pngHeader = 'data:image/png;base64,';
  const jpegHeader = 'data:image/jpeg;base64,';

  let format;
  let base64;
  if (dataURL.startsWith(pngHeader)) {
    format = 'png';
    base64 = dataURL.replace(pngHeader, '');
  } else {
    format = 'jpeg';
    base64 = dataURL.replace(jpegHeader, '');
  }

  const blob = atob(base64);
  const data = new Array(blob.length);
  for (let i = 0; i < blob.length; i += 1) {
    data[i] = blob.charCodeAt(i);
  }

  return { format, data };
};

const dataURLFromCompressedImage = img => (
  `data:image/${img.format};base64,${img.data}`
);

const notificationFromRosMsg = notificationMsg => ({
  type: notificationMsg.type,
  id: notificationMsg.id,
  target: targetFromRosMsg(notificationMsg.object),
  image: undefined,
  compressed_image: dataURLFromCompressedImage(notificationMsg.compressed_image),
});


class ROSClient {
  constructor(targetNotificationCb, guiNotificationCb) {
    this.targetNotificationCb = targetNotificationCb;
    this.guiNotificationCb = guiNotificationCb;
  }

  connect(addr, cb) {
    // Connect and set up connection callbacks.
    this.ros = new ROSLIB.Ros({ url: addr });
    this.ros.on('connection', () => {
      this.guiNotificationCb('CONNECTED');
      if (cb) {
        cb();
      }
    });
    this.ros.on('error', e => this.guiNotificationCb(`ERROR CONNECTING: ${e}`));
    this.ros.on('close', () => this.guiNotificationCb('DISCONNECTED'));

    // Setup target service clients.
    this.getAllTargetsClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/objects/all',
      serviceType: 'interop/GetAllObjects',
    });
    this.addTargetClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/objects/add',
      serviceType: 'interop/AddObject',
    });
    this.updateTargetClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/objects/update',
      serviceType: 'interop/UpdateObject',
    });
    this.deleteTargetClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/objects/delete',
      serviceType: 'interop/DeleteObject',
    });

    // Setup target image service clients.
    this.getTargetImageClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/objects/image/compressed/get',
      serviceType: 'interop/GetObjectCompressedImage',
    });
    this.setTargetImageClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/objects/image/compressed/set',
      serviceType: 'interop/SetObjectCompressedImage',
    });
    this.deleteTargetImageClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/interop/objects/image/delete',
      serviceType: 'interop/DeleteObjectImage',
    });

    // Setup ROS notification subscriber.
    this.targetNotificationTopic = new ROSLIB.Topic({
      ros: this.ros,
      name: '/interop/objects/notification',
      topicType: 'interop/ObjectNotification',
    });
    this.targetNotificationTopic.subscribe((msg) => {
      const notification = notificationFromRosMsg(msg);
      this.targetNotificationCb(notification);
    });
  }

  getAllTargets(cb) {
    const request = new ROSLIB.ServiceRequest({});
    this.getAllTargetsClient.callService(request, (result) => {
      if (result.success) {
        const targets = {};
        for (let i = 0; i < result.ids.length; i += 1) {
          const id = parseInt(result.ids[i], 10);
          const targetMsg = result.objects[i];
          targets[id] = targetFromRosMsg(targetMsg);
        }
        cb(targets);
      } else {
        this.guiNotificationCb('FAILED TO GET ALL TARGETS');
      }
    });
  }

  addTarget(target, cb) {
    const targetMsg = rosMsgFromTarget(target);
    const request = new ROSLIB.ServiceRequest({ object: targetMsg });
    this.addTargetClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(result.id);
      } else {
        this.guiNotificationCb('FAILED TO ADD TARGET');
      }
    });
  }

  updateTarget(id, target, cb) {
    const targetMsg = rosMsgFromTarget(target);
    const request = new ROSLIB.ServiceRequest({
      id,
      object: targetMsg,
    });
    this.updateTargetClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(id);
      } else {
        this.guiNotificationCb('FAILED TO UPDATE TARGET');
      }
    });
  }

  setTarget(id, target, cb) {
    if (id !== undefined) {
      this.updateTarget(id, target, cb);
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
        this.guiNotificationCb('FAILED TO DELETE TARGET');
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
        this.guiNotificationCb('FAILED TO SET TARGET IMAGE');
      }
    });
  }

  getTargetImage(id, cb) {
    const request = new ROSLIB.ServiceRequest({ id });
    this.getTargetImageClient.callService(request, (result) => {
      if (result.success && cb) {
        const dataURL = dataURLFromCompressedImage(result.image);
        cb(id, dataURL);
      } else {
        this.guiNotificationCb('FAILED TO GET TARGET IMAGE');
      }
    });
  }

  deleteTargetImage(id, cb) {
    const request = new ROSLIB.ServiceRequest({ id });
    this.deleteTargetImageClient.callService(request, (result) => {
      if (result.success && cb) {
        cb(id);
      } else {
        this.guiNotificationCb('FAILED TO DELETE TARGET IMAGE');
      }
    });
  }
}

export default ROSClient;
