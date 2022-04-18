/**
 * @author Collin Jones
 * @description This is the application's rendering main file
 * @version 2022.4.11
 */

import { Component } from 'react';

// Importing the shortcut component & ImageContainer components
import Shortcut from './components/Shortcut';
import ImageContainer from './components/ImageComtainer';

// Import the stylesheet
import './styles/App.css';
import { HashLoader } from 'react-spinners';

// Create the App class component, with currentImage & showOutline state.
export class App extends Component<
  {},
  { currentImage: string; showOutline: boolean; loading: boolean }
> {
  constructor(props: {}) {
    // Call the parent constructor with the props
    super(props);

    // Set the initial state
    this.state = {
      currentImage: '',
      showOutline: false,
      loading: true,
    };
  }

  componentDidMount() {
    // When the component is loaded, initialize a listener for the setImage event
    window.Main.on('setImage', (image: string) => {
      this.setState({
        currentImage: image,
      });
    });

    window.Main.on('toggleOutline', (image: string) => {
      this.setState({ showOutline: !this.state.showOutline });
    });
  }

  // When the component is rendered (TSX)
  // TSX is similar to HTML, but it is compiled to JS, and uses custom components and types, as well as can do computations, calculations, etc.
  render() {
    return (
      // Outer container
      <div className="App">
        {/* If there is an image, render it, otherwise prompt the user to Open an image */}
        {this.state.currentImage.length > 3 ? (
          // Image Container component, pass the currentImage state, when it is changed it will re-render the component
          <ImageContainer
            image={this.state.currentImage}
            showOutline={this.state.showOutline}
          />
        ) : (
          // If there is no image, prompt the user to open an image
          <div className="sc-container">
            Open an Image to view it.
            <br />
            <br />{' '}
            <div className="shortcut-holder">
              <Shortcut
                color={'#2f2f38'}
                location="File > Open Image"
                onClick={() => {}}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Export the App component
export default App;
