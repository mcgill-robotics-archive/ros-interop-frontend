import React from 'react';
import PropTypes from 'prop-types';

const Sidebar = (props) => {
  const styles = require('./Sidebar.css');

  const blank = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const img = props.preview || blank;

  return (
    <div>
      <div className={styles.content}>
        <img
          className={styles.preview}
          src={img}
          alt="preview"
        />
        {props.target}
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  preview: PropTypes.string,
  target: PropTypes.object,
};

export default Sidebar;
