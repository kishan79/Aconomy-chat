import React, { Fragment, useEffect, useState } from "react";
import { Row, Button, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { gql, useSubscription, useMutation, useLazyQuery } from "@apollo/client";

import { useAuthDispatch, useAuthState } from "../../context/auth";
import { useMessageDispatch } from "../../context/message";

import Users from "./Users";
import Messages from "./Messages";

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      _id
      from
      to
      content
      createdAt
    }
  }
`;

const ADD_WALLET_USER = gql`
  mutation addWalletUser($wallet_address: String!) {
    addWalletUser(wallet_address: $wallet_address) {
      wallet_address
    }
  }
`;

export default function Home({ history }) {
  const authDispatch = useAuthDispatch();
  const messageDispatch = useMessageDispatch();
  const [show, setShow] = useState(false);
  const [address, setAddress] = useState("");

  const { user } = useAuthState();

  const { data: messageData, error: messageError } =
    useSubscription(NEW_MESSAGE);

  const [addWalletUser] = useMutation(ADD_WALLET_USER, {
    onCompleted: () => {
      handleClose();
      window.location.href = '/';
    },
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    if (messageError) console.log(messageError);

    if (messageData) {
      const message = messageData.newMessage;
      const otherUser =
        user.wallet_address === message.to ? message.from : message.to;

      messageDispatch({
        type: "ADD_MESSAGE",
        payload: {
          wallet_address: otherUser,
          message,
        },
      });
    }
  }, [messageError, messageData]);

  const logout = () => {
    authDispatch({ type: "LOGOUT" });
    window.location.href = "/login";
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleNewChat = () => {
    addWalletUser({variables: {
      wallet_address: address
    }})
    // handleClose();
    // window.location.href = "/";
  };
  
  return (
    <Fragment>
      <Row className="bg-white justify-content-around mb-1">
        {!user && (
          <>
            <Link to="/login">
              <Button variant="link">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="link">Register</Button>
            </Link>
          </>
        )}
        {user && (
          <p style={{ display: "flex", alignItems: "center" }}>
            User: {user.wallet_address}
          </p>
        )}
        <Button variant="link" onClick={handleShow}>
          Add Friend
        </Button>
        <Button variant="link" onClick={logout}>
          Logout
        </Button>
      </Row>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Start new chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Enter an address below to start a new chat!
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Control
                type="input"
                placeholder="e.g. 0x..."
                name="ethAddress"
                onChange={(event) => setAddress(event.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleNewChat}>
            Start Chatting
          </Button>
        </Modal.Footer>
      </Modal>
      <Row className="bg-white">
        <Users />
        <Messages />
      </Row>
    </Fragment>
  );
}
