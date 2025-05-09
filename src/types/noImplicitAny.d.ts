// This file adds type annotations to prevent implicit 'any' errors

// Add explicit type annotations for callback parameters
interface Window {
  // Add any window extensions here if needed
}

// Add explicit type annotations for event handlers
type SliderValueFormatter = (value: number) => string;
type InputChangeHandler = (e: { target: { value: string } }) => void;
type RadioChangeHandler = (e: { target: { value: string } }) => void;
