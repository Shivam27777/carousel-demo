import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const ImageUpload = ({ onAddImage }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImage(file);
    setError('');
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!image) {
      setError('Please select an image to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create form data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image', image);
      
      // Call the parent handler
      await onAddImage(formData);
      
      // Reset form after successful upload
      setTitle('');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      setSuccess('Image uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>Image Title *</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter image title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter image description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Image File *</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        <Form.Text className="text-muted">
          Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
        </Form.Text>
      </Form.Group>
      
      {imagePreview && (
        <Row className="mb-3">
          <Col>
            <div className="image-preview">
              <p>Preview:</p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }} 
              />
            </div>
          </Col>
        </Row>
      )}
      
      <Button 
        variant="primary" 
        type="submit" 
        disabled={loading}
        className="w-100"
      >
        {loading ? 'Uploading...' : 'Upload Image'}
      </Button>
    </Form>
  );
};

export default ImageUpload;