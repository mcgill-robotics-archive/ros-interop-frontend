import React from 'react';
import { Canvas, Target, Sidebar } from '../../components';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Targets.
      targets: {},
      target_images: {},
      curr_index: 0,

      // Frame.
      curr_image: 'http://braavos.me/images/posts/college-rock/the-smiths.png',

      // Active target.
      focused_index: 0,
      preview_image: '',
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

  handleDeleteTarget = (index) => {
    delete this.state.targets[index];
    this.setState({
      targets: this.state.targets,
    });
  };

  handleNewTarget = () => {
    const newIndex = this.state.curr_index + 1;
    const targetsDelta = {};
    targetsDelta[newIndex] = (
      <Target
        index={newIndex}
        onDelete={this.handleDeleteTarget}
      />
    );

    this.setState({
      targets: Object.assign({}, this.state.targets, targetsDelta),
      curr_index: newIndex,
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
        />
      </div>
    );
  }
}

export default App;
