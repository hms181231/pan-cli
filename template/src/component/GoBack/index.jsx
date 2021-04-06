import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Icon } from 'antd';
import styled from 'styled-components';

const Wrapped = styled.a`
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 20px;
`;

const GoBack = ({ history, back }) => {
  return (
    <Wrapped
      className="back-btn"
      title="返回"
      onClick={() => {
        back?.() || history.goBack();
      }}
    >
      <Icon type="rollback" />
    </Wrapped>
  );
};

GoBack.propTypes = {
  history: PropTypes.object.isRequired,
  back: PropTypes.func
};

export default withRouter(GoBack);
