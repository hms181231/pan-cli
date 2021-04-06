import React from 'react';
import { Switch, BrowserRouter, Route } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import ScrollToTop from 'component/ScrollToTop';
import PermissionGuard from 'container/PermissionGuard';
import Routes from '@/routes';
import { storeProvider } from './store';
import 'antd/dist/antd.less';

import './style/global.less';

const { moduleName } = require('../config');

@storeProvider()
class Root extends React.PureComponent {
  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    return (
      <ConfigProvider locale={zhCN}>
        <BrowserRouter basename={`/${moduleName}`}>
          <Switch>
            <Route path="/">
              <PermissionGuard>
                <Layout>
                  <ScrollToTop>
                    <div className="layout-content">{Routes}</div>
                  </ScrollToTop>
                </Layout>
              </PermissionGuard>
            </Route>
          </Switch>
        </BrowserRouter>
      </ConfigProvider>
    );
  }
}

export default Root;
