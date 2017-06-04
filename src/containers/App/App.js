import React from 'react';
import { Canvas, Target, Sidebar } from '../../components';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targets: {},
      curr_index: 0,
    };

    this.handleNewTarget = this.handleNewTarget.bind(this);
    this.handleDeleteTarget = this.handleDeleteTarget.bind(this);
  }

  handleDeleteTarget(index) {
    delete this.state.targets[index];
    this.setState({
      targets: this.state.targets,
    });
  }

  handleNewTarget() {
    const newIndex = this.state.curr_index + 1;
    const targetsDelta = {};
    targetsDelta[newIndex] = <Target index={newIndex} onDelete={this.handleDeleteTarget} />;

    this.setState({
      targets: Object.assign({}, this.state.targets, targetsDelta),
      curr_index: newIndex,
    });
  }

  render() {
    require('../../assets/css/main.css');

    return (
      <div>
        <Canvas />
        <Sidebar targets={this.state.targets} onNewTarget={this.handleNewTarget} />
      </div>
    );
  }
}

export default App;
