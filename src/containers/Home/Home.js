import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Sidebar } from '../../components';


class Home extends React.Component {
  static propTypes = {
    home: PropTypes.object,
  };

  state = {
    info: 'Interop'
  }

  componentDidMount() {
  }

  shouldComponentUpdate(nextProps) {
    return this.props.home !== nextProps.home;
  }

  render() {
    return (
      <Sidebar />
    );
  }
}

const mapStateToProps = (state) => {
  const select = {
    home: state.home
  };
  return select;
};

export default connect(mapStateToProps)(Home);
