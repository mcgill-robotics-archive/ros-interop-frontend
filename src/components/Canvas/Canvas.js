import React from 'react';

class Canvas extends React.Component {
  state = {
  };

  render() {
    const styles = require('./Canvas.css');

    return (
      <div className={styles.content} />
    );
  }
}

export default Canvas;
