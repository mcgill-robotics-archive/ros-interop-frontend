import React from 'react';
import { ROSClient, FSImageSource } from '../../actions';
import { Canvas, Target, Prompt, Sidebar, TargetList, Notification } from '../../components';

const { dialog } = window.require('electron').remote;


class RestorableInstance {
  constructor() {
    this.func = null;
  }

  save(f) {
    this.func = f;
  }

  restore(context) {
    if (this.func) {
      this.func(context);
    }
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Targets.
      targets: {},
      target_images: {},
      latest_index: 0,

      // Frame.
      curr_image: undefined,

      // Active target.
      focused_index: undefined,
      preview_image: undefined,
      new_target: undefined,

      // Modals.
      notification: undefined,
      prompt: undefined,
      disabled: true,
    };
  }

  componentWillMount() {
    // Set up ROS connection, then ask for directory.
    this.requestAddress(this.requestDirectory);
  }

  requestDirectory = () => {
    let pathList;
    while (!pathList) {
      pathList = dialog.showOpenDialog({
        title: 'Select where your images are stored',
        properties: ['openDirectory'],
      });
    }

    this.image_source = new FSImageSource(
      pathList[0],
      () => {
        this.updateImage();
        document.onkeydown = this.handleKeyDown;
      },
      this.notify);
  }

  requestAddress = (cb) => {
    const prompt = (
      <Prompt
        message="Connect"
        default="localhost"
        placeholder="Hostname or IP address of interop client"
        onSubmit={(address) => {
          this.setState({
            prompt: undefined,
          }, () => {
            this.connect(address);
            this.setState({ disabled: false }, cb);
          });
        }}
      />
    );
    this.setState({ prompt });
  };

  connect = (address) => {
    this.remoteIDs = {};
    this.client = new ROSClient(this.notify);
    this.client.connect(`ws://${address}:9090`, this.loadRemoteTargets);
  }

  loadRemoteTargets = () => {
    let latestIndex = 0;
    this.client.getAllTargets((targetStates) => {
      const targets = {};
      Object.keys(targetStates).map((i) => {
        const id = parseInt(i, 10);

        this.remoteIDs[id] = id;
        const instance = new RestorableInstance();
        const state = targetStates[id];
        instance.save((ctx) => {
          ctx.setState(state);
          ctx.setSavedState(state);
        });

        targets[id] = (
          <Target
            key={id}
            index={id}
            instance={instance}
            onDelete={this.handleDeleteTarget}
            onSubmit={this.handleSubmitTarget}
          />
        );

        latestIndex = Math.max(latestIndex, i);

        // It's expecting a return value.
        return i;
      });

      this.setState({
        targets,
        latest_index: latestIndex,
      }, () => {
        Object.keys(targets).map((i) => {
          const id = parseInt(i, 10);
          this.client.getTargetImage(id, (_, img) => {
            this.state.target_images[id] = img;
            this.setState({
              target_images: this.state.target_images,
            });
          });

          // It's expecting a return value.
          return i;
        });
      });

      const targetCount = Object.keys(targets).length;
      this.notify(`LOADED ${targetCount} TARGETS`);
      this.handleNewTarget(false);
    });
  };

  updateImage = () => this.setState({ curr_image: this.image_source.curr() });

  handleKeyDown = (e) => {
    if (e.target.type === 'text' || e.target.type === 'textarea') {
      // This is to avoid affecting writing.
      console.log(e);
      return;
    }

    switch (e.key) {
      // Ctrl+A or left for previous.
      case 'a':
        if (!e.ctrlKey) {
          break;
        }
        // Fallthrough.
      case 'ArrowLeft':
        if (this.image_source.canRewind()) {
          this.image_source.prev();
          this.updateImage();
        }
        break;

      // Ctrl+D or right for next.
      case 'd':
        if (!e.ctrlKey) {
          break;
        }
        // Fallthrough.
      case 'ArrowRight':
        if (this.image_source.canSeek()) {
          this.image_source.next();
          this.updateImage();
        }
        break;
      default:
        break;
    }
  };

  handleCrop = (previewImage) => {
    this.setState({
      preview_image: previewImage,
    });
  };

  handleFocus = (index) => {
    const prevIndex = this.state.focused_index;
    this.setState({
      new_target: false,
      focused_index: index,
      preview_image: this.state.target_images[index],
    }, () => {
      if (index !== prevIndex) {
        this.notify(`SWITCHED TO TARGET ${index}`);
      }
    });
  };

  handleDeleteTarget = (index) => {
    const remoteID = this.remoteIDs[index];
    this.client.deleteTarget(remoteID, () => {
      // This automatically deletes the corresponding image.
      delete this.state.target_images[index];
      delete this.state.targets[index];
      delete this.remoteIDs[index];
      this.setState({
        targets: this.state.targets,
        target_images: this.state.target_images,
      }, () => this.notify(`DELETED TARGET ${index}`));
    });
  };

  handleSubmitTarget = (index, state) => {
    const latestIndex = this.state.new_target
      ? this.state.latest_index + 1
      : this.state.latest_index;
    const image = this.state.preview_image;
    const remoteID = this.remoteIDs[index];

    this.client.setTarget(remoteID, state, (id) => {
      this.remoteIDs[index] = id;
      this.client.setTargetImage(id, image, () => {
        this.state.target_images[index] = image;
        this.setState({
          new_target: false,
          latest_index: latestIndex,
          target_images: this.state.target_images,
        }, () => this.notify(`SAVED TARGET ${index}`));
      });
    });
  };

  handleNewTarget = (notify = true) => {
    const newIndex = this.state.latest_index + 1;
    this.state.targets[newIndex] = (
      <Target
        key={newIndex}
        index={newIndex}
        instance={new RestorableInstance()}
        onDelete={this.handleDeleteTarget}
        onSubmit={this.handleSubmitTarget}
      />
    );

    this.setState({
      new_target: true,
      targets: this.state.targets,
      focused_index: newIndex,
    }, () => {
      if (notify) {
        // Don't notify on app launch.
        this.notify(`NEW TARGET ${newIndex}`);
      }
    });
  };

  notify = (msg: string) => {
    const notification = (
      <Notification
        message={msg}
        dismissAfter={1000}
        onDismiss={() => {
          this.setState({ notification: undefined });
        }}
      />
    );
    this.setState({ notification });
  }

  render() {
    const styles = require('../../assets/css/main.css');

    return (
      <div className={styles.container}>
        {this.state.prompt}
        {this.state.notification}
        <div hidden={this.state.disabled}>
          <Canvas
            src={this.state.curr_image}
            onCrop={this.handleCrop}
          />
          <Sidebar
            preview={this.state.preview_image}
            target={this.state.targets[this.state.focused_index]}
            onNewTarget={this.handleNewTarget}
            newTargetEnabled={!this.state.new_target}
          />
          <TargetList
            images={this.state.target_images}
            onSelection={this.handleFocus}
          />
        </div>
      </div>
    );
  }
}

export default App;
