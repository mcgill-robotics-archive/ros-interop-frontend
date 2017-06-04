import React from 'react';
import PropTypes from 'prop-types';

const Sidebar = (props) => {
  const styles = require('./Sidebar.css');

  return (
    <div className={styles.content} id="sidebar">
      <h1>Target List</h1>
      <div className={styles.targets}>
        {Object.keys(props.targets).map(i => <ul key={i}>{props.targets[i]}</ul>)}
      </div>
      <button className={styles.add} onClick={() => props.onNewTarget()}>NEW TARGET</button>
    </div>
  );
};

Sidebar.propTypes = {
  targets: PropTypes.object.isRequired,
  onNewTarget: PropTypes.func.isRequired,
};

export default Sidebar;
