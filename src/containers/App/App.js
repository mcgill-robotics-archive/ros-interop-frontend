import React from 'react';
import { ROSClient } from '../../actions';
import { Target, Prompt, Sidebar, TargetList, Notification } from '../../components';


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
      is_new: {},

      // Active target.
      focused_index: undefined,
      preview_image: undefined,

      // Modals.
      notification: undefined,
      prompt: undefined,
      disabled: true,
    };
  }

  componentWillMount() {
    // Set up ROS connection, then ask for directory.
    this.requestAddress();
  }

  requestAddress = () => {
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
            this.setState({ disabled: false });
          });
        }}
      />
    );
    this.setState({ prompt });
  };

  connect = (address) => {
    this.client = new ROSClient(this.handleNotification, this.notify);
    this.client.connect(`ws://${address}:9090`, this.loadRemoteTargets);
    document.onkeydown = this.handleKeyDown;
  }

  loadRemoteTargets = () => {
    this.client.getAllTargets((targetStates) => {
      const targets = {};
      const isNew = {};
      Object.keys(targetStates).map((i) => {
        const id = parseInt(i, 10);

        const state = targetStates[id];
        targets[id] = this.createTarget(id, state);
        isNew[id] = true;

        // It's expecting a return value.
        return i;
      });

      this.setState({
        targets,
        is_new: isNew,
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
    });
  };

  handleFocus = (index) => {
    if (isNaN(index) || this.state.targets[index] === undefined) return;
    const prevIndex = this.state.focused_index;
    this.state.is_new[index] = false;
    this.setState({
      focused_index: index,
      is_new: this.state.is_new,
      preview_image: this.state.target_images[index],
    }, () => {
      if (index !== prevIndex) {
        this.notify(`SWITCHED TO TARGET ${index}`);
      }
    });
  };

  closestIndex = (id, direction) => {
    const offsetIndex = (direction === 'prev') ? -1 : 1;
    const targetIds = Object.keys(this.state.targets);
    const closestIndex = targetIds.indexOf(id.toString()) + offsetIndex;
    return parseInt(targetIds[closestIndex], 10);
  }

  handleKeyDown = (e) => {
    if (e.target.type === 'text' || e.target.type === 'textarea') {
      // This is to avoid affecting writing.
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        if (this.state.focused_index !== undefined) {
          this.handleFocus(this.closestIndex(this.state.focused_index, 'prev'));
        }
        break;

      case 'ArrowRight':
        if (this.state.focused_index !== undefined) {
          this.handleFocus(this.closestIndex(this.state.focused_index, 'next'));
        }
        break;

      case 'Delete':
      case 'Backspace':
        this.handleDeleteTarget(this.state.focused_index);
        if (this.state.focused_index !== undefined) {
          this.handleFocus(this.closestIndex(this.state.focused_index, 'next'));
        }
        break;

      default:
        break;
    }
  }

  handleNotification = (notification) => {
    const id = notification.id;

    switch (notification.type) {
      // ADDED_OBJECT
      case 0:
        this.state.targets[id] = this.createTarget(id, notification.target);
        this.state.is_new[id] = true;
        this.setState({ targets: this.state.targets, is_new: this.state.is_new });
        break;

      // UPDATED_OBJECT.
      case 1:
        this.state.targets[id] = this.createTarget(id, notification.target);
        this.setState({ targets: this.state.targets });
        break;

      // DELETED_OBJECT.
      case 2:
        delete this.state.is_new[id];
        delete this.state.targets[id];
        delete this.state.target_images[id];
        if (this.state.focused_index === id) {
          this.setState({
            focused_index: undefined,
            preview_image: undefined,
          });
        }
        this.setState({
          targets: this.state.targets,
          target_images: this.state.target_images,
          is_new: this.state.is_new,
        });
        break;

      // SET_IMAGE.
      case 3:
        // TODO
        break;

      // SET_COMPRESSED_IMAGE.
      case 4:
        this.state.target_images[id] = notification.compressed_image;
        this.setState({ target_images: this.state.target_images });
        break;

      // DELETED_IMAGE.
      case 5:
        delete this.state.target_images[id];
        if (this.state.focused_index === id) {
          this.setState({
            preview_image: undefined,
          });
        }
        this.setState({ target_images: this.state.target_images });
        break;

      // RELOAD_ALL.
      case 6:
        this.setState({
          focused_index: undefined,
          preview_image: undefined,
        }, this.loadRemoteTargets);
        break;

      // CLEAR_ALL.
      case 7:
        this.setState({
          focused_index: undefined,
          preview_image: undefined,
          targets: {},
          target_images: {},
          is_new: {},
        }, this.loadRemoteTargets);
        break;

      default:
        break;
    }
  };

  createTarget = (index, state) => {
    const instance = new RestorableInstance();
    instance.save((ctx) => {
      ctx.setState(state);
      ctx.setSavedState(state);
    });

    return (<Target
      key={index}
      index={index}
      instance={instance}
      onDelete={this.handleDeleteTarget}
      onSubmit={this.handleSubmitTarget}
    />);
  }

  handleDeleteTarget = (index) => {
    this.client.deleteTarget(index, () => {
      // This automatically deletes the corresponding image.
      delete this.state.target_images[index];
      delete this.state.targets[index];
      delete this.state.is_new[index];
      this.setState({
        targets: this.state.targets,
        target_images: this.state.target_images,
        is_new: this.state.is_new,
      }, () => this.notify(`DELETED TARGET ${index}`));
    });
  };

  handleSubmitTarget = (index, state) => {
    const image = this.state.preview_image;

    this.client.setTarget(index, state, (id) => {
      this.client.setTargetImage(id, image, () => {
        this.state.target_images[index] = image;
        this.setState({
          target_images: this.state.target_images,
        }, () => this.notify(`SAVED TARGET ${index}`));
      });
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
          <Sidebar
            preview={this.state.preview_image}
            target={this.state.targets[this.state.focused_index]}
          />
          <TargetList
            focused={this.state.focused_index}
            is_new={this.state.is_new}
            images={this.state.target_images}
            onSelection={this.handleFocus}
          />
        </div>
      </div>
    );
  }
}

export default App;
