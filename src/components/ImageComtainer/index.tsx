/**
 * @author Collin Jones
 * @description Image container component
 * @version 2022.4.11
 */

import { Component } from 'react';

// Import the stylesheet
import './index.css';

// Create the ImageContainer class component, with image & showOutline prop.
export class ImageContainer extends Component<
  { image: string; showOutline: boolean },
  {}
> {
  constructor(props: { image: string; showOutline: boolean }) {
    // Initialize props
    super(props);
  }

  render() {
    // Render the image
    return (
      <div className="image-container">
        <img
          src={this.props.image}
          className={`image-preview ${
            // If the showOutline prop is true, add the image-outline class
            this.props.showOutline ? 'image-outline' : ''
          }`}
        />
      </div>
    );
  }
}

// Export the ImageContainer component
export default ImageContainer;
