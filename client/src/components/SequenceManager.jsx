import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable item component
const SortableItem = ({ image, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: image._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <React.Fragment>
      <ListItem
        ref={setNodeRef}
        style={style}
        sx={{ 
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
          cursor: 'move'
        }}
        {...attributes}
      >
        <div {...listeners}>
          <DragIndicatorIcon 
            sx={{ mr: 2, color: 'text.secondary' }} 
          />
        </div>
        <Typography 
          variant="body2" 
          sx={{ width: 30, mr: 2, color: 'text.secondary' }}
        >
          {index + 1}
        </Typography>
        <ListItemAvatar>
          <Avatar 
            variant="rounded"
            src={`http://localhost:5000${image.imageUrl}`}
            alt={image.title || 'Image'}
            sx={{ width: 60, height: 60 }}
          />
        </ListItemAvatar>
        <ListItemText 
          primary={image.title || 'Untitled'}
          secondary={image.description ? (
            image.description.length > 80 
              ? `${image.description.substring(0, 80)}...` 
              : image.description
          ) : null}
        />
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};

const SequenceManager = ({ open, onClose, images, onUpdateSequence }) => {
  const [orderedImages, setOrderedImages] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize ordered images when modal opens
  useEffect(() => {
    if (open && Array.isArray(images)) {
      setOrderedImages([...images]);
      setHasChanges(false);
    }
  }, [open, images]);

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setOrderedImages((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  // Save the new sequence to the backend
  const saveSequence = () => {
    // Map the new sequence to update the backend
    const sequenceUpdates = orderedImages.map((image, index) => ({
      id: image._id,
      sequence: index + 1
    }));
    
    onUpdateSequence(sequenceUpdates);
    onClose();
  };

  // Reset to original order
  const resetSequence = () => {
    setOrderedImages([...images]);
    setHasChanges(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Manage Image Sequence
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
        <Typography paragraph>
          Drag and drop images to reorder them in the carousel. Changes will not be saved until you click "Save Order".
        </Typography>
        
        {!orderedImages || orderedImages.length === 0 ? (
          <Typography>No images available to reorder.</Typography>
        ) : (
          <Paper variant="outlined" sx={{ mt: 2 }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedImages.map(img => img._id)}
                strategy={verticalListSortingStrategy}
              >
                <List sx={{ padding: 0 }}>
                  {orderedImages.map((image, index) => (
                    <SortableItem 
                      key={image._id} 
                      image={image} 
                      index={index} 
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          startIcon={<RestoreIcon />}
          onClick={resetSequence}
          disabled={!hasChanges}
        >
          Reset
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={saveSequence}
          variant="contained" 
          color="primary"
          startIcon={<SaveIcon />}
          disabled={!hasChanges}
        >
          Save Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SequenceManager;