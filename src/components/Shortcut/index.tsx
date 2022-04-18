/**
 * @author Collin Jones
 * @description Shortcut Component
 * @version 2022.4.11
 */

// Import the stylesheet
import './index.css';

// Create a Shortcut function component with location prop, and color & onClick optional props.
export default function Shortcut(props: {
  location: string;
  color?: string;
  onClick?: () => void;
}) {
  // Create a list of locations split by the > character
  // Ex: "File > Open Image" becomes ["File ", " Open Image"]
  let location = props.location.split('>');
  // Trim whitespace from elements
  // Ex: ["File ", " Open Image"] becomes ["File", "Open Image"]
  location = location.map(e => e.trim());

  // Return the component
  return (
    <div
      className="shortcut-wrapper"
      // If the onClick prop is defined, add the onClick event listener
      onClick={() => (props.onClick ? props.onClick() : {})}
    >
      {/* Loop through the locations array */}
      {location.map((val, i) => {
        return (
          // For each element, provide a styled span
          <span key={i}>
            <span
              // If a color is specified, set the color, otherwise set the color to black
              style={{ backgroundColor: props.color || '#000000' }}
              className="shortcut-key"
              key={i + '0'}
            >
              {val}
            </span>
            {/* Add a > after every element except the last one. */}
            <b>{i == location.length - 1 ? '' : '  >  '}</b>
          </span>
        );
      })}
    </div>
  );
}
