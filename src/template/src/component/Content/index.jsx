import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Bread from 'component/Bread';

const Wrappped = styled.div`
  .layout-content__ {
    margin: 24px;
  }
`;

const Content = ({ breadPaths, children }) => (
  <Wrappped>
    <Bread paths={breadPaths} />
    <div className="layout-content__">{children}</div>
  </Wrappped>
);

Content.propTypes = {
  breadPaths: PropTypes.array,
  children: PropTypes.node
};

export default Content;
