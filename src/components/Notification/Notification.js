import React from 'react';
import PropTypes from 'prop-types';

class Notification extends React.Component {
  static propTypes = {
    // Message of the notification.
    message: PropTypes.string,

    // Time in milliseconds.
    dismissAfter: PropTypes.number,

    // Callback on dimissal.
    onDismiss: PropTypes.func,
  };

  state = {
    dismissed: false,
  };

  componentWillMount() {
    this.scheduleDismissal(this.props.dismissAfter);
  }

  componentWillReceiveProps(nextProps) {
    clearTimeout(this.timeout);
    this.scheduleDismissal(nextProps.dismissAfter);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  scheduleDismissal = (timeout) => {
    this.setState({ dismissed: false }, () => {
      if (timeout) {
        this.timeout = setTimeout(this.handleTimeout, timeout);
      }
    });
  };

  handleTimeout = () => {
    if (!this.timeout) {
      return;
    }
    this.setState({ dismissed: true }, () => {
      if (this.props.onDismiss) {
        this.props.onDismiss(this);
      }
    });
  };

  render() {
    const styles = require('./Notification.css');

    return (
      <div className={styles.content} hidden={this.state.dismissed}>
        {this.props.message}
      </div>
    );
  }
}

export default Notification;
