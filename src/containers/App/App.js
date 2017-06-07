import React from 'react';
import { Canvas, Target, Sidebar, TargetList } from '../../components';


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
    this.setState({
      new_target: false,
      focused_index: index,
      preview_image: this.state.target_images[index],
    });
  }

  handleDeleteTarget = (index) => {
    delete this.state.target_images[index];
    delete this.state.targets[index];
    this.setState({
      targets: this.state.targets,
      target_images: this.state.target_images,
    });
  };

  handleSubmitTarget = (index) => {
    const latestIndex = this.state.new_target
      ? this.state.latest_index + 1
      : this.state.latest_index;
    const delta = { [index]: this.state.preview_image };
    this.setState({
      new_target: false,
      latest_index: latestIndex,
      target_images: Object.assign({}, this.state.target_images, delta),
    });
  }

  handleNewTarget = () => {
    const newIndex = this.state.latest_index + 1;
    const delta = {
      [newIndex]: (
        <Target
          key={newIndex}
          index={newIndex}
          instance={new RestorableInstance()}
          onDelete={this.handleDeleteTarget}
          onSubmit={this.handleSubmitTarget}
        />
      )
    };

    this.setState({
      new_target: true,
      targets: Object.assign({}, this.state.targets, delta),
      focused_index: newIndex,
    });
  };

  render() {
    const styles = require('../../assets/css/main.css');

    return (
      <div className={styles.container}>
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
