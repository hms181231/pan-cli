import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from 'container/Home';
import RuleConfig from 'container/RuleConfig';
import RuleList from 'container/RuleList';
import Trial from 'container/Trial';
import ExceptionList from 'container/ExceptionList';
import PushmonitoringList from 'container/PushmonitoringList';
import Flow from 'container/Flow';
import ChargeId from 'container/ChargeId';
// import Lazy from 'component/Loading';

// const RuleConfig = Lazy(() => import('container/RuleConfig'));
// const Home = Lazy(() => import('container/Home'));
// const RuleList = Lazy(() => import('container/RuleList'));

export default (
  <Switch>
    <Route path="/" component={Home} exact />
    <Route path="/rulelist" component={RuleList} />
    <Route
      path="/ruleconfig/:status/:productRuleId?/:isExternal?"
      component={RuleConfig}
    />
    <Route path="/trial/:productRuleId" component={Trial} />
    <Route path="/exception" component={ExceptionList} />
    <Route path="/pushmonitoring" component={PushmonitoringList} />
    <Route path="/flow" component={Flow} />
    <Route path="/management/chargeId" component={ChargeId} />
  </Switch>
);
