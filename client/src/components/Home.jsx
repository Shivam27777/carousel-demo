import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Paper, 
    Button, 
    CircularProgress, 
    Alert, 
    Grid,
    Fab
  } from '@mui/material';
  import AddIcon from '@mui/icons-material/Add';
import TimerIcon from '@mui/icons-material/Timer';
import ReorderIcon from '@mui/icons-material/Reorder';
import CarouselBox from './CarouselBox';
import ImageUpload from './ImageUpload';
import SequenceManager from './SequenceManager';
import IntervalControl from './IntervalControl';
import { imageService } from '../services/api';
import '../App.css';

function Home() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rotationInterval, setRotationInterval] = useState(5000); // Default 5 seconds
    
    // Modal states
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [intervalModalOpen, setIntervalModalOpen] = useState(false);
    const [sequenceModalOpen, setSequenceModalOpen] = useState(false);
  
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
        setUploadModalOpen(false);
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
        setSequenceModalOpen(false);
      } catch (err) {
        setError('Failed to update sequence. Please try again.');
        console.error(err);
      }
    };
  
    // Handle interval change
    const handleIntervalChange = (newInterval) => {
      setRotationInterval(newInterval);
      setIntervalModalOpen(false);
    };
  
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Image Carousel
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Paper elevation={3} sx={{ mb: 4, p: 2, borderRadius: 2, overflow: 'hidden' }}>
              <CarouselBox 
                images={images} 
                rotationInterval={rotationInterval}
                onDelete={handleDeleteImage}
              />
            </Paper>
            
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload Image
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<TimerIcon />}
                  onClick={() => setIntervalModalOpen(true)}
                >
                  Rotation Settings
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="info" 
                  startIcon={<ReorderIcon />}
                  onClick={() => setSequenceModalOpen(true)}
                  disabled={images.length < 2}
                >
                  Manage Sequence
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Modals */}
        <ImageUpload 
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onAddImage={handleAddImage}
        />
        
        <IntervalControl
          open={intervalModalOpen}
          onClose={() => setIntervalModalOpen(false)}
          currentInterval={rotationInterval}
          onIntervalChange={handleIntervalChange}
        />
        
        <SequenceManager 
          open={sequenceModalOpen}
          onClose={() => setSequenceModalOpen(false)}
          images={images}
          onUpdateSequence={handleUpdateSequence}
        />
      </Container>
    );
  }

export default Home;