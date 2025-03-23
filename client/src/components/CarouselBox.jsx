import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  NavigateBefore, 
  NavigateNext, 
  Delete, 
  Pause, 
  PlayArrow 
} from '@mui/icons-material';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import './Carousel.css';

// Sortable Thumbnail Component
const SortableThumbnail = ({ image, index, currentIndex, onClick }) => {
  const theme = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image._id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.5 : (index === currentIndex ? 1 : 0.6),
    width: 80,
    height: 60,
    borderRadius: 1,
    cursor: 'grab',
    border: index === currentIndex ? `2px solid ${theme.palette.primary.main}` : 'none',
    '&:hover': {
      opacity: 0.9,
    }
  };

  return (
    <Box
      ref={setNodeRef}
      sx={style}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <Box
        component="img"
        src={`http://localhost:5000${image.imageUrl}`}
        alt={`Thumbnail ${index + 1}`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'inherit',
        }}
      />
    </Box>
  );
};

const CarouselBox = ({ images, rotationInterval = 5000, onDelete, onReorder }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [carouselImages, setCarouselImages] = useState(images || []);
  const [activeId, setActiveId] = useState(null);
  const timerRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );


  useEffect(() => {
    setCarouselImages(images || []);
  }, [images]);

  // No images scenario
  if (!carouselImages || carouselImages.length === 0) {
    return (
      <Box className="carousel-empty" p={4} textAlign="center">
        <Typography variant="body1">
          No images available. Please upload some images to see them here.
        </Typography>
      </Box>
    );
  }

  // Start or reset the timer for auto-rotation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (carouselImages.length <= 1 || isPaused) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, rotationInterval);
  
    return () => clearInterval(timerRef.current);
  }, [currentIndex, carouselImages.length, rotationInterval, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  const handleCarouselSelect = (selectedIndex) => {
    setCurrentIndex(selectedIndex);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const confirmDelete = (id) => {
    setImageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (imageToDelete && onDelete) {
      onDelete(imageToDelete);
    }
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over.id) {
      setCarouselImages((items) => {
        const oldIndex = items.findIndex(item => item._id === active.id);
        const newIndex = items.findIndex(item => item._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        if (oldIndex === currentIndex) {
          setCurrentIndex(newIndex);
        } else if (
          (oldIndex < currentIndex && newIndex >= currentIndex) ||
          (oldIndex > currentIndex && newIndex <= currentIndex)
        ) {
          const adjustment = oldIndex < newIndex ? -1 : 1;
          setCurrentIndex(currentIndex + adjustment);
        }

        if (onReorder) {
          onReorder(newItems);
        }

        return newItems;
      });
    }
  };

  return (
    <Box className="carousel-root">
      <Box className="carousel-container" sx={{ position: 'relative' }}>
        <Carousel
          activeIndex={currentIndex}
          onSelect={handleCarouselSelect}
          interval={isPaused ? null : rotationInterval}
          indicators={false}
          controls={false}
        >
          {carouselImages.map((_, index) => {
            return (
              <Carousel.Item key={index}>
                <Box display="flex" justifyContent="center" gap={2} m={2}>
                  
                    <Box
                      key={carouselImages[index]._id}
                      sx={{
                        maxWidth: '900px',
                        height: isMobile ? 200 : 400,
                        position: 'relative',
                      }}
                    >
                      <img
                        src={`http://localhost:5000${carouselImages[index].imageUrl}`}
                        alt={carouselImages[index].title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: '4px'
                        }}
                      />
                    </Box>
                
                </Box>
              </Carousel.Item>
            );
          })}
        </Carousel>

        <IconButton
          className="delete-button"
          color="error"
          onClick={() => confirmDelete(carouselImages[currentIndex]?._id)}
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            bgcolor: 'rgba(255,255,255,0.7)' 
          }}
        >
          <Delete />
        </IconButton>

        <Box className="carousel-controls">
          <IconButton
            className="nav-button prev"
            onClick={goToPrevious}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.7)', 
              position: 'absolute', 
              left: 16, 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }}
          >
            <NavigateBefore />
          </IconButton>
          <IconButton
            className="nav-button next"
            onClick={goToNext}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.7)', 
              position: 'absolute', 
              right: 16, 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }}
          >
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>


      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={isPaused ? <PlayArrow /> : <Pause />}
          size="small"
          onClick={togglePause}
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
        <Typography variant="body2">
          {currentIndex + 1} / {carouselImages.length}
        </Typography>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box 
          className="carousel-thumbnails"
          sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            gap: 1, 
            mt: 2, 
            pb: 1 
          }}
        >
          <SortableContext
            items={carouselImages.map(img => img._id)}
            strategy={horizontalListSortingStrategy}
          >
            {carouselImages.map((image, index) => (
              <SortableThumbnail
                key={image._id}
                image={image}
                index={index}
                currentIndex={currentIndex}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </SortableContext>
        </Box>

        <DragOverlay>
          {activeId ? (
            <Box
              sx={{
                width: 80,
                height: 60,
                borderRadius: 1,
                boxShadow: 3,
                opacity: 0.8,
              }}
            >
              <Box
                component="img"
                src={`http://localhost:5000${carouselImages.find(img => img._id === activeId)?.imageUrl}`}
                alt="Dragging thumbnail"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'inherit',
                }}
              />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this image? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarouselBox;