import { useEffect, useState } from "react";
import Channels from "./Channels";

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

function WorkspaceDetails({ workspace, onBack }) {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberError, setMemberError] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberCipherId, setMemberCipherId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberMessage, setAddMemberMessage] = useState("");

  const [showChannels, setShowChannels] = useState(false);

  async function loadMembers() {
    const token = localStorage.getItem("cipherToken");

    if (!token || !workspace?.id) {
      setLoadingMembers(false);
      return;
    }

    setLoadingMembers(true);
    setMemberError("");

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspace.id}/members`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await getResponseData(response);

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
        "Workspace members error:",
        error
      );

      setMemberError(
        error.message ||
          "Unable to load workspace members."
      );

    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [workspace?.id]);

  async function handleAddMember(event) {
    event.preventDefault();

    const token =
      localStorage.getItem("cipherToken");

    if (!token || !workspace?.id) {
      return;
    }

    if (!memberCipherId.trim()) {
      setAddMemberMessage(
        "Enter a Cipher ID."
      );
      return;
    }

    setAddingMember(true);
    setAddMemberMessage("");
    setMemberError("");

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspace.id}/members?memberCipherId=${encodeURIComponent(
          memberCipherId.trim()
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await getResponseData(response);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add member."
        );
      }

      setMembers((current) => [
        ...current,
        data
      ]);

      setMemberCipherId("");

      setAddMemberMessage(
        "Member added successfully."
      );

    } catch (error) {
      console.error(
        "Add member error:",
        error
      );

      setAddMemberMessage(
        error.message ||
          "Unable to add member."
      );

    } finally {
      setAddingMember(false);
    }
  }

  if (!workspace) {
    return null;
  }

  if (showChannels) {
    return (
      <Channels
        workspace={workspace}
        onBack={() => {
          setShowChannels(false);
        }}
      />
    );
  }

  const currentUser =
    JSON.parse(
      localStorage.getItem("cipherUser") ||
        "null"
    );

  const isOwner =
    workspace.ownerId === currentUser?.id ||
    workspace.ownerCipherId ===
      currentUser?.cipherId;

  const totalMembers =
    members.length + 1;

  return (
    <div className="workspace-details-page">

      <div className="workspace-details-header">

        <button
          className="workspace-back-button"
          onClick={onBack}
        >
          ← Back to Workspaces
        </button>

        <div className="workspace-details-title">

          <div className="workspace-details-icon">
            C
          </div>

          <div>

            <p className="dashboard-label">
              WORKSPACE
            </p>

            <h2>
              {workspace.name}
            </h2>

            <p>
              {workspace.description ||
                "No description added yet."}
            </p>

          </div>

        </div>

        <span className="workspace-details-status">
          ● Active
        </span>

      </div>


      <div className="workspace-details-grid">

        <section className="workspace-detail-card">

          <div className="workspace-detail-card-icon">
            ♧
          </div>

          <div>

            <span>
              Members
            </span>

            <strong>
              {loadingMembers
                ? "..."
                : totalMembers}
            </strong>

            <small>
              Active workspace members
            </small>

          </div>

        </section>


        <section className="workspace-detail-card">

          <div className="workspace-detail-card-icon">
            ▣
          </div>

          <div>

            <span>
              Channels
            </span>

            <strong>
              0
            </strong>

            <small>
              Create your first channel
            </small>

          </div>

        </section>


        <section className="workspace-detail-card">

          <div className="workspace-detail-card-icon">
            ✓
          </div>

          <div>

            <span>
              Tasks
            </span>

            <strong>
              0
            </strong>

            <small>
              No tasks yet
            </small>

          </div>

        </section>

      </div>


      <div className="workspace-detail-main">

        <section className="workspace-detail-panel">

          <div className="workspace-detail-panel-header">

            <div>

              <h3>
                Workspace Overview
              </h3>

              <p>
                Manage collaboration inside this workspace.
              </p>

            </div>

          </div>


          <div className="workspace-overview-row">

            <span>
              Workspace name
            </span>

            <strong>
              {workspace.name}
            </strong>

          </div>


          <div className="workspace-overview-row">

            <span>
              Description
            </span>

            <strong>
              {workspace.description ||
                "No description added yet."}
            </strong>

          </div>


          <div className="workspace-overview-row">

            <span>
              Owner
            </span>

            <strong>
              {workspace.ownerUsername ||
                "You"}
            </strong>

          </div>


          <div className="workspace-overview-row">

            <span>
              Cipher ID
            </span>

            <strong>
              {workspace.ownerCipherId ||
                "—"}
            </strong>

          </div>


          <div className="workspace-overview-row">

            <span>
              Created
            </span>

            <strong>
              {workspace.createdAt
                ? new Date(
                    workspace.createdAt
                  ).toLocaleDateString()
                : "—"}
            </strong>

          </div>

        </section>


        <section className="workspace-detail-panel">

          <div className="workspace-detail-panel-header">

            <div>

              <h3>
                Collaboration
              </h3>

              <p>
                Workspace collaboration features.
              </p>

            </div>

          </div>


          <div className="workspace-feature-list">

            <button
              type="button"
              className="workspace-feature-item"
              onClick={() =>
                setShowAddMember(
                  !showAddMember
                )
              }
            >

              <span className="workspace-feature-icon">
                ♧
              </span>

              <div>

                <strong>
                  Members
                </strong>

                <small>
                  Manage workspace members
                </small>

              </div>

              <b>
                →
              </b>

            </button>


            <button
              type="button"
              className="workspace-feature-item"
              onClick={() =>
                setShowChannels(true)
              }
            >

              <span className="workspace-feature-icon">
                #
              </span>

              <div>

                <strong>
                  Channels
                </strong>

                <small>
                  Organize conversations by topic
                </small>

              </div>

              <b>
                →
              </b>

            </button>


            <button
              type="button"
              className="workspace-feature-item"
            >

              <span className="workspace-feature-icon">
                ✓
              </span>

              <div>

                <strong>
                  Tasks
                </strong>

                <small>
                  Track project work
                </small>

              </div>

              <b>
                →
              </b>

            </button>


            <button
              type="button"
              className="workspace-feature-item"
            >

              <span className="workspace-feature-icon">
                ▣
              </span>

              <div>

                <strong>
                  Files
                </strong>

                <small>
                  Share workspace files securely
                </small>

              </div>

              <b>
                →
              </b>

            </button>

          </div>

        </section>

      </div>


      <section className="workspace-detail-panel workspace-members-panel">

        <div className="workspace-detail-panel-header">

          <div>

            <h3>
              Workspace Members
            </h3>

            <p>
              People connected to this workspace.
            </p>

          </div>

          {isOwner && (
            <button
              type="button"
              className="workspace-add-member-button"
              onClick={() =>
                setShowAddMember(
                  !showAddMember
                )
              }
            >
              + Add Member
            </button>
          )}

        </div>


        {showAddMember && isOwner && (

          <form
            className="workspace-add-member-form"
            onSubmit={handleAddMember}
          >

            <div>

              <label>
                Member Cipher ID
              </label>

              <input
                type="text"
                placeholder="@TESTUSER-140E"
                value={memberCipherId}
                onChange={(event) =>
                  setMemberCipherId(
                    event.target.value
                  )
                }
              />

            </div>

            <button
              type="submit"
              disabled={addingMember}
            >
              {addingMember
                ? "Adding..."
                : "Add Member"}
            </button>

          </form>

        )}


        {addMemberMessage && (
          <div
            className={
              addMemberMessage.includes(
                "successfully"
              )
                ? "workspace-member-message success"
                : "workspace-member-message"
            }
          >
            {addMemberMessage}
          </div>
        )}


        {memberError && (
          <div className="workspace-member-error">
            {memberError}
          </div>
        )}


        {loadingMembers ? (

          <div className="workspace-members-loading">
            Loading members...
          </div>

        ) : (

          <div className="workspace-members-list">

            <div className="workspace-member-owner">

              <div className="workspace-member-avatar">
                {workspace.ownerUsername
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>

              <div className="workspace-member-info">

                <strong>
                  {workspace.ownerUsername}
                </strong>

                <span>
                  {workspace.ownerCipherId}
                </span>

              </div>

              <span className="workspace-member-role owner">
                OWNER
              </span>

            </div>


            {members.map((member) => (

              <div
                className="workspace-member-item"
                key={member.id}
              >

                <div className="workspace-member-avatar">
                  {member.username
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </div>

                <div className="workspace-member-info">

                  <strong>
                    {member.username}
                  </strong>

                  <span>
                    {member.cipherId}
                  </span>

                </div>

                <span className="workspace-member-role">
                  {member.role}
                </span>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default WorkspaceDetails;