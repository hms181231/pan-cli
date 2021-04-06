import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Message from '@ocean/message';
import initService from '@/service/init';
import queryString from 'query-string';
import { createGlobalStyle } from 'styled-components';
import { storeConsumer } from '@/store';

const { MsgRegister, MsgTrigger } = Message;

const GlobalStyle = createGlobalStyle`
  #sider,
  .ant-layout > #header,
  .ant-layout-content > #footer {
    display:none
  }
`;

@storeConsumer()
class PermissionGuard extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      layoutReady: false
    };
  }

  componentDidMount() {
    const { history } = this.props;

    MsgRegister('EVENT:LAYOUT_READY', this.ready);
    MsgTrigger('EVENT:SYSTEM_MOUNT', history);

    this.handleInit();
  }

  ready = () => {
    this.setState({
      layoutReady: true
    });
  };

  handleInit = async () => {
    const { store, dispatch } = this.props;

    if (!store.global) {
      const global = await initService.getAll();
      dispatch('global', global);

      dispatch('profile', { USER_INFO: window.INIT_DATA.USER_INFO });
    }
  };

  render() {
    const {
      children,
      location,
      store: { global }
    } = this.props;
    const { layoutReady } = this.state;
    let search = location.search.slice(1);

    search = queryString.parse(search);

    const layoutStyle = search?.layoutStyle === 'none' ? <GlobalStyle /> : null;

    if (!layoutReady || !global) {
      return <>{layoutStyle}</>;
    }

    return (
      <>
        {layoutStyle}
        {children}
      </>
    );
  }
}

export default withRouter(PermissionGuard);
