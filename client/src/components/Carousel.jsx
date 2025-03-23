import React, { useState, useEffect, useRef } from 'react';
import { Button, Image } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaTrashAlt } from 'react-icons/fa';
import './Carousel.css';

const Carousel = ({ images, rotationInterval, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // No images scenario
  if (!images || images.length === 0) {
    return (
      <div className="carousel-container text-center p-5">
        <p>No images available. Please upload some images to see them here.</p>
      </div>
    );
  }

  // Start or reset the timer for auto-rotation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const startTimer = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, rotationInterval);
    };

    startTimer();

    // Cleanup on unmount or interval change
    return () => clearInterval(timerRef.current);
  }, [currentIndex, images.length, rotationInterval, isPaused]);

  // Navigate to previous image
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Navigate to next image
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Toggle pause/play
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle image deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      onDelete(images[currentIndex]._id);
    }
  };

  // Get current image
  const currentImage = images[currentIndex];

  return (
    <div className="carousel-container">
      <div className="carousel-content">
        <div className="image-container">
          <Image 
            src={`http://localhost:5000${currentImage.imageUrl}`}
            alt={currentImage.title}
            className="carousel-image"
            fluid
          />
          
          <div className="carousel-controls">
            <Button 
              variant="light" 
              className="carousel-control prev-btn"
              onClick={goToPrevious}
            >
              <FaChevronLeft />
            </Button>
            
            <Button 
              variant="light" 
              className="carousel-control next-btn"
              onClick={goToNext}
            >
              <FaChevronRight />
            </Button>
          </div>
          
          <Button 
            variant="danger" 
            className="delete-btn"
            onClick={handleDelete}
          >
            <FaTrashAlt />
          </Button>
        </div>
        
        <div className="carousel-caption">
          <h3>{currentImage.title}</h3>
          {currentImage.description && <p>{currentImage.description}</p>}
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>
      
      <div className="carousel-thumbnails">
        {images.map((image, index) => (
          <img
            key={image._id}
            src={`http://localhost:5000${image.imageUrl}`}
            alt={`Thumbnail ${index + 1}`}
            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      
      <div className="carousel-footer">
        <Button 
          variant={isPaused ? "success" : "secondary"}
          onClick={togglePause}
        >
          {isPaused ? "Resume" : "Pause"} Slideshow
        </Button>
      </div>
    </div>
  );
};

export default Carousel;