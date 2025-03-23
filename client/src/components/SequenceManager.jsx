import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Image, Row, Col } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SequenceManager = ({ images, onUpdateSequence }) => {
  const [orderedImages, setOrderedImages] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize ordered images from props
  useEffect(() => {
    setOrderedImages([...images]);
  }, [images]);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(orderedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the state with new order
    setOrderedImages(items);
    setHasChanges(true);
  };

  // Save the new sequence to the backend
  const saveSequence = () => {
    // Map the new sequence to update the backend
    const sequenceUpdates = orderedImages.map((image, index) => ({
      id: image._id,
      sequence: index + 1
    }));
    
    onUpdateSequence(sequenceUpdates);
    setHasChanges(false);
  };

  // Reset to original order
  const resetSequence = () => {
    setOrderedImages([...images]);
    setHasChanges(false);
  };

  // If no images, show message
  if (!images || images.length === 0) {
    return <p>No images available to reorder.</p>;
  }

  return (
    <div>
      <p>Drag and drop images to reorder them in the carousel:</p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided) => (
            <ListGroup
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="mb-3"
            >
              {orderedImages.map((image, index) => (
                <Draggable key={image._id} draggableId={image._id} index={index}>
                  {(provided) => (
                    <ListGroup.Item
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="d-flex align-items-center"
                    >
                      <Row className="w-100 align-items-center">
                        <Col xs={1} className="text-center">
                          {index + 1}
                        </Col>
                        <Col xs={2}>
                          <Image
                            src={`http://localhost:5000${image.imageUrl}`}
                            alt={image.title}
                            thumbnail
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        </Col>
                        <Col>
                          <div className="ms-3">
                            <strong>{image.title}</strong>
                            {image.description && (
                              <p className="mb-0 text-muted small">{image.description.substring(0, 80)}...</p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ListGroup>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          onClick={resetSequence}
          disabled={!hasChanges}
        >
          Reset
        </Button>
        <Button
          variant="primary"
          onClick={saveSequence}
          disabled={!hasChanges}
        >
          Save New Order
        </Button>
      </div>
    </div>
  );
};

export default SequenceManager;