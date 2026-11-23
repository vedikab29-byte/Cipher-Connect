import { useEffect, useState } from "react";
import WorkspaceDetails from "./WorkspaceDetails";

const API_URL = "http://localhost:8080";

function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);

  const [selectedWorkspace, setSelectedWorkspace] =
    useState(null);

  const [showForm, setShowForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadWorkspaces() {
    const token = localStorage.getItem("cipherToken");

    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session has expired."
          );
        }

        throw new Error(
          "Unable to load workspaces."
        );
      }

      const data = await response.json();

      const workspaceList = Array.isArray(data)
        ? data
        : Array.isArray(data.value)
          ? data.value
          : [];

      setWorkspaces(workspaceList);

    } catch (error) {
      console.error(
        "Workspace loading error:",
        error
      );

      setError(
        error.message ||
        "Unable to load workspaces."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function handleCreateWorkspace(event) {
    event.preventDefault();

    if (!workspaceName.trim()) {
      return;
    }

    const token =
      localStorage.getItem("cipherToken");

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const params = new URLSearchParams();

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
        `${API_URL}/api/workspaces?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to create workspace."
        );
      }

      setWorkspaces((current) => [
        ...current,
        data
      ]);

      setWorkspaceName("");
      setWorkspaceDescription("");
      setShowForm(false);

    } catch (error) {
      console.error(
        "Workspace creation error:",
        error
      );

      setError(
        error.message ||
        "Unable to create workspace."
      );

    } finally {
      setCreating(false);
    }
  }

  function openWorkspace(workspace) {
    setSelectedWorkspace(workspace);
    setError("");
  }

  function closeWorkspace() {
    setSelectedWorkspace(null);
  }

  if (selectedWorkspace) {
    return (
      <WorkspaceDetails
        workspace={selectedWorkspace}
        onBack={closeWorkspace}
      />
    );
  }

  const totalMembers =
    workspaces.length;

  return (
    <div className="workspaces-page">

      <div className="workspaces-header">

        <div>

          <p className="dashboard-label">
            COLLABORATION
          </p>

          <h2>
            Workspaces
          </h2>

          <p>
            Organize your projects, teams and collaboration
            in dedicated workspaces.
          </p>

        </div>

        <button
          className="workspace-create-button"
          onClick={() => {
            setShowForm(true);
            setError("");
          }}
        >
          + Create Workspace
        </button>

      </div>

      {error && (
        <div className="workspace-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="workspace-form-panel">

          <div className="workspace-form-header">

            <div>

              <h3>
                Create a workspace
              </h3>

              <p>
                Create a dedicated space for your project or team.
              </p>

            </div>

            <button
              type="button"
              className="workspace-close-button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
            >
              ×
            </button>

          </div>

          <form
            className="workspace-form"
            onSubmit={handleCreateWorkspace}
          >

            <label>
              Workspace name

              <input
                type="text"
                placeholder="e.g. Final Year Project"
                value={workspaceName}
                onChange={(event) =>
                  setWorkspaceName(
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Description

              <textarea
                placeholder="What is this workspace for?"
                value={workspaceDescription}
                onChange={(event) =>
                  setWorkspaceDescription(
                    event.target.value
                  )
                }
                rows="4"
              />
            </label>

            <div className="workspace-form-actions">

              <button
                type="button"
                className="workspace-cancel-button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="workspace-save-button"
                disabled={
                  creating ||
                  !workspaceName.trim()
                }
              >
                {creating
                  ? "Creating..."
                  : "Create Workspace"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="workspace-stats">

        <div className="workspace-stat-card">

          <span>
            Total Workspaces
          </span>

          <strong>
            {loading
              ? "..."
              : workspaces.length}
          </strong>

        </div>

        <div className="workspace-stat-card">

          <span>
            Active
          </span>

          <strong>
            {loading
              ? "..."
              : workspaces.length}
          </strong>

        </div>

        <div className="workspace-stat-card">

          <span>
            Total Members
          </span>

          <strong>
            {loading
              ? "..."
              : totalMembers}
          </strong>

        </div>

      </div>

      <div className="workspace-section-header">

        <div>

          <h3>
            Your Workspaces
          </h3>

          <p>
            Manage the spaces where your teams collaborate.
          </p>

        </div>

      </div>

      {loading ? (

        <div className="workspace-loading">
          Loading your workspaces...
        </div>

      ) : workspaces.length === 0 ? (

        <div className="workspace-empty">

          <div>
            C
          </div>

          <strong>
            No workspaces yet
          </strong>

          <span>
            Create your first workspace to start collaborating.
          </span>

        </div>

      ) : (

        <div className="workspace-grid">

          {workspaces.map((workspace) => (

            <div
              className="workspace-card"
              key={workspace.id}
            >

              <div className="workspace-card-top">

                <div className="workspace-icon">
                  C
                </div>

                <span className="workspace-status">
                  Active
                </span>

              </div>

              <div className="workspace-card-content">

                <h3>
                  {workspace.name}
                </h3>

                <p>
                  {workspace.description ||
                    "No description added yet."}
                </p>

              </div>

              <div className="workspace-card-footer">

                <span>
                  1 member
                </span>

                <button
                  type="button"
                  className="workspace-open-button"
                  onClick={() =>
                    openWorkspace(workspace)
                  }
                >
                  Open
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Workspaces;