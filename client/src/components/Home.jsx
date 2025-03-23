import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Carousel from './Carousel';
import ImageUpload from './ImageUpload';
import SequenceManager from './SequenceManager';
import IntervalControl from './IntervalControl';
import { imageService } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rotationInterval, setRotationInterval] = useState(5000); // Default 5 seconds

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Fetch all images from the API
  const fetchImages = async () => {
    try {
      setLoading(true);
      const fetchedImages = await imageService.getAll();
      setImages(fetchedImages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch images. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new image
  const handleAddImage = async (newImage) => {
    try {
      await imageService.add(newImage);
      fetchImages(); // Refresh the images list
    } catch (err) {
      setError('Failed to add image. Please try again.');
      console.error(err);
    }
  };

  // Handle deleting an image
  const handleDeleteImage = async (id) => {
    try {
      await imageService.delete(id);
      fetchImages(); // Refresh the images list
    } catch (err) {
      setError('Failed to delete image. Please try again.');
      console.error(err);
    }
  };

  // Handle updating sequence
  const handleUpdateSequence = async (sequenceUpdates) => {
    try {
      await imageService.updateSequence(sequenceUpdates);
      fetchImages(); // Refresh the images list
    } catch (err) {
      setError('Failed to update sequence. Please try again.');
      console.error(err);
    }
  };

  // Handle interval change
  const handleIntervalChange = (newInterval) => {
    setRotationInterval(newInterval);
  };

  return (
    <Container className="mt-4 mb-4">
      <h1 className="text-center mb-4">Image Carousel</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <Carousel 
                    images={images} 
                    rotationInterval={rotationInterval}
                    onDelete={handleDeleteImage}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>Upload New Image</Card.Header>
                <Card.Body>
                  <ImageUpload onAddImage={handleAddImage} />
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card>
                <Card.Header>Rotation Settings</Card.Header>
                <Card.Body>
                  <IntervalControl 
                    currentInterval={rotationInterval} 
                    onIntervalChange={handleIntervalChange} 
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Card>
                <Card.Header>Manage Image Sequence</Card.Header>
                <Card.Body>
                  <SequenceManager 
                    images={images} 
                    onUpdateSequence={handleUpdateSequence} 
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default Home;