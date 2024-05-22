import React, { useState } from 'react';
import { Button, Dropdown, Modal, Form, InputGroup } from 'react-bootstrap';
import { useLocation, useHistory } from "react-router-dom";

const ShareButton = () => {
  const history = useHistory();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  //location.pathname is the current route
  const goDoc = () => history.push('/userInfo');

  return (
    <div style={{ display: 'block', width: '100%' }}>
      <Dropdown>
        <Dropdown.Toggle variant="primary" id="dropdown-basic" style={{ width: '100%' }}>
          Share
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={handleModalShow}>Share to Chat</Dropdown.Item>
          <Dropdown.Item onClick={goDoc} >Copy Link</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Share to Zoom Team Chat</Modal.Title>
          <p>You are on this route: {location.pathname}</p>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            <Form.Group controlId="formChannel">
              <Form.Label>Channel Name</Form.Label>
              <InputGroup>
                <Form.Control type="channel" placeholder="Enter channel" />
                <Button variant="outline-secondary" id="button-addon2">
                  Select
                </Button>
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="formMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Add a message (optional)" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalClose}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShareButton;
