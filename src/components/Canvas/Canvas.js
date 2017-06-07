import React from 'react';
import PropTypes from 'prop-types';
import { Cropper } from 'react-image-cropper';

class Canvas extends React.Component {
  static propTypes = {
    src: PropTypes.string,
    onCrop: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      preview: '',
    };
  }

  handleCrop = () => {
    const uri = this.cropper.crop();
    if (this.props.onCrop !== undefined) {
      this.props.onCrop(uri);
    }
  };

  render() {
    const styles = require('./Canvas.css');

    return (
      <div className={styles.content}>
        <Cropper
          ref={(c) => { this.cropper = c; }}
          src={this.props.src}
          onChange={this.handleCrop}
          onImgLoad={this.handleCrop}
        />
      </div>
    );
  }
}

export default Canvas;
