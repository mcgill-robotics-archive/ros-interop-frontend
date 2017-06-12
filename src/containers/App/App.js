import React from 'react';
import { Canvas, Target, Sidebar, TargetList, Notification } from '../../components';


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
      curr_image: 'http://roadmanfong.github.io/react-cropper/example/img/child.jpg',

      // Active target.
      focused_index: undefined,
      preview_image: undefined,
      new_target: undefined,

      // Notification container.
      notification: undefined,
    };
  }

  componentWillMount() {
    this.handleNewTarget();
  }

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
    delete this.state.target_images[index];
    delete this.state.targets[index];
    this.setState({
      targets: this.state.targets,
      target_images: this.state.target_images,
    }, () => this.notify(`DELETED TARGET ${index}`));
  };

  handleSubmitTarget = (index) => {
    const latestIndex = this.state.new_target
      ? this.state.latest_index + 1
      : this.state.latest_index;
    this.state.target_images[index] = this.state.preview_image;
    this.setState({
      new_target: false,
      latest_index: latestIndex,
      target_images: this.state.target_images,
    }, () => this.notify(`SAVED TARGET ${index}`));
  };

  handleNewTarget = () => {
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
      if (newIndex > 1) {
        // Don't notify on app launch.
        this.notify(`NEW TARGET ${newIndex}`);
      }
    });
  };

  notify = (msg: string) => {
    const notification = (
      <Notification
        message={msg}
        dismissAfter={500}
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
        {this.state.notification}
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
    );
  }
}

export default App;
