import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

export default class Editor extends PureComponent {
  container = React.createRef();

  static propTypes = {
    json: PropTypes.any
  };

  async componentDidMount() {
    const { json } = this.props;
    const options = {
      mode: 'code'
    };

    this.jsoneditor = new JSONEditor(this.container.current, options);
    this.jsoneditor.set(json);
  }

  componentWillUnmount() {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }
  }

  getJSON = () => {
    return this.jsoneditor.get();
  };

  render() {
    return <div className="jsoneditor-react-container" ref={this.container} />;
  }
}
