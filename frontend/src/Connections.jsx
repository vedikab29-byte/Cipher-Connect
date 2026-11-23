import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

function Connections() {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);

  const [cipherId, setCipherId] = useState("");

  const [loadingConnections, setLoadingConnections] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [sending, setSending] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function getToken() {
    return localStorage.getItem("cipherToken");
  }

  async function loadConnections() {
    const token = getToken();

    if (!token) {
      setLoadingConnections(false);
      return;
    }

    try {
      setLoadingConnections(true);

      const response = await fetch(
        `${API_URL}/api/connections`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load connections."
        );
      }

      const data = await response.json();

      /*
       * Backend returns:
       *
       * {
       *   value: [...],
       *   Count: 1
       * }
       *
       * So we read data.value.
       */

      const connectionList = Array.isArray(data)
        ? data
        : Array.isArray(data.value)
          ? data.value
          : [];

      setConnections(connectionList);

    } catch (error) {
      console.error(
        "Connections error:",
        error
      );

      setMessage(
        "Unable to load your connections."
      );

      setMessageType("error");

    } finally {
      setLoadingConnections(false);
    }
  }

  async function loadRequests() {
    const token = getToken();

    if (!token) {
      setLoadingRequests(false);
      return;
    }

    try {
      setLoadingRequests(true);

      const response = await fetch(
        `${API_URL}/api/connections/requests/received`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load requests."
        );
      }

      const data = await response.json();

      const requestList = Array.isArray(data)
        ? data
        : Array.isArray(data.value)
          ? data.value
          : [];

      setRequests(requestList);

    } catch (error) {
      console.error(
        "Requests error:",
        error
      );

      /*
       * Don't let a request-loading problem
       * hide the actual connections.
       */
      setRequests([]);

    } finally {
      setLoadingRequests(false);
    }
  }

  useEffect(() => {
    loadConnections();
    loadRequests();
  }, []);

  async function sendConnectionRequest(event) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      setMessage("Please log in again.");
      setMessageType("error");
      return;
    }

    const trimmedCipherId = cipherId.trim();

    if (!trimmedCipherId) {
      setMessage("Please enter a Cipher ID.");
      setMessageType("error");
      return;
    }

    if (!trimmedCipherId.startsWith("@")) {
      setMessage(
        "Cipher ID should start with @."
      );
      setMessageType("error");
      return;
    }

    try {
      setSending(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/connections/request?receiverCipherId=${encodeURIComponent(
          trimmedCipherId
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to send connection request."
        );

        setMessageType("error");
        return;
      }

      setMessage(
        "Connection request sent successfully."
      );

      setMessageType("success");

      setCipherId("");

      await loadConnections();
      await loadRequests();

    } catch (error) {
      console.error(
        "Send connection request error:",
        error
      );

      setMessage(
        "Unable to connect to the Cipher Connect server."
      );

      setMessageType("error");

    } finally {
      setSending(false);
    }
  }

  async function acceptRequest(connectionId) {
    const token = getToken();

    if (!token) {
      setMessage("Please log in again.");
      setMessageType("error");
      return;
    }

    try {
      setAcceptingId(connectionId);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/connections/${connectionId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to accept request."
        );

        setMessageType("error");
        return;
      }

      setMessage(
        "Connection request accepted."
      );

      setMessageType("success");

      await loadConnections();
      await loadRequests();

    } catch (error) {
      console.error(
        "Accept request error:",
        error
      );

      setMessage(
        "Unable to connect to the Cipher Connect server."
      );

      setMessageType("error");

    } finally {
      setAcceptingId(null);
    }
  }

  function getOtherUser(connection) {
    const currentUser =
      localStorage.getItem("cipherUser");

    let currentCipherId = "";

    if (currentUser) {
      try {
        const parsedUser =
          JSON.parse(currentUser);

        currentCipherId =
          parsedUser.cipherId || "";

      } catch {
        currentCipherId = "";
      }
    }

    if (
      connection.requesterCipherId &&
      connection.requesterCipherId !== currentCipherId
    ) {
      return {
        username:
          connection.requesterUsername,
        cipherId:
          connection.requesterCipherId,
      };
    }

    if (
      connection.receiverCipherId &&
      connection.receiverCipherId !== currentCipherId
    ) {
      return {
        username:
          connection.receiverUsername,
        cipherId:
          connection.receiverCipherId,
      };
    }

    if (connection.requester) {
      return connection.requester;
    }

    if (connection.receiver) {
      return connection.receiver;
    }

    return null;
  }

  function getDisplayName(user) {
    if (!user) {
      return "Unknown user";
    }

    return (
      user.username ||
      user.cipherId ||
      "Unknown user"
    );
  }

  function getDisplayCipherId(user) {
    if (!user) {
      return "Cipher ID unavailable";
    }

    return (
      user.cipherId ||
      "Cipher ID unavailable"
    );
  }

  function getInitial(user) {
    const name =
      user?.username ||
      user?.cipherId ||
      "?";

    return name
      .charAt(0)
      .toUpperCase();
  }

  return (
    <div className="connections-page">

      <section className="connections-header">

        <div>
          <p className="dashboard-label">
            SECURE NETWORK
          </p>

          <h2>
            Connections
          </h2>

          <p>
            Connect with people using their unique
            Cipher ID.
          </p>
        </div>

      </section>


      <section className="connections-panel">

        <div className="panel-header">

          <div>
            <h3>
              Add a connection
            </h3>

            <p>
              Enter the Cipher ID of the person you
              want to connect with.
            </p>
          </div>

        </div>


        <form
          className="connection-form"
          onSubmit={sendConnectionRequest}
        >

          <input
            type="text"
            placeholder="@USERNAME-XXXX"
            value={cipherId}
            onChange={(event) =>
              setCipherId(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={sending}
          >
            {sending
              ? "Sending..."
              : "Send request"}
          </button>

        </form>


        {message && (
          <div
            className={`connection-message ${
              messageType === "error"
                ? "error"
                : "success"
            }`}
          >
            {message}
          </div>
        )}

      </section>


      <section className="connections-panel">

        <div className="panel-header">

          <div>
            <h3>
              Connection requests
            </h3>

            <p>
              Requests waiting for your response.
            </p>
          </div>

        </div>


        <div className="connection-list">

          {loadingRequests ? (

            <div className="empty-state">
              Loading requests...
            </div>

          ) : requests.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ◦
              </div>

              <strong>
                No pending requests
              </strong>

              <span>
                New connection requests will appear here.
              </span>

            </div>

          ) : (

            requests.map((request) => {

              const user =
                getOtherUser(request);

              return (
                <div
                  className="connection-item"
                  key={request.id}
                >

                  <div className="connection-avatar">
                    {getInitial(user)}
                  </div>

                  <div className="connection-info">

                    <strong>
                      {getDisplayName(user)}
                    </strong>

                    <span>
                      {getDisplayCipherId(user)}
                    </span>

                  </div>

                  <button
                    className="accept-button"
                    onClick={() =>
                      acceptRequest(request.id)
                    }
                    disabled={
                      acceptingId === request.id
                    }
                  >
                    {acceptingId === request.id
                      ? "Accepting..."
                      : "Accept"}
                  </button>

                </div>
              );
            })
          )}

        </div>

      </section>


      <section className="connections-panel">

        <div className="panel-header">

          <div>
            <h3>
              Your connections
            </h3>

            <p>
              People you are connected with on
              Cipher Connect.
            </p>
          </div>

        </div>


        <div className="connection-list">

          {loadingConnections ? (

            <div className="empty-state">
              Loading connections...
            </div>

          ) : connections.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ◉
              </div>

              <strong>
                No connections yet
              </strong>

              <span>
                Accepted connections will appear here.
              </span>

            </div>

          ) : (

            connections.map((connection) => {

              const user =
                getOtherUser(connection);

              return (
                <div
                  className="connection-item"
                  key={connection.id}
                >

                  <div className="connection-avatar">
                    {getInitial(user)}
                  </div>

                  <div className="connection-info">

                    <strong>
                      {getDisplayName(user)}
                    </strong>

                    <span>
                      {getDisplayCipherId(user)}
                    </span>

                  </div>

                  <div className="connected-status">
                    ● Connected
                  </div>

                </div>
              );
            })
          )}

        </div>

      </section>

    </div>
  );
}

export default Connections;