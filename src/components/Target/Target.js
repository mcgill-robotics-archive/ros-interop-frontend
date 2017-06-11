import React from 'react';
import PropTypes from 'prop-types';

const styles = require('./Target.css');


class Target extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    instance: PropTypes.object.isRequired,
    onSubmit: PropTypes.func,
    onDelete: PropTypes.func,
  };

  static colors = [
    { value: '', label: 'UNDEFINED' },
    { value: 'black', label: 'Black' },
    { value: 'blue', label: 'Blue' },
    { value: 'brown', label: 'Brown' },
    { value: 'gray', label: 'Gray' },
    { value: 'green', label: 'Green' },
    { value: 'orange', label: 'Orange' },
    { value: 'purple', label: 'Purple' },
    { value: 'red', label: 'Red' },
    { value: 'white', label: 'White' },
    { value: 'yellow', label: 'Yellow' },
  ];

  static shapes = [
    { value: '', label: 'UNDEFINED' },
    { value: 'circle', label: 'Circle' },
    { value: 'cross', label: 'Cross' },
    { value: 'heptagon', label: 'Heptagon' },
    { value: 'hexagon', label: 'Hexagon' },
    { value: 'octagon', label: 'Octagon' },
    { value: 'pentagon', label: 'Pentagon' },
    { value: 'quarter_circle', label: 'Quarter-Circle' },
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'semicircle', label: 'Semi-Circle' },
    { value: 'square', label: 'Square' },
    { value: 'star', label: 'Star' },
    { value: 'trapezoid', label: 'Trapezoid' },
    { value: 'triangle', label: 'Triangle' },
  ];

  static orientations = [
    { value: '', label: 'UNDEFINED' },
    { value: 'n', label: 'North' },
    { value: 'ne', label: 'North-East' },
    { value: 'e', label: 'East' },
    { value: 'se', label: 'South-East' },
    { value: 's', label: 'South' },
    { value: 'sw', label: 'South-West' },
    { value: 'w', label: 'West' },
    { value: 'nw', label: 'North-West' },
  ];

  static types = [
    { value: 'standard', label: 'Standard' },
    { value: 'off_axis', label: 'Off-Axis' },
    { value: 'emergent', label: 'Emergent' },
  ];

  constructor(props) {
    super(props);
    this.state = {
      id: undefined,
      alphanumeric: '',
      background_color: '',
      alphanumeric_color: '',
      orientation: '',
      shape: '',
      type: 'standard',
    };

    this.savedState = undefined;
  }

  componentWillMount() {
    this.restore();
  }

  setSavedState = (state) => {
    this.savedState = Object.assign({}, state);
    this.forceUpdate();
  };

  getStateClassName = name => (
    (this.savedState && this.state[name] === this.savedState[name])
    ? styles.saved : styles.edited
  );

  restore = () => {
    this.props.instance.restore(this);
  }

  save = () => {
    const state = this.state;
    this.setSavedState(state);
    this.props.instance.save((ctx) => {
      ctx.setState(state);
      ctx.setSavedState(state);
    });
  }

  handleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.save();
    if (this.props.onSubmit !== undefined) {
      this.props.onSubmit(this.props.index, this.state);
    }
  };

  handleDelete = (event) => {
    event.preventDefault();

    if (this.props.onDelete !== undefined) {
      this.props.onDelete(this.props.index);
    }
  };

  renderInputText = (name, value, props = {}) => (
    <input
      type="text"
      name={name}
      value={value}
      onChange={this.handleChange}
      className={this.getStateClassName(name)}
      {...props}
    />
  );

  renderSelection = (name, value, options) => (
    <select
      name={name}
      value={value}
      onChange={this.handleChange}
      className={this.getStateClassName(name)}
    >
      {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
    </select>
  );

  render() {
    const title = `Target ${this.props.index}`;
    const header = (
      <span className={styles.header}>
        {this.savedState ? title : <i>{title}</i>}
      </span>
    );

    const body = (
      <form onSubmit={() => {}}>
        Letter: {this.renderInputText('alphanumeric', this.state.alphanumeric, { maxLength: '1' })}<br />
        Background Color: {this.renderSelection('background_color', this.state.background_color, Target.colors)}
        Foreground Color: {this.renderSelection('alphanumeric_color', this.state.alphanumeric_color, Target.colors)}
        Orientation: {this.renderSelection('orientation', this.state.orientation, Target.orientations)}
        Shape: {this.renderSelection('shape', this.state.shape, Target.shapes)}
        Type: {this.renderSelection('type', this.state.type, Target.types)}
        <button className={styles.submit} onClick={this.handleSubmit}>SAVE</button>
        <button className={styles.delete} onClick={this.handleDelete}>DELETE</button>
      </form>
    );

    return (
      <div className={styles.content}>
        {header}
        {body}
      </div>
    );
  }
}

export default Target;
