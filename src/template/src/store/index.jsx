/**
 * 使用context api代替redux，适合共享数据需求不高的项目
 */

import React, { useContext } from 'react';

const Context = React.createContext({});

export const storeProvider = () => {
  return WrappedComponent =>
    class storeProvider extends React.PureComponent {
      state = {
        value: {}
      };

      dispatch = (key, value) => {
        this.setState(prevState => {
          const nextStore = JSON.parse(JSON.stringify(prevState.value));
          nextStore[key] = value;
          return {
            value: nextStore
          };
        });
      };

      render() {
        const { value: data } = this.state;
        return (
          <Context.Provider
            value={{
              data,
              dispatch: this.dispatch
            }}
          >
            <WrappedComponent {...this.props} dispatch={this.dispatch} />
          </Context.Provider>
        );
      }
    };
};

export const storeConsumer = () => {
  return WrappedComponent =>
    React.forwardRef(function storeConsumer(props, ref) {
      return (
        <Context.Consumer>
          {store => (
            <WrappedComponent
              {...props}
              ref={ref}
              store={store.data}
              dispatch={store.dispatch}
            />
          )}
        </Context.Consumer>
      );
    });
};

export const useStore = () => {
  const contextData = useContext(Context);

  return contextData.data;
};
