import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function Workspace() {
  const token = localStorage.getItem("cipherToken");

  const savedUser =
    localStorage.getItem("cipherUser");

  let currentUser = null;

  try {
    currentUser = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch {
    currentUser = null;
  }

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState(null);

  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] =
    useState(null);

  const [channelMessages, setChannelMessages] =
    useState([]);

  const [channelMessage, setChannelMessage] =
    useState("");

  const [tasks, setTasks] = useState([]);

  const [workspaceName, setWorkspaceName] =
    useState("");

  const [workspaceDescription, setWorkspaceDescription] =
    useState("");

  const [channelName, setChannelName] =
    useState("");

  const [channelDescription, setChannelDescription] =
    useState("");

  const [taskTitle, setTaskTitle] =
    useState("");

  const [taskDescription, setTaskDescription] =
    useState("");

  const [taskPriority, setTaskPriority] =
    useState("MEDIUM");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      const response = await fetch(
        `${API}/api/workspaces`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load workspaces."
        );
      }

      const data = await response.json();

      setWorkspaces(data);

      if (data.length > 0) {
        selectWorkspace(data[0]);
      }

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function selectWorkspace(workspace) {
    setSelectedWorkspace(workspace);

    setSelectedChannel(null);
    setChannelMessages([]);

    await Promise.all([
      loadChannels(workspace.id),
      loadTasks(workspace.id),
    ]);
  }

  async function loadChannels(workspaceId) {
    try {
      const response = await fetch(
        `${API}/api/workspaces/${workspaceId}/channels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load channels."
        );
      }

      const data = await response.json();

      setChannels(data);

      if (data.length > 0) {
        selectChannel(data[0]);
      }

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function selectChannel(channel) {
    setSelectedChannel(channel);

    await loadChannelMessages(channel.id);
  }

  async function loadChannelMessages(channelId) {
    try {
      const response = await fetch(
        `${API}/api/channels/${channelId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load channel messages."
        );
      }

      const data = await response.json();

      setChannelMessages(data);

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function sendChannelMessage(event) {
    event.preventDefault();

    if (!selectedChannel) {
      return;
    }

    if (!channelMessage.trim()) {
      return;
    }

    try {
      const params = new URLSearchParams();

      params.append(
        "content",
        channelMessage.trim()
      );

      const response = await fetch(
        `${API}/api/channels/${selectedChannel.id}/messages?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send message."
        );
      }

      setChannelMessage("");

      setChannelMessages((previous) => [
        ...previous,
        data,
      ]);

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadTasks(workspaceId) {
    try {
      const response = await fetch(
        `${API}/api/workspaces/${workspaceId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load tasks."
        );
      }

      const data = await response.json();

      setTasks(data);

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createWorkspace(event) {
    event.preventDefault();

    if (!workspaceName.trim()) {
      setMessage(
        "Workspace name is required."
      );
      return;
    }

    try {
      const params =
        new URLSearchParams();

      params.append(
        "name",
        workspaceName.trim()
      );

      if (workspaceDescription.trim()) {
        params.append(
          "description",
          workspaceDescription.trim()
        );
      }

      const response = await fetch(
        `${API}/api/workspaces?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create workspace."
        );
      }

      setWorkspaceName("");
      setWorkspaceDescription("");

      setMessage(
        "Workspace created successfully."
      );

      await loadWorkspaces();

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createChannel(event) {
    event.preventDefault();

    if (!selectedWorkspace) {
      return;
    }

    if (!channelName.trim()) {
      setMessage(
        "Channel name is required."
      );
      return;
    }

    try {
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
        `${API}/api/workspaces/${selectedWorkspace.id}/channels?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create channel."
        );
      }

      setChannelName("");
      setChannelDescription("");

      setMessage(
        "Channel created successfully."
      );

      await loadChannels(
        selectedWorkspace.id
      );

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createTask(event) {
    event.preventDefault();

    if (!selectedWorkspace) {
      return;
    }

    if (!taskTitle.trim()) {
      setMessage(
        "Task title is required."
      );
      return;
    }

    try {
      const params =
        new URLSearchParams();

      params.append(
        "title",
        taskTitle.trim()
      );

      if (taskDescription.trim()) {
        params.append(
          "description",
          taskDescription.trim()
        );
      }

      params.append(
        "priority",
        taskPriority
      );

      const response = await fetch(
        `${API}/api/workspaces/${selectedWorkspace.id}/tasks?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create task."
        );
      }

      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("MEDIUM");

      setMessage(
        "Task created successfully."
      );

      await loadTasks(
        selectedWorkspace.id
      );

    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="workspace-page">

      {/* HEADER */}

      <div className="workspace-header">

        <div>

          <h1>
            Workspaces
          </h1>

          <p>
            Collaborate with your connections
            in secure project spaces.
          </p>

        </div>

      </div>


      {/* MESSAGE */}

      {message && (
        <div className="workspace-message">
          {message}
        </div>
      )}


      {/* WORKSPACE LAYOUT */}

      <div className="workspace-layout">

        {/* LEFT SIDEBAR */}

        <aside className="workspace-sidebar">

          <h3>
            Your Workspaces
          </h3>


          {workspaces.length === 0 ? (

            <p className="workspace-empty">
              No workspaces yet.
            </p>

          ) : (

            workspaces.map((workspace) => (

              <button
                key={workspace.id}
                className={
                  selectedWorkspace?.id ===
                  workspace.id
                    ? "workspace-item active"
                    : "workspace-item"
                }
                onClick={() =>
                  selectWorkspace(workspace)
                }
              >

                <strong>
                  {workspace.name}
                </strong>

                <span>
                  {workspace.description ||
                    "No description"}
                </span>

              </button>

            ))

          )}


          {/* CREATE WORKSPACE */}

          <form
            className="workspace-form"
            onSubmit={createWorkspace}
          >

            <h3>
              Create Workspace
            </h3>

            <input
              type="text"
              placeholder="Workspace name"
              value={workspaceName}
              onChange={(event) =>
                setWorkspaceName(
                  event.target.value
                )
              }
            />

            <textarea
              placeholder="Description"
              value={workspaceDescription}
              onChange={(event) =>
                setWorkspaceDescription(
                  event.target.value
                )
              }
            />

            <button type="submit">
              Create Workspace
            </button>

          </form>

        </aside>


        {/* RIGHT SIDE */}

        <main className="workspace-content">

          {!selectedWorkspace ? (

            <div className="workspace-placeholder">

              <h2>
                Select a workspace
              </h2>

              <p>
                Create or select a workspace
                to manage channels and tasks.
              </p>

            </div>

          ) : (

            <>

              {/* SELECTED WORKSPACE */}

              <div className="selected-workspace">

                <h2>
                  {selectedWorkspace.name}
                </h2>

                <p>
                  {selectedWorkspace.description ||
                    "Workspace collaboration area"}
                </p>

              </div>


              {/* CHANNELS */}

              <section className="workspace-section">

                <div className="section-heading">

                  <div>

                    <h3>
                      Channels
                    </h3>

                    <p>
                      Discuss different parts
                      of the project.
                    </p>

                  </div>

                </div>


                <div className="workspace-grid">

                  {/* CHANNEL LIST */}

                  <div className="workspace-card">

                    {channels.length === 0 ? (

                      <p>
                        No channels yet.
                      </p>

                    ) : (

                      channels.map((channel) => (

                        <button
                          key={channel.id}
                          className={
                            selectedChannel?.id ===
                            channel.id
                              ? "channel-item active"
                              : "channel-item"
                          }
                          onClick={() =>
                            selectChannel(channel)
                          }
                        >

                          <strong>
                            # {channel.name}
                          </strong>

                          <span>
                            {channel.description ||
                              "Channel discussion"}
                          </span>

                        </button>

                      ))

                    )}

                  </div>


                  {/* CREATE CHANNEL */}

                  <form
                    className="workspace-card workspace-form"
                    onSubmit={createChannel}
                  >

                    <h4>
                      Create Channel
                    </h4>

                    <input
                      type="text"
                      placeholder="Channel name"
                      value={channelName}
                      onChange={(event) =>
                        setChannelName(
                          event.target.value
                        )
                      }
                    />

                    <textarea
                      placeholder="Description"
                      value={channelDescription}
                      onChange={(event) =>
                        setChannelDescription(
                          event.target.value
                        )
                      }
                    />

                    <button type="submit">
                      Create Channel
                    </button>

                  </form>

                </div>

              </section>


              {/* CHANNEL CHAT */}

              {selectedChannel && (

                <section className="workspace-section">

                  <div className="section-heading">

                    <div>

                      <h3>
                        # {selectedChannel.name}
                      </h3>

                      <p>
                        Channel conversation
                      </p>

                    </div>

                  </div>


                  <div className="channel-chat-card">

                    <div className="channel-chat-messages">

                      {channelMessages.length === 0 ? (

                        <div className="channel-empty">

                          <strong>
                            No messages yet
                          </strong>

                          <span>
                            Start the conversation
                            in this channel.
                          </span>

                        </div>

                      ) : (

                        channelMessages.map(
                          (item) => {

                            const isOwnMessage =
                              currentUser?.cipherId &&
                              item.sender?.cipherId ===
                                currentUser.cipherId;

                            return (

                              <div
                                key={item.id}
                                className={
                                  isOwnMessage
                                    ? "channel-message own"
                                    : "channel-message"
                                }
                              >

                                <div className="channel-message-header">

                                  <strong>
                                    {item.sender?.username ||
                                      "User"}
                                  </strong>

                                  <span>
                                    {item.createdAt
                                      ? new Date(
                                          item.createdAt
                                        ).toLocaleTimeString(
                                          [],
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )
                                      : ""}
                                  </span>

                                </div>


                                <div className="channel-message-content">
                                  {item.content}
                                </div>

                              </div>

                            );
                          }
                        )

                      )}

                    </div>


                    {/* SEND MESSAGE */}

                    <form
                      className="channel-message-form"
                      onSubmit={sendChannelMessage}
                    >

                      <input
                        type="text"
                        placeholder={`Message #${selectedChannel.name}`}
                        value={channelMessage}
                        onChange={(event) =>
                          setChannelMessage(
                            event.target.value
                          )
                        }
                      />

                      <button type="submit">
                        Send
                      </button>

                    </form>

                  </div>

                </section>

              )}


              {/* TASKS */}

              <section className="workspace-section">

                <div className="section-heading">

                  <div>

                    <h3>
                      Tasks
                    </h3>

                    <p>
                      Track work and project
                      progress.
                    </p>

                  </div>

                </div>


                <div className="workspace-grid">

                  {/* TASK LIST */}

                  <div className="workspace-card">

                    {tasks.length === 0 ? (

                      <p>
                        No tasks yet.
                      </p>

                    ) : (

                      tasks.map((task) => (

                        <div
                          className="task-item"
                          key={task.id}
                        >

                          <div>

                            <strong>
                              {task.title}
                            </strong>

                            <span>
                              {task.description ||
                                "No description"}
                            </span>

                          </div>


                          <div className="task-meta">

                            <span>
                              {task.status}
                            </span>

                            <span>
                              {task.priority}
                            </span>

                          </div>

                        </div>

                      ))

                    )}

                  </div>


                  {/* CREATE TASK */}

                  <form
                    className="workspace-card workspace-form"
                    onSubmit={createTask}
                  >

                    <h4>
                      Create Task
                    </h4>

                    <input
                      type="text"
                      placeholder="Task title"
                      value={taskTitle}
                      onChange={(event) =>
                        setTaskTitle(
                          event.target.value
                        )
                      }
                    />

                    <textarea
                      placeholder="Description"
                      value={taskDescription}
                      onChange={(event) =>
                        setTaskDescription(
                          event.target.value
                        )
                      }
                    />

                    <select
                      value={taskPriority}
                      onChange={(event) =>
                        setTaskPriority(
                          event.target.value
                        )
                      }
                    >

                      <option value="LOW">
                        Low Priority
                      </option>

                      <option value="MEDIUM">
                        Medium Priority
                      </option>

                      <option value="HIGH">
                        High Priority
                      </option>

                    </select>

                    <button type="submit">
                      Create Task
                    </button>

                  </form>

                </div>

              </section>

            </>

          )}

        </main>

      </div>

    </div>
  );
}

export default Workspace;