import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Slider,
  IconButton,
  Chip,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimerIcon from '@mui/icons-material/Timer';

const IntervalControl = ({ open, onClose, currentInterval, onIntervalChange }) => {
    const [intervalValue, setIntervalValue] = useState(currentInterval / 1000);

    // Reset value when modal opens
    useEffect(() => {
      if (open) {
        setIntervalValue(currentInterval / 1000);
      }
    }, [open, currentInterval]);
  
    // Handle slider change
    const handleSliderChange = (event, newValue) => {
      setIntervalValue(newValue);
    };
  
    // Handle input change
    const handleInputChange = (event) => {
      const value = parseFloat(event.target.value);
      if (!isNaN(value) && value > 0) {
        setIntervalValue(value);
      }
    };
  
    // Handle save
    const handleSave = () => {
      // Convert to milliseconds
      const milliseconds = Math.round(intervalValue * 1000);
      onIntervalChange(milliseconds);
    };
  
    // Preset interval options
    const presetIntervals = [
      { label: '2s', value: 2 },
      { label: '5s', value: 5 },
      { label: '10s', value: 10 },
      { label: '30s', value: 30 },
    ];
  
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Rotation Interval Settings
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography gutterBottom>
              Set how long each image appears (in seconds):
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
              <TimerIcon color="action" />
              <Slider
                value={intervalValue}
                onChange={handleSliderChange}
                min={1}
                max={30}
                step={0.5}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}s`}
                sx={{ flexGrow: 1, mx: 2 }}
              />
              <TextField
                value={intervalValue}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                }}
                sx={{ width: '100px' }}
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
              Quick presets:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {presetIntervals.map((preset) => (
                <Chip
                  key={preset.value}
                  label={preset.label}
                  clickable
                  color={intervalValue === preset.value ? 'primary' : 'default'}
                  onClick={() => setIntervalValue(preset.value)}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

export default IntervalControl;