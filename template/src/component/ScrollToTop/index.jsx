import { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

class ScrollToTop extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
    element: PropTypes.string
  };

  static defaultProps = {
    element: '#layout'
  };

  componentDidUpdate(prevProps) {
    const { location: nextLocation, element } = this.props;
    if (nextLocation !== prevProps.location) {
      document.querySelector(element).scrollTop = 0;
    }
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

export default withRouter(ScrollToTop);
