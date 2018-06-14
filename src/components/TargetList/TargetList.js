import React from 'react';
import PropTypes from 'prop-types';

const TargetList = ({ images, is_new, focused, onSelection }) => {
  const styles = require('./TargetList.css');

  return (
    <div className={styles.content}>
      {Object.keys(images).map(
        (i) => {
          let className;
          if (focused === parseInt(i, 10)) {
            className = styles.focused;
          } else if (is_new[i]) {
            className = styles.new;
          }
          return (<ul key={i} id={i} className={className}>
            <button
              onClick={() => onSelection(parseInt(i, 10))}
            >
              <img
                src={images[i]}
                alt={`Target ${i}`}
                title={`Target ${i}`}
              />
            </button>
          </ul>);
        }
      )}
    </div>
  );
};

TargetList.propTypes = {
  images: PropTypes.object,
  is_new: PropTypes.object,
  focused: PropTypes.number,
  onSelection: PropTypes.func.isRequired,
};

export default TargetList;
