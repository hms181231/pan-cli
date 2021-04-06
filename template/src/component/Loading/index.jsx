import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import Loadable from 'react-loadable';

const Loading = ({ error, pastDelay }) => {
  if (error) {
    return console.error(error);
  }
  if (pastDelay) {
    return (
      <Spin tip="Loading...">
        <div className="loading" />
      </Spin>
    );
  }

  return null;
};

Loading.propTypes = {
  error: PropTypes.any,
  pastDelay: PropTypes.any
};

const Lazy = WrappedComponent =>
  Loadable({
    loader: WrappedComponent,
    loading: Loading
  });

export default Lazy;
