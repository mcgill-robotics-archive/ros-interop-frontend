import React from 'react';
import PropTypes from 'prop-types';

const Sidebar = (props) => {
  const styles = require('./Sidebar.css');

  return (
    <div className={styles.content}>
      <img className={styles.preview} src={props.preview} alt="preview" />
      {props.target}
      <button
        className={styles.add}
        onClick={props.onNewTarget}
        disabled={!props.newTargetEnabled}
      >
        NEW TARGET
      </button>
    </div>
  );
};

Sidebar.propTypes = {
  preview: PropTypes.string,
  target: PropTypes.object,
  newTargetEnabled: PropTypes.bool,
  onNewTarget: PropTypes.func.isRequired,
};

export default Sidebar;
