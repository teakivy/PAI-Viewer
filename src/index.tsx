/**
 * @author Collin Jones
 * @description This is the application's rendering main file
 * @version 2022.4.11
 */

import ReactDOM from 'react-dom';
import App from './App';
import AppLoader from './AppLoader';

import './styles/index.css';

// Set element "root" to render the App component
ReactDOM.render(
  <AppLoader>
    <App />
  </AppLoader>,
  document.getElementById('root')
);
