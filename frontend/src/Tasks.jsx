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

function Tasks() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState(null);

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [loadingWorkspaces, setLoadingWorkspaces] =
    useState(true);

  const [loadingTasks, setLoadingTasks] =
    useState(false);

  const [loadingMembers, setLoadingMembers] =
    useState(false);

  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [priority, setPriority] =
    useState("MEDIUM");

  const [creating, setCreating] =
    useState(false);

  const [updatingTaskId, setUpdatingTaskId] =
    useState(null);

  const [assigningTaskId, setAssigningTaskId] =
    useState(null);

  async function loadWorkspaces() {
    const token =
      localStorage.getItem("cipherToken");

    if (!token) {
      setError("Your session has expired.");
      setLoadingWorkspaces(false);
      return;
    }

    try {
      setLoadingWorkspaces(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/workspaces`,
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
            "Unable to load workspaces."
        );
      }

      const workspaceList =
        Array.isArray(data)
          ? data
          : [];

      setWorkspaces(workspaceList);

      if (workspaceList.length > 0) {
        setSelectedWorkspace(
          workspaceList[0]
        );
      }

    } catch (error) {
      console.error(
        "Task workspace loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load workspaces."
      );

    } finally {
      setLoadingWorkspaces(false);
    }
  }

  async function loadTasks(workspaceId) {
    const token =
      localStorage.getItem("cipherToken");

    if (!token || !workspaceId) {
      return;
    }

    try {
      setLoadingTasks(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/tasks`,
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
            "Unable to load tasks."
        );
      }

      setTasks(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Task loading error:",
        error
      );

      setError(
        error.message ||
          "Unable to load tasks."
      );

    } finally {
      setLoadingTasks(false);
    }
  }

  async function loadMembers(workspaceId) {
    const token =
      localStorage.getItem("cipherToken");

    if (!token || !workspaceId) {
      return;
    }

    try {
      setLoadingMembers(true);

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/members`,
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
            "Unable to load workspace members."
        );
      }

      setMembers(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Workspace member loading error:",
        error
      );

      setMembers([]);

    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace?.id) {
      loadTasks(
        selectedWorkspace.id
      );

      loadMembers(
        selectedWorkspace.id
      );
    }
  }, [selectedWorkspace?.id]);

  async function handleCreateTask(event) {
    event.preventDefault();

    const token =
      localStorage.getItem("cipherToken");

    if (!token || !selectedWorkspace) {
      return;
    }

    if (!title.trim()) {
      setError(
        "Task title cannot be empty."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      const params =
        new URLSearchParams();

      params.append(
        "title",
        title.trim()
      );

      if (description.trim()) {
        params.append(
          "description",
          description.trim()
        );
      }

      params.append(
        "priority",
        priority
      );

      const response = await fetch(
        `${API_URL}/api/workspaces/${selectedWorkspace.id}/tasks?${params.toString()}`,
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
            "Unable to create task."
        );
      }

      setTasks((current) => [
        data,
        ...current
      ]);

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setShowCreateForm(false);

    } catch (error) {
      console.error(
        "Task creation error:",
        error
      );

      setError(
        error.message ||
          "Unable to create task."
      );

    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(
    taskId,
    newStatus
  ) {
    const token =
      localStorage.getItem("cipherToken");

    if (!token || !selectedWorkspace) {
      return;
    }

    try {
      setUpdatingTaskId(taskId);
      setError("");

      const params =
        new URLSearchParams();

      params.append(
        "status",
        newStatus
      );

      const response = await fetch(
        `${API_URL}/api/workspaces/${selectedWorkspace.id}/tasks/${taskId}/status?${params.toString()}`,
        {
          method: "PUT",
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
            "Unable to update task status."
        );
      }

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: data.status
              }
            : task
        )
      );

    } catch (error) {
      console.error(
        "Task status update error:",
        error
      );

      setError(
        error.message ||
          "Unable to update task status."
      );

    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleAssignTask(
    taskId,
    memberCipherId
  ) {
    const token =
      localStorage.getItem("cipherToken");

    if (
      !token ||
      !selectedWorkspace ||
      !memberCipherId
    ) {
      return;
    }

    try {
      setAssigningTaskId(taskId);
      setError("");

      const params =
        new URLSearchParams();

      params.append(
        "memberCipherId",
        memberCipherId
      );

      const response = await fetch(
        `${API_URL}/api/workspaces/${selectedWorkspace.id}/tasks/${taskId}/assignee?${params.toString()}`,
        {
          method: "PUT",
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
            "Unable to assign task."
        );
      }

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                assignedToId:
                  data.assignedToId,
                assignedToCipherId:
                  data.assignedToCipherId,
                assignedToUsername:
                  data.assignedToUsername
              }
            : task
        )
      );

    } catch (error) {
      console.error(
        "Task assignment error:",
        error
      );

      setError(
        error.message ||
          "Unable to assign task."
      );

    } finally {
      setAssigningTaskId(null);
    }
  }

  function getPriorityClass(taskPriority) {
    if (taskPriority === "HIGH") {
      return "task-priority high";
    }

    if (taskPriority === "LOW") {
      return "task-priority low";
    }

    return "task-priority medium";
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString();
  }

  return (
    <div className="tasks-page">

      <div className="tasks-header">

        <div>

          <span className="page-eyebrow">
            PRODUCTIVITY
          </span>

          <h1>
            Tasks
          </h1>

          <p>
            Create and track work items across
            your Cipher Connect workspaces.
          </p>

        </div>

        <button
          type="button"
          className="task-create-button"
          onClick={() => {
            setShowCreateForm(
              !showCreateForm
            );
            setError("");
          }}
          disabled={
            !selectedWorkspace
          }
        >
          + Create Task
        </button>

      </div>

      {error && (
        <div className="tasks-error">
          {error}
        </div>
      )}

      <section className="tasks-workspace-panel">

        <div className="task-workspace-selector">

          <span>
            WORKSPACE
          </span>

          {loadingWorkspaces ? (

            <strong>
              Loading...
            </strong>

          ) : workspaces.length === 0 ? (

            <strong>
              No workspaces available
            </strong>

          ) : (

            <select
              value={
                selectedWorkspace?.id || ""
              }
              onChange={(event) => {

                const workspace =
                  workspaces.find(
                    (item) =>
                      item.id ===
                      Number(
                        event.target.value
                      )
                  );

                setSelectedWorkspace(
                  workspace || null
                );

                setShowCreateForm(false);
                setError("");

              }}
            >

              {workspaces.map(
                (workspace) => (

                  <option
                    key={workspace.id}
                    value={workspace.id}
                  >
                    {workspace.name}
                  </option>

                )
              )}

            </select>

          )}

        </div>

        <div className="task-workspace-info">

          <span>
            SELECTED WORKSPACE
          </span>

          <strong>
            {selectedWorkspace?.name ||
              "No workspace selected"}
          </strong>

          <p>
            {selectedWorkspace?.description ||
              "No description added yet."}
          </p>

        </div>

      </section>

      {showCreateForm &&
        selectedWorkspace && (

          <section className="task-create-panel">

            <div className="task-create-header">

              <div>

                <span>
                  NEW TASK
                </span>

                <h3>
                  Create a task
                </h3>

                <p>
                  Add a new work item to{" "}
                  {selectedWorkspace.name}.
                </p>

              </div>

              <button
                type="button"
                className="task-close-button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError("");
                }}
              >
                ×
              </button>

            </div>

            <form
              className="task-create-form"
              onSubmit={handleCreateTask}
            >

              <div className="task-form-field">

                <label>
                  Task title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Complete project documentation"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="task-form-field">

                <label>
                  Description
                </label>

                <textarea
                  rows="4"
                  placeholder="Describe what needs to be completed."
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="task-form-field">

                <label>
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                >

                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                </select>

              </div>

              <div className="task-create-actions">

                <button
                  type="button"
                  className="task-cancel-button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="task-save-button"
                  disabled={
                    creating ||
                    !title.trim()
                  }
                >
                  {creating
                    ? "Creating..."
                    : "Create Task"}
                </button>

              </div>

            </form>

          </section>
        )}

      <div className="tasks-stats">

        <div className="task-stat-card">

          <div className="task-stat-icon">
            ✓
          </div>

          <div>

            <span>
              TOTAL TASKS
            </span>

            <strong>
              {loadingTasks
                ? "..."
                : tasks.length}
            </strong>

          </div>

        </div>

        <div className="task-stat-card">

          <div className="task-stat-icon">
            ○
          </div>

          <div>

            <span>
              TO DO
            </span>

            <strong>
              {loadingTasks
                ? "..."
                : tasks.filter(
                    (task) =>
                      task.status ===
                      "TODO"
                  ).length}
            </strong>

          </div>

        </div>

        <div className="task-stat-card">

          <div className="task-stat-icon">
            !
          </div>

          <div>

            <span>
              HIGH PRIORITY
            </span>

            <strong>
              {loadingTasks
                ? "..."
                : tasks.filter(
                    (task) =>
                      task.priority ===
                      "HIGH"
                  ).length}
            </strong>

          </div>

        </div>

      </div>

      <section className="tasks-list-panel">

        <div className="tasks-list-header">

          <div>

            <span>
              WORKSPACE TASKS
            </span>

            <h3>
              Current tasks
            </h3>

            <p>
              Tasks created inside the selected workspace.
            </p>

          </div>

          <div className="task-count-badge">
            {tasks.length}{" "}
            {tasks.length === 1
              ? "task"
              : "tasks"}
          </div>

        </div>

        {loadingTasks ? (

          <div className="task-empty-state">

            <div className="task-loading-circle">
              ...
            </div>

            <strong>
              Loading tasks
            </strong>

            <span>
              Getting your workspace tasks...
            </span>

          </div>

        ) : tasks.length === 0 ? (

          <div className="task-empty-state">

            <div className="task-empty-icon">
              ✓
            </div>

            <strong>
              No tasks yet
            </strong>

            <span>
              Create your first task for this workspace.
            </span>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm(true);
                setError("");
              }}
              disabled={!selectedWorkspace}
            >
              + Create your first task
            </button>

          </div>

        ) : (

          <div className="tasks-list">

            {tasks.map((task) => (

              <div
                className="task-item"
                key={task.id}
              >

                <div className="task-item-check">
                  ✓
                </div>

                <div className="task-item-content">

                  <div className="task-item-title-row">

                    <h4>
                      {task.title}
                    </h4>

                    <span
                      className={
                        getPriorityClass(
                          task.priority
                        )
                      }
                    >
                      {task.priority}
                    </span>

                  </div>

                  <p>
                    {task.description ||
                      "No description added."}
                  </p>

                  <div className="task-item-meta">

                    <span>
                      <b>
                        Status
                      </b>{" "}

                      <select
                        className="task-status-select"
                        value={
                          task.status ||
                          "TODO"
                        }
                        disabled={
                          updatingTaskId ===
                          task.id
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            task.id,
                            event.target.value
                          )
                        }
                      >

                        <option value="TODO">
                          TODO
                        </option>

                        <option value="IN_PROGRESS">
                          IN PROGRESS
                        </option>

                        <option value="COMPLETED">
                          COMPLETED
                        </option>

                      </select>

                      {updatingTaskId ===
                        task.id && (
                        <span>
                          Updating...
                        </span>
                      )}

                    </span>

                    <span>
                      <b>
                        Assigned to
                      </b>{" "}

                      <select
                        className="task-status-select"
                        value={
                          task.assignedToCipherId ||
                          ""
                        }
                        disabled={
                          assigningTaskId ===
                          task.id ||
                          loadingMembers
                        }
                        onChange={(event) =>
                          handleAssignTask(
                            task.id,
                            event.target.value
                          )
                        }
                      >

                        <option value="">
                          Unassigned
                        </option>

                        {selectedWorkspace?.ownerCipherId && (
                          <option
                            value={
                              selectedWorkspace.ownerCipherId
                            }
                          >
                            {selectedWorkspace.ownerUsername ||
                              selectedWorkspace.ownerCipherId}
                            {" "} (Owner)
                          </option>
                        )}

                        {members.map(
                          (member) => (
                            <option
                              key={member.id}
                              value={
                                member.cipherId
                              }
                            >
                              {member.username ||
                                member.cipherId}
                            </option>
                          )
                        )}

                      </select>

                      {assigningTaskId ===
                        task.id && (
                        <span>
                          Assigning...
                        </span>
                      )}

                    </span>

                    <span>
                      <b>
                        Created by
                      </b>{" "}
                      {task.createdByUsername ||
                        "User"}
                    </span>

                    <span>
                      {formatDate(
                        task.createdAt
                      )}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Tasks;