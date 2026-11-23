import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

async function getResponseData(response) {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function Channels({ workspace, onBack }) {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [channelName, setChannelName] =
    useState("");

  const [channelDescription, setChannelDescription] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [messages, setMessages] =
    useState([]);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [messageText, setMessageText] =
    useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  async function loadChannels() {
    const token =
      localStorage.getItem("cipherToken");

    if (!token || !workspace?.id) {
      setError(
        "Your session has expired."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspace.id}/channels`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await getResponseData(response);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load channels."
        );
      }

      setChannels(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Channel loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load channels."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChannels();
  }, [workspace?.id]);

  async function handleCreateChannel(event) {
    event.preventDefault();

    const token =
      localStorage.getItem("cipherToken");

    if (!token) {
      setError(
        "Your session has expired."
      );
      return;
    }

    if (!channelName.trim()) {
      setError(
        "Channel name cannot be empty."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      const params =
        new URLSearchParams();

      params.append(
        "name",
        channelName.trim()
      );

      if (channelDescription.trim()) {
        params.append(
          "description",
          channelDescription.trim()
        );
      }

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspace.id}/channels?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await getResponseData(response);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create channel."
        );
      }

      setChannels((current) => [
        ...current,
        data
      ]);

      setChannelName("");
      setChannelDescription("");
      setShowCreateForm(false);

    } catch (error) {
      console.error(
        "Channel creation error:",
        error
      );

      setError(
        error.message ||
          "Unable to create channel."
      );

    } finally {
      setCreating(false);
    }
  }

  async function openChannel(channel) {
    const token =
      localStorage.getItem("cipherToken");

    if (!token) {
      setError(
        "Your session has expired."
      );
      return;
    }

    setSelectedChannel(channel);
    setLoadingMessages(true);
    setMessages([]);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/channels/${channel.id}/messages`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await getResponseData(response);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load channel messages."
        );
      }

      setMessages(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Channel message loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load channel messages."
      );

    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    const token =
      localStorage.getItem("cipherToken");

    if (!token || !selectedChannel) {
      return;
    }

    if (!messageText.trim()) {
      return;
    }

    try {
      setSendingMessage(true);
      setError("");

      const params =
        new URLSearchParams();

      params.append(
        "content",
        messageText.trim()
      );

      const response = await fetch(
        `${API_URL}/api/channels/${selectedChannel.id}/messages?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await getResponseData(response);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send message."
        );
      }

      setMessages((current) => [
        ...current,
        data
      ]);

      setMessageText("");

    } catch (error) {
      console.error(
        "Channel message sending error:",
        error
      );

      setError(
        error.message ||
          "Unable to send message."
      );

    } finally {
      setSendingMessage(false);
    }
  }

  function formatDate(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  }

  if (!workspace) {
    return null;
  }

  if (selectedChannel) {
    return (
      <div className="channels-page">

        <div className="channels-header">

          <button
            type="button"
            className="workspace-back-button"
            onClick={() => {
              setSelectedChannel(null);
              setMessages([]);
              setError("");
            }}
          >
            ← Back to Channels
          </button>

          <div className="channels-title">

            <div className="channels-title-icon">
              #
            </div>

            <div>

              <p className="dashboard-label">
                CHANNEL
              </p>

              <h2>
                {selectedChannel.name}
              </h2>

              <p>
                {selectedChannel.description ||
                  "Workspace channel"}
              </p>

            </div>

          </div>

        </div>


        {error && (
          <div className="channels-error">
            {error}
          </div>
        )}


        <section className="channel-chat-panel">

          <div className="channel-chat-header">

            <div>

              <strong>
                #{selectedChannel.name}
              </strong>

              <span>
                {selectedChannel.description ||
                  "Channel conversation"}
              </span>

            </div>

          </div>


          <div className="channel-messages">

            {loadingMessages ? (

              <div className="channel-empty-state">
                Loading messages...
              </div>

            ) : messages.length === 0 ? (

              <div className="channel-empty-state">

                <div className="channel-empty-icon">
                  #
                </div>

                <strong>
                  No messages yet
                </strong>

                <span>
                  Start the conversation in this channel.
                </span>

              </div>

            ) : (

              messages.map((message) => (

                <div
                  className="channel-message"
                  key={message.id}
                >

                  <div className="channel-message-avatar">
                    {message.sender?.username
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>

                  <div className="channel-message-content">

                    <div className="channel-message-meta">

                      <strong>
                        {message.sender?.username ||
                          "User"}
                      </strong>

                      <span>
                        {message.sender?.cipherId}
                      </span>

                      <small>
                        {formatDate(
                          message.createdAt
                        )}
                      </small>

                    </div>

                    <p>
                      {message.content}
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>


          <form
            className="channel-message-form"
            onSubmit={handleSendMessage}
          >

            <input
              type="text"
              placeholder={`Message #${selectedChannel.name}`}
              value={messageText}
              onChange={(event) =>
                setMessageText(
                  event.target.value
                )
              }
            />

            <button
              type="submit"
              disabled={
                sendingMessage ||
                !messageText.trim()
              }
            >
              {sendingMessage
                ? "Sending..."
                : "Send"}
            </button>

          </form>

        </section>

      </div>
    );
  }

  return (
    <div className="channels-page">

      <div className="channels-header">

        <button
          type="button"
          className="workspace-back-button"
          onClick={onBack}
        >
          ← Back to Workspace
        </button>

        <div className="channels-header-main">

          <div>

            <p className="dashboard-label">
              WORKSPACE CHANNELS
            </p>

            <h2>
              {workspace.name}
            </h2>

            <p>
              Organize conversations by project,
              topic and team activity.
            </p>

          </div>

          <button
            type="button"
            className="channel-create-button"
            onClick={() => {
              setShowCreateForm(
                !showCreateForm
              );
              setError("");
            }}
          >
            + Create Channel
          </button>

        </div>

      </div>


      {error && (
        <div className="channels-error">
          {error}
        </div>
      )}


      {showCreateForm && (

        <section className="channel-create-panel">

          <div className="channel-create-header">

            <div>

              <h3>
                Create a channel
              </h3>

              <p>
                Create a dedicated conversation space for this workspace.
              </p>

            </div>

            <button
              type="button"
              className="channel-close-button"
              onClick={() => {
                setShowCreateForm(false);
                setError("");
              }}
            >
              ×
            </button>

          </div>


          <form
            className="channel-create-form"
            onSubmit={handleCreateChannel}
          >

            <label>

              Channel name

              <input
                type="text"
                placeholder="e.g. general"
                value={channelName}
                onChange={(event) =>
                  setChannelName(
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              Description

              <textarea
                rows="3"
                placeholder="What will this channel be used for?"
                value={channelDescription}
                onChange={(event) =>
                  setChannelDescription(
                    event.target.value
                  )
                }
              />

            </label>


            <div className="channel-create-actions">

              <button
                type="button"
                className="channel-cancel-button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="channel-save-button"
                disabled={
                  creating ||
                  !channelName.trim()
                }
              >
                {creating
                  ? "Creating..."
                  : "Create Channel"}
              </button>

            </div>

          </form>

        </section>

      )}


      <div className="channel-stat-card">

        <span>
          Channels
        </span>

        <strong>
          {loading
            ? "..."
            : channels.length}
        </strong>

        <small>
          Active workspace channels
        </small>

      </div>


      <section className="channels-list-panel">

        <div className="channels-list-header">

          <div>

            <h3>
              Channels
            </h3>

            <p>
              Select a channel to view and send messages.
            </p>

          </div>

        </div>


        {loading ? (

          <div className="channel-empty-state">
            Loading channels...
          </div>

        ) : channels.length === 0 ? (

          <div className="channel-empty-state">

            <div className="channel-empty-icon">
              #
            </div>

            <strong>
              No channels yet
            </strong>

            <span>
              Create your first channel for this workspace.
            </span>

          </div>

        ) : (

          <div className="channels-list">

            {channels.map((channel) => (

              <button
                type="button"
                className="channel-list-item"
                key={channel.id}
                onClick={() =>
                  openChannel(channel)
                }
              >

                <div className="channel-list-icon">
                  #
                </div>

                <div className="channel-list-content">

                  <strong>
                    #{channel.name}
                  </strong>

                  <span>
                    {channel.description ||
                      "No description added."}
                  </span>

                </div>

                <b>
                  →
                </b>

              </button>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Channels;