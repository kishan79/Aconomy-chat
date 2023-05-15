import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { gql, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

import { useAuthDispatch } from "../context/auth";

// const LOGIN_USER = gql`
//   query login($wallet_address: String!, $password: String!) {
//     login(wallet_address: $wallet_address, password: $password) {
//       wallet_address
//       email
//       createdAt
//       token
//     }
//   }
// `;

const GET_AUTH_SIGNATURE_MESSAGE = gql`
  mutation getAuthSignatureMessage($wallet_address: String!) {
    getAuthSignatureMessage(wallet_address: $wallet_address) {
      signatureMessage
    }
  }
`;
const ETHEREUM_AUTH = gql`
  mutation doEthereumAuth($wallet_address: String!, $signature: String!) {
    doEthereumAuth(wallet_address: $wallet_address, signature: $signature) {
      token
    }
  }
`;

export default function Login(props) {
  const [errors, setErrors] = useState({});

  const dispatch = useAuthDispatch();

  const [loginUser, { loading }] = useMutation(GET_AUTH_SIGNATURE_MESSAGE, {
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
    async onCompleted(data) {
      if (!window.ethereum) alert("No crypto wallet found. Please install it.");

      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(
        data.getAuthSignatureMessage.signatureMessage
      );
      const address = await signer.getAddress();
      console.log(signature, address);

      authUser({
        variables: { wallet_address: address, signature: signature },
      });
    },
  });

  const [authUser, { }] = useMutation(ETHEREUM_AUTH, {
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
    async onCompleted(data) {
      dispatch({ type: 'LOGIN', payload: data.doEthereumAuth })

      window.location.href = '/'
    },
  });

  const submitLoginForm = async (e) => {
    e.preventDefault();

    if (!window.ethereum) alert("No crypto wallet found. Please install it.");

    await window.ethereum.send("eth_requestAccounts");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    
    loginUser({ variables: { wallet_address: accounts[0] } });
  };

  return (
    <Row className="bg-white py-5 justify-content-center">
      <Col sm={8} md={6} lg={4}>
        <h1 className="text-center">Login</h1>
        <Form onSubmit={submitLoginForm}>
          <div className="text-center">
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? "loading.." : "Login"}
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
}
