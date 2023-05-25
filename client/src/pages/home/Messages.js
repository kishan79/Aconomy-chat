import React, { Fragment, useEffect, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { Col, Form } from 'react-bootstrap'

import { useAuthState } from "../../context/auth";
import { useMessageDispatch, useMessageState } from '../../context/message'

import Message from './Message'

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!, $user_wallet_address: String!) {
    sendMessage(to: $to, content: $content, user_wallet_address: $user_wallet_address) {
      _id
      from
      to
      content
      createdAt
    }
  }
`

const GET_MESSAGES = gql`
  query getMessages($from: String!, $user_wallet_address: String!) {
    getMessages(from: $from, user_wallet_address: $user_wallet_address) {
      _id
      from
      to
      content
      createdAt
    }
  }
`

export default function Messages() {
  const { users } = useMessageState()
  const dispatch = useMessageDispatch()
  const [content, setContent] = useState('')

  const selectedUser = users?.find((u) => u.selected === true)
  const messages = selectedUser?.messages

  const { user } = useAuthState();

  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES)

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (err) => console.log(err),
  })

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.wallet_address, user_wallet_address: user.wallet_address } })
    }
  }, [selectedUser])

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: 'SET_USER_MESSAGES',
        payload: {
          wallet_address: selectedUser.wallet_address,
          messages: messagesData.getMessages,
        },
      })
    }
  }, [messagesData])

  const submitMessage = (e) => {
    e.preventDefault()

    if (content.trim() === '' || !selectedUser) return

    setContent('')

    // mutation for sending the message
    sendMessage({ variables: { to: selectedUser.wallet_address, content, user_wallet_address: user.wallet_address } })
  }

  let selectedChatMarkup
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>
  } else if (messagesLoading) {
    selectedChatMarkup = <p className="info-text">Loading..</p>
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message._id}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ))
  } else if (messages.length === 0) {
    selectedChatMarkup = (
      <p className="info-text">
        You are now connected! send your first message!
      </p>
    )
  }

  return (
    <Col xs={10} md={8}>
      <div className="messages-box d-flex flex-column-reverse">
        {selectedChatMarkup}
      </div>
      <div>
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center">
            <Form.Control
              type="text"
              className="message-input rounded-pill p-4 bg-secondary border-0"
              placeholder="Type a message.."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <i
              className="fas fa-paper-plane fa-2x text-primary ml-2"
              onClick={submitMessage}
              role="button"
            ></i>
          </Form.Group>
        </Form>
      </div>
    </Col>
  )
}
