/**
 * @author Collin Jones
 * @description Application Loading manager
 * @version 2022.4.15
 */

import { Component } from 'react';
import { HashLoader } from 'react-spinners';

import './styles/AppLoader.css';

// React class component with loading state
export class AppLoader extends Component<{}, { loading: boolean }> {
  constructor(props: {}) {
    super(props);
    // Initialize the loading state
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    // Disable the loading state
    this.setState({ loading: false });

    // When the component is loaded, initialize a listener for the setLoading event
    window.Main.on('setLoading', (loading: boolean) => {
      this.setState({ loading });
    });
  }

  render() {
    return (
      <div className="AppLoader">
        {/* If loading is true, show a HashSpinner from react-spinners package */}
        <div className={`spinner-bg ${this.state.loading ? '' : 'clear'}`}>
          <div className="loading-spinner">
            <HashLoader
              css={'margin-top: 200%;'}
              size={150}
              color={'#123abc'}
              loading={this.state.loading}
              speedMultiplier={1}
            />
          </div>
        </div>
        <div className="app-holder">{this.props.children}</div>
      </div>
    );
  }
}

// Export the AppLoader component
export default AppLoader;
