import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { storeConsumer } from '@/store';
import home from './asset/home.png';
import './style.less';

@storeConsumer()
class Home extends Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <div className="home">
        <img src={home} width="100%" alt="" />
      </div>
    );
  }
}

export default withRouter(Home);
