
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import "./Messages.css";

const API = "http://localhost:8080/api";
const WS_URL = "ws://localhost:8080/ws";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("cipherToken");

  const currentUser = JSON.parse(
    localStorage.getItem("cipherUser") || "{}"
  );

  const currentCipherId = currentUser.cipherId;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Add a new message without duplicating it.
  const addMessage = (newMessage) => {
    setMessages((previous) => {
      const exists = previous.some(
        (message) => message.id === newMessage.id
      );

      if (exists) {
        return previous;
      }

      return [...previous, newMessage].sort(
        (a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
      );
    });
  };

  // Identify the other user in a connection.
  const getOtherUser = (connection) => {
    if (connection.requesterCipherId === currentCipherId) {
      return {
        cipherId: connection.receiverCipherId,
        username: connection.receiverUsername
      };
    }

    return {
      cipherId: connection.requesterCipherId,
      username: connection.requesterUsername
    };
  };

  // Load accepted connections and create/find conversations.
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/connections`, {
        headers
      });

      if (!response.ok) {
        throw new Error("Unable to load connections.");
      }

      const data = await response.json();

      const connectionList = Array.isArray(data)
        ? data
        : Array.isArray(data.value)
          ? data.value
          : [];

      const acceptedConnections = connectionList.filter(
        (connection) => connection.status === "ACCEPTED"
      );

      const uniqueUsers = [];

      acceptedConnections.forEach((connection) => {
        const otherUser = getOtherUser(connection);

        const alreadyExists = uniqueUsers.some(
          (user) => user.cipherId === otherUser.cipherId
        );

        if (!alreadyExists) {
          uniqueUsers.push(otherUser);
        }
      });

      const conversationList = [];

      for (const otherUser of uniqueUsers) {
        try {
          const response = await fetch(
            `${API}/conversations/direct?receiverCipherId=${encodeURIComponent(
              otherUser.cipherId
            )}`,
            {
              method: "POST",
              headers
            }
          );

          if (!response.ok) {
            console.error(
              `Conversation creation failed for ${otherUser.cipherId}:`,
              await response.text()
            );
            continue;
          }

          const conversation = await response.json();

          conversationList.push({
            ...conversation,
            otherUser
          });
        } catch (err) {
          console.error("Conversation loading error:", err);
        }
      }

      setConversations(conversationList);

      if (conversationList.length > 0) {
        setSelectedConversation((previous) => {
          if (previous) {
            const existing = conversationList.find(
              (conversation) => conversation.id === previous.id
            );

            return existing || conversationList[0];
          }

          return conversationList[0];
        });
      } else {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || "Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  // Load message history.
  const loadMessages = async (conversationId) => {
    try {
      setMessageLoading(true);
      setError("");

      const response = await fetch(
        `${API}/messages?conversationId=${conversationId}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Unable to load messages.");
      }

      const data = await response.json();

      if (
        selectedConversationRef.current?.id === conversationId
      ) {
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setMessages([]);
      setError(err.message || "Unable to load messages.");
    } finally {
      setMessageLoading(false);
    }
  };

  // Establish authenticated WebSocket connection.
  useEffect(() => {
    if (!token) {
      return;
    }

    const client = new Client({
      brokerURL: WS_URL,

      connectHeaders: {
        Authorization: `Bearer ${token}`
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        setConnected(true);
      },

      onDisconnect: () => {
        setConnected(false);
      },

      onWebSocketClose: () => {
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error(
          "WebSocket error:",
          frame.headers.message
        );
        setConnected(false);
      },

      onWebSocketError: (event) => {
        console.error("WebSocket connection error:", event);
        setConnected(false);
      }
    });

    clientRef.current = client;
    client.activate();

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      clientRef.current = null;
      client.deactivate();
      setConnected(false);
    };
  }, [token]);

  // Load conversations on page opening.
  useEffect(() => {
    if (!token) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    loadConversations();
  }, []);

  // Load history when a conversation is selected.
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation?.id]);

  // Subscribe to selected conversation.
  useEffect(() => {
    const client = clientRef.current;

    if (!selectedConversation || !client?.connected) {
      return;
    }

    subscriptionRef.current?.unsubscribe();

    const conversationId = selectedConversation.id;

    const subscription = client.subscribe(
      `/topic/conversations/${conversationId}`,
      (frame) => {
        try {
          const incomingMessage = JSON.parse(frame.body);

          if (
            selectedConversationRef.current?.id === conversationId
          ) {
            addMessage(incomingMessage);
          }
        } catch (err) {
          console.error(
            "Unable to read incoming message:",
            err
          );
        }
      }
    );

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();

      if (subscriptionRef.current === subscription) {
        subscriptionRef.current = null;
      }
    };
  }, [selectedConversation?.id, connected]);

  // Automatically scroll to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // Send message.
  const handleSendMessage = async (event) => {
    event.preventDefault();

    const content = messageText.trim();

    if (!selectedConversation || !content || sending) {
      return;
    }

    const conversationId = selectedConversation.id;

    try {
      setSending(true);
      setError("");

      const client = clientRef.current;

      if (client?.connected) {
        client.publish({
          destination: `/app/conversations/${conversationId}/messages`,
          body: JSON.stringify({ content })
        });

        setMessageText("");
      } else {
        // REST fallback when WebSocket is unavailable.
        const params = new URLSearchParams({
          conversationId: conversationId.toString(),
          content
        });

        const response = await fetch(
          `${API}/messages?${params.toString()}`,
          {
            method: "POST",
            headers
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || "Message could not be sent."
          );
        }

        const savedMessage = await response.json();

        if (
          selectedConversationRef.current?.id === conversationId
        ) {
          addMessage(savedMessage);
        }

        setMessageText("");
      }
    } catch (err) {
      setError(err.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  // Enter sends; Shift + Enter creates a new line.
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (
        selectedConversation &&
        messageText.trim() &&
        !sending
      ) {
        handleSendMessage(event);
      }
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) {
      return "";
    }

    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Loading screen.
  if (loading) {
    return (
      <div className="messages-page">
        <div className="messages-header">
          <p className="dashboard-label">
            SECURE COMMUNICATION
          </p>

          <h2>Messages</h2>

          <p>
            Communicate securely with your Cipher Connect
            connections.
          </p>
        </div>

        <div className="messages-layout">
          <div className="messages-loading">
            Loading conversations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">

      <div className="messages-header">
        <p className="dashboard-label">
          SECURE COMMUNICATION
        </p>

        <h2>Messages</h2>

        <p>
          Communicate securely with your Cipher Connect
          connections.
        </p>
      </div>

      <div className="messages-layout">

        {/* Conversation sidebar */}
        <aside className="messages-sidebar">

          <div className="messages-sidebar-header">
            <h3>Conversations</h3>

            <span>
              {conversations.length}{" "}
              {conversations.length === 1
                ? "conversation"
                : "conversations"}
            </span>
          </div>

          <div className="conversation-list">

            {conversations.length === 0 ? (
              <div className="messages-empty-small">
                <div className="empty-icon">C</div>

                <strong>No conversations yet</strong>

                <span>
                  Accept a connection to start chatting.
                </span>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`conversation-item ${
                    selectedConversation?.id === conversation.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setError("");
                    setSelectedConversation(conversation);
                  }}
                >
                  <div className="message-avatar">
                    {conversation.otherUser.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="conversation-user">
                    <strong>
                      {conversation.otherUser.username}
                    </strong>

                    <span>
                      {conversation.otherUser.cipherId}
                    </span>
                  </div>
                </button>
              ))
            )}

          </div>
        </aside>

        {/* Main chat panel */}
        <section className="chat-panel">

          {selectedConversation ? (
            <>
              {/* Selected conversation header */}
              <div className="chat-header">

                <div className="chat-user-avatar">
                  {selectedConversation.otherUser.username
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {selectedConversation.otherUser.username}
                  </strong>

                  <span>
                    {selectedConversation.otherUser.cipherId}
                  </span>
                </div>

                <div className="chat-secure-status">
                  {connected ? "Live" : "Offline"}
                </div>

              </div>

              {/* Message history */}
              <div className="chat-messages">

                {messageLoading ? (
                  <div className="chat-loading">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-no-messages">
                    <div>C</div>

                    <h3>Start the conversation</h3>

                    <p>
                      Send a message to{" "}
                      {selectedConversation.otherUser.username}.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine =
                      message.sender?.cipherId === currentCipherId;

                    return (
                      <div
                        key={message.id}
                        className={`message-row ${
                          isMine ? "mine" : "theirs"
                        }`}
                      >
                        <div className="message-bubble">

                          {!isMine && (
                            <span className="message-sender">
                              {message.sender?.username}
                            </span>
                          )}

                          <p>{message.content}</p>

                          <span className="message-time">
                            {formatTime(message.createdAt)}
                          </span>

                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />

              </div>
            </>
          ) : (
            <>
              {/* Empty conversation header */}
              <div className="chat-header">

                <div className="chat-user-avatar">
                  C
                </div>

                <div>
                  <strong>New Message</strong>

                  <span>
                    No active conversation selected
                  </span>
                </div>

                <div className="chat-secure-status">
                  {connected ? "Live" : "Offline"}
                </div>

              </div>

              <div className="chat-empty">

                <div className="chat-empty-icon">
                  C
                </div>

                <h3>Ready to communicate?</h3>

                <p>
                  Select a connection from the left to start
                  exchanging messages.
                </p>

              </div>
            </>
          )}

          {/* Always-visible message composer */}
          <div className="message-input-area">

            {error && (
              <div className="message-error">
                {error}
              </div>
            )}

            <form
              className="message-input-row"
              onSubmit={handleSendMessage}
            >

              <textarea
                placeholder={
                  selectedConversation
                    ? "Write your message here..."
                    : "Select a conversation before sending..."
                }
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={1}
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !messageText.trim() ||
                  !selectedConversation
                }
              >
                {sending ? "Sending..." : "Send"}
              </button>

            </form>

            <div className="message-composer-hint">
              Enter to send · Shift + Enter for a new line
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Messages;
