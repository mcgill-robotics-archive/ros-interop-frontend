import React from 'react';
import PropTypes from 'prop-types';

class Prompt extends React.Component {
  static propTypes = {
    // Message of the prompt.
    message: PropTypes.string,

    // Default value.
    default: PropTypes.string,

    // Placeholder.
    placeholder: PropTypes.string,

    // Callback on submit.
    onSubmit: PropTypes.func,
  };

  state = {
    value: '',
  };

  componentWillMount() {
    this.setState({ value: this.props.default });
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value || '' });
  };

  handleSubmit = () => {
    if (this.state.value && this.props.onSubmit) {
      this.props.onSubmit(this.state.value);
    }
  }

  render() {
    const styles = require('./Prompt.css');

    return (
      <div className={styles.content}>
        <form onSubmit={this.handleSubmit}>
          {this.props.message}
          <input
            type="text"
            name="value"
            placeholder={this.props.placeholder}
            value={this.state.value}
            onChange={this.handleChange}
          />
        </form>
      </div>
    );
  }
}

export default Prompt;
