import React from 'react';
import PropTypes from 'prop-types';

const TargetList = ({ images, onSelection }) => {
  const styles = require('./TargetList.css');

  return (
    <div className={styles.content}>
      {Object.keys(images).map(
        i => (
          <ul key={i} id={i}>
            <button
              onClick={() => onSelection(i)}
            >
              <img
                src={images[i]}
                alt={`Target ${i}`}
                title={`Target ${i}`}
              />
            </button>
          </ul>
        )
      )}
    </div>
  );
};

TargetList.propTypes = {
  images: PropTypes.object,
  onSelection: PropTypes.func.isRequired,
};

export default TargetList;
