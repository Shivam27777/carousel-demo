import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

const IntervalControl = ({ currentInterval, onIntervalChange }) => {
  const [intervalValue, setIntervalValue] = useState(currentInterval / 1000);
  const [isEditing, setIsEditing] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate input
    let value = parseFloat(intervalValue);
    
    if (isNaN(value) || value <= 0) {
      value = 5; // Default to 5 seconds if invalid
    }
    
    // Convert to milliseconds and update
    const milliseconds = Math.round(value * 1000);
    onIntervalChange(milliseconds);
    setIsEditing(false);
  };

  // Handle input change
  const handleChange = (e) => {
    setIntervalValue(e.target.value);
  };

  // Preset interval options
  const presetIntervals = [
    { label: '2 sec', value: 2000 },
    { label: '5 sec', value: 5000 },
    { label: '10 sec', value: 10000 },
    { label: '30 sec', value: 30000 },
  ];

  return (
    <div>
      <p>Current rotation interval: <strong>{(currentInterval / 1000).toFixed(1)} seconds</strong></p>
      
      {isEditing ? (
        <Form onSubmit={handleSubmit}>
          <InputGroup className="mb-3">
            <Form.Control
              type="number"
              min="0.5"
              step="0.5"
              value={intervalValue}
              onChange={handleChange}
              placeholder="Enter seconds"
            />
            <InputGroup.Text>seconds</InputGroup.Text>
            <Button type="submit" variant="primary">Save</Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setIntervalValue(currentInterval / 1000);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </InputGroup>
        </Form>
      ) : (
        <Button 
          variant="primary" 
          onClick={() => setIsEditing(true)}
          className="mb-3"
        >
          Change Interval
        </Button>
      )}
      
      <div>
        <p>Quick presets:</p>
        <div className="d-flex flex-wrap gap-2">
          {presetIntervals.map((preset) => (
            <Button
              key={preset.value}
              variant="outline-secondary"
              size="sm"
              onClick={() => onIntervalChange(preset.value)}
              active={currentInterval === preset.value}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntervalControl;