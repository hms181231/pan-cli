import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const Bread = ({ paths }) => (
  <div className="breadcrumb">
    <Breadcrumb>
      {paths.map(path => {
        return path.link ? (
          <Breadcrumb.Item key={`${path.link}_${path.text}`}>
            <Link to={path.link}>{path.text}</Link>
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item key={`${path.link}_${path.text}`}>
            {path.text}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  </div>
);

Bread.propTypes = {
  paths: PropTypes.array.isRequired
};

export default Bread;
