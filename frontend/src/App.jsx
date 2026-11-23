
import { useEffect, useState } from "react";
import "./App.css";

import Connections from "./Connections";
import Messages from "./Messages";
import Workspaces from "./Workspaces";
import Tasks from "./Tasks";

const API_URL = "http://localhost:8080";

function App() {
  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("cipherToken"))
  );

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("cipherUser");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  // ==========================================
  // DASHBOARD STATE
  // ==========================================

  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [authError, setAuthError] = useState("");
  const [dashboardError, setDashboardError] = useState("");

  // ==========================================
  // SETTINGS STATE
  // ==========================================

  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");

  const [theme, setTheme] = useState(
    localStorage.getItem("cipherTheme") || "light"
  );

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("cipherNotifications");

      return saved
        ? JSON.parse(saved)
        : {
            connectionRequests: true,
            securityAlerts: true,
            messageNotifications: true
          };
    } catch {
      return {
        connectionRequests: true,
        securityAlerts: true,
        messageNotifications: true
      };
    }
  });

  const [copied, setCopied] = useState(false);

  // ==========================================
  // LOAD DASHBOARD CONNECTIONS
  // ==========================================

  async function loadDashboardData() {
    const token = localStorage.getItem("cipherToken");

    if (!token) {
      return;
    }

    setDashboardLoading(true);
    setDashboardError("");

    try {
      const response = await fetch(
        `${API_URL}/api/connections`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }

        throw new Error("Unable to load connections.");
      }

      const data = await response.json();

      const connectionList = Array.isArray(data)
        ? data
        : Array.isArray(data.value)
          ? data.value
          : [];

      const accepted = connectionList.filter(
        (connection) => connection.status === "ACCEPTED"
      );

      setConnections(accepted);
    } catch (error) {
      console.error("Dashboard connection error:", error);

      setDashboardError(
        "Could not load live connection data."
      );
    } finally {
      setDashboardLoading(false);
    }
  }

  // ==========================================
  // LOAD PENDING CONNECTION REQUESTS
  // ==========================================

  async function loadPendingRequests() {
    const token = localStorage.getItem("cipherToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/connections/requests/received`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const requestList = Array.isArray(data)
        ? data
        : Array.isArray(data.value)
          ? data.value
          : [];

      setPendingRequests(
        requestList.filter(
          (request) => request.status === "PENDING"
        )
      );
    } catch (error) {
      console.error("Pending request error:", error);
    }
  }

  // ==========================================
  // LOAD DASHBOARD AFTER LOGIN
  // ==========================================

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
      loadPendingRequests();
    }
  }, [isLoggedIn]);

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  useEffect(() => {
    localStorage.setItem("cipherTheme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "cipherNotifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // ==========================================
  // AUTHENTICATION: LOGIN / REGISTER
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setAuthError("");
    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = isRegister
        ? {
            username,
            email,
            password
          }
        : {
            email,
            password
          };

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAuthError(
          data.message ||
          data.error ||
          "Something went wrong."
        );

        return;
      }

      if (isRegister) {
        setIsRegister(false);
        setPassword("");

        setAuthError(
          "Account created successfully. Please sign in."
        );

        return;
      }

      localStorage.setItem(
        "cipherToken",
        data.accessToken
      );

      const loggedInUser = {
        username: data.username,
        email: data.email,
        cipherId: data.cipherId,
        status: data.status
      };

      localStorage.setItem(
        "cipherUser",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);
      setIsLoggedIn(true);
      setCurrentPage("dashboard");

      setPassword("");
    } catch (error) {
      console.error("Authentication error:", error);

      setAuthError(
        "Unable to connect to Cipher Connect."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  function logout() {
    localStorage.removeItem("cipherToken");
    localStorage.removeItem("cipherUser");

    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage("dashboard");

    setConnections([]);
    setPendingRequests([]);

    setEmail("");
    setUsername("");
    setPassword("");
    setAuthError("");
  }

  // ==========================================
  // PAGE NAVIGATION
  // ==========================================

  function navigate(page) {
    setCurrentPage(page);

    if (page === "dashboard") {
      loadDashboardData();
      loadPendingRequests();
    }
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  function getInitial(name) {
    if (!name) {
      return "U";
    }

    return name.charAt(0).toUpperCase();
  }

  function getConnectionUser(connection) {
    if (connection.requesterUsername === user?.username) {
      return {
        username: connection.receiverUsername,
        cipherId: connection.receiverCipherId
      };
    }

    return {
      username: connection.requesterUsername,
      cipherId: connection.requesterCipherId
    };
  }

  // ==========================================
  // SETTINGS FUNCTIONS
  // ==========================================

  function updateNotification(setting) {
    setNotifications((previous) => ({
      ...previous,
      [setting]: !previous[setting]
    }));
  }

  async function copyCipherId() {
    if (!user?.cipherId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(user.cipherId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy Cipher ID:", error);
    }
  }

  // ==========================================
  // LOGIN / REGISTER PAGE
  // ==========================================

  if (!isLoggedIn) {
    return (
      <div className="auth-page">

        <div className="auth-left">

          <div className="auth-brand">
            <div className="auth-brand-icon">
              C
            </div>

            <span>
              Cipher Connect
            </span>
          </div>

          <div className="auth-left-content">

            <h1>
              Connect. Collaborate.
              <br />
              Communicate. Complete.
            </h1>

            <p>
              A secure communication and collaboration
              platform for teams, students, startups and
              modern organizations.
            </p>

            <div className="auth-features">

              <div>
                <strong>◈</strong>

                <span>
                  End-to-end security
                  <small>
                    Protect your data
                  </small>
                </span>
              </div>

              <div>
                <strong>♧</strong>

                <span>
                  Secure connections
                  <small>
                    Work together, faster
                  </small>
                </span>
              </div>

              <div>
                <strong>✓</strong>

                <span>
                  Role-based access
                  <small>
                    Control who can do what
                  </small>
                </span>
              </div>

            </div>
          </div>
        </div>

        <div className="auth-right">

          <div className="auth-form-card">

            <div className="auth-tabs">

              <button
                className={!isRegister ? "active" : ""}
                onClick={() => {
                  setIsRegister(false);
                  setAuthError("");
                }}
              >
                Login
              </button>

              <button
                className={isRegister ? "active" : ""}
                onClick={() => {
                  setIsRegister(true);
                  setAuthError("");
                }}
              >
                Register
              </button>

            </div>

            <div className="auth-heading">

              <h2>
                {isRegister
                  ? "Create your account"
                  : "Welcome back"}
              </h2>

              <p>
                {isRegister
                  ? "Create your secure Cipher Connect identity."
                  : "Sign in to continue to Cipher Connect."}
              </p>

            </div>

            {authError && (
              <div className="auth-message">
                {authError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              {isRegister && (
                <div className="form-group">

                  <label>
                    Username
                  </label>

                  <input
                    type="text"
                    value={username}
                    placeholder="Enter your username"
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    required
                  />

                </div>
              )}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                    ? "Create account"
                    : "Sign in"}
              </button>

            </form>

            <div className="auth-switch">

              <span>
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </span>

              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setAuthError("");
                }}
              >
                {isRegister ? "Login" : "Register"}
              </button>

            </div>

          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-brand-icon">
            C
          </div>

          <div>
            <strong>
              Cipher Connect
            </strong>

            <span>
              Secure Workspace
            </span>
          </div>

        </div>

        <div className="sidebar-user">

          <div className="sidebar-avatar">
            {getInitial(user?.username)}
          </div>

          <div className="sidebar-user-info">

            <strong>
              {user?.username}
            </strong>

            <span>
              {user?.cipherId}
            </span>

            <small>
              <i></i>
              Online
            </small>

          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          <button
            className={
              currentPage === "dashboard"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => navigate("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              currentPage === "connections"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => navigate("connections")}
          >
            <span>♧</span>
            Connections

            {pendingRequests.length > 0 && (
              <b className="nav-badge">
                {pendingRequests.length}
              </b>
            )}
          </button>

          <button
            className={
              currentPage === "messages"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => navigate("messages")}
          >
            <span>▣</span>
            Messages
          </button>

          <button
            className={
              currentPage === "workspaces"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => navigate("workspaces")}
          >
            <span>▦</span>
            Workspaces
          </button>

          <button
            className={
              currentPage === "tasks"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => navigate("tasks")}
          >
            <span>✓</span>
            Tasks
          </button>

          <button
            className={
              currentPage === "settings"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => navigate("settings")}
          >
            <span>⚙</span>
            Settings
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="sidebar-logout"
            onClick={logout}
          >
            ⇥
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* ==================================
            DASHBOARD
        ================================== */}

        {currentPage === "dashboard" && (

          <div className="dashboard-page">

            <div className="page-header">

              <div>

                <span className="page-eyebrow">
                  SECURE WORKSPACE
                </span>

                <h1>
                  Dashboard
                </h1>

                <p>
                  Welcome back,{" "}
                  <strong>
                    {user?.username}
                  </strong>
                </p>

              </div>

              <button
                className="notification-button"
                title="Notifications"
                onClick={() => navigate("settings")}
              >
                ♢

                {pendingRequests.length > 0 && (
                  <i></i>
                )}
              </button>

            </div>

            {dashboardError && (
              <div className="dashboard-error">
                {dashboardError}
              </div>
            )}

            {/* DASHBOARD STATISTICS */}

            <div className="stats-grid">

              <div className="stat-card">

                <div className="stat-icon purple">
                  ♧
                </div>

                <div>
                  <span>
                    Connections
                  </span>

                  <strong>
                    {dashboardLoading
                      ? "..."
                      : connections.length}
                  </strong>
                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon green">
                  ▣
                </div>

                <div>
                  <span>
                    Messages
                  </span>

                  <strong>
                    —
                  </strong>
                </div>

                <small className="stat-note">
                  Open Messages
                </small>

              </div>

              <div className="stat-card">

                <div className="stat-icon orange">
                  ▦
                </div>

                <div>
                  <span>
                    Workspaces
                  </span>

                  <strong>
                    1
                  </strong>
                </div>

                <small className="stat-note">
                  Open Workspaces
                </small>

              </div>

              <div className="stat-card">

                <div className="stat-icon red">
                  ✓
                </div>

                <div>
                  <span>
                    Tasks
                  </span>

                  <strong>
                    0
                  </strong>
                </div>

                <small className="stat-note">
                  Coming next
                </small>

              </div>

            </div>

            {/* DASHBOARD CARDS */}

            <div className="dashboard-grid">

              {/* QUICK ACTIONS */}

              <section className="dashboard-card quick-card">

                <div className="card-header">

                  <div>
                    <h2>
                      Quick Actions
                    </h2>

                    <p>
                      Get started with Cipher Connect
                    </p>
                  </div>

                </div>

                <div className="quick-actions">

                  <button
                    onClick={() => navigate("connections")}
                  >
                    <div className="quick-icon purple">
                      ♧
                    </div>

                    <div>
                      <strong>
                        Add a Connection
                      </strong>

                      <span>
                        Connect with another user
                      </span>
                    </div>

                    <b>→</b>
                  </button>

                  <button
                    onClick={() => navigate("messages")}
                  >
                    <div className="quick-icon blue">
                      ▣
                    </div>

                    <div>
                      <strong>
                        Open Messages
                      </strong>

                      <span>
                        Start a secure conversation
                      </span>
                    </div>

                    <b>→</b>
                  </button>

                  <button
                    onClick={() => navigate("workspaces")}
                  >
                    <div className="quick-icon orange">
                      ▦
                    </div>

                    <div>
                      <strong>
                        Create Workspace
                      </strong>

                      <span>
                        Organize your project
                      </span>
                    </div>

                    <b>→</b>
                  </button>

                </div>

              </section>

              {/* CIPHER IDENTITY */}

              <section className="dashboard-card identity-card">

                <div className="card-header">

                  <div>
                    <h2>
                      Your Cipher Identity
                    </h2>

                    <p>
                      Your secure platform identity
                    </p>
                  </div>

                  <span className="secure-dot">
                    ●
                  </span>

                </div>

                <div className="identity-profile">

                  <div className="identity-avatar">
                    {getInitial(user?.username)}
                  </div>

                  <div>
                    <strong>
                      {user?.username}
                    </strong>

                    <span>
                      {user?.cipherId}
                    </span>
                  </div>

                </div>

                <div className="identity-row">
                  <span>Email</span>

                  <strong>
                    {user?.email}
                  </strong>
                </div>

                <div className="identity-row">
                  <span>Status</span>

                  <strong className="online-text">
                    ● Online
                  </strong>
                </div>

              </section>

              {/* RECENT ACTIVITY */}

              <section className="dashboard-card activity-card">

                <div className="card-header">

                  <div>
                    <h2>
                      Recent Activity
                    </h2>

                    <p>
                      Latest account activity
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("connections")}
                  >
                    View all
                  </button>

                </div>

                {connections.length === 0 &&
                pendingRequests.length === 0 ? (

                  <div className="empty-activity">

                    <div>
                      ◌
                    </div>

                    <strong>
                      No recent activity
                    </strong>

                    <span>
                      Connect with someone to get started.
                    </span>

                  </div>

                ) : (

                  <div className="activity-list">

                    {pendingRequests
                      .slice(0, 3)
                      .map((request) => (

                        <div
                          className="activity-item"
                          key={`request-${request.id}`}
                        >

                          <div className="activity-avatar orange">
                            !
                          </div>

                          <div>
                            <strong>
                              New connection request
                            </strong>

                            <span>
                              From{" "}
                              {request.requesterUsername ||
                                "another user"}
                            </span>
                          </div>

                          <small>
                            Pending
                          </small>

                        </div>

                      ))}

                    {connections
                      .slice(0, 3)
                      .map((connection) => {

                        const connectedUser =
                          getConnectionUser(connection);

                        return (
                          <div
                            className="activity-item"
                            key={`connection-${connection.id}`}
                          >

                            <div className="activity-avatar green">
                              ✓
                            </div>

                            <div>
                              <strong>
                                Connection accepted
                              </strong>

                              <span>
                                Connected with{" "}
                                {connectedUser.username}
                              </span>
                            </div>

                            <small>
                              Connected
                            </small>

                          </div>
                        );
                      })}

                  </div>
                )}

              </section>

              {/* SECURITY STATUS */}

              <section className="dashboard-card security-dashboard-card">

                <div className="security-large-icon">
                  ◈
                </div>

                <div>

                  <span className="security-label">
                    SECURITY STATUS
                  </span>

                  <h2>
                    Your account is protected
                  </h2>

                  <p>
                    JWT authentication and protected
                    REST APIs are active for your session.
                  </p>

                </div>

                <div className="security-active">
                  Active
                </div>

              </section>

            </div>
          </div>
        )}

        {/* ==================================
            CONNECTIONS
        ================================== */}

        {currentPage === "connections" && (
          <Connections />
        )}

        {/* ==================================
            MESSAGES
        ================================== */}

        {currentPage === "messages" && (
          <Messages />
        )}

        {/* ==================================
            WORKSPACES
        ================================== */}

        {currentPage === "workspaces" && (
          <Workspaces />
        )}

        {/* ==================================
            TASKS
        ================================== */}

        {currentPage === "tasks" && (
          <Tasks />
        )}

        {/* ==================================
            SETTINGS
        ================================== */}

        {currentPage === "settings" && (

          <div className={`settings-page ${theme}`}>

            {/* SETTINGS HEADER */}

            <div className="page-header settings-header">

              <div>
                <span className="page-eyebrow">
                  ACCOUNT CONTROL
                </span>

                <h1>
                  Settings
                </h1>

                <p>
                  Manage your profile, preferences and account security.
                </p>
              </div>

            </div>

            <div className="settings-layout">

              {/* SETTINGS NAVIGATION */}

              <aside className="settings-sidebar">

                <button
                  className={
                    activeSettingsTab === "profile"
                      ? "active"
                      : ""
                  }
                  onClick={() => setActiveSettingsTab("profile")}
                >
                  <span>◉</span>
                  My Profile
                </button>

                <button
                  className={
                    activeSettingsTab === "appearance"
                      ? "active"
                      : ""
                  }
                  onClick={() => setActiveSettingsTab("appearance")}
                >
                  <span>◐</span>
                  Appearance
                </button>

                <button
                  className={
                    activeSettingsTab === "notifications"
                      ? "active"
                      : ""
                  }
                  onClick={() => setActiveSettingsTab("notifications")}
                >
                  <span>♢</span>
                  Notifications
                </button>

                <button
                  className={
                    activeSettingsTab === "security"
                      ? "active"
                      : ""
                  }
                  onClick={() => setActiveSettingsTab("security")}
                >
                  <span>◈</span>
                  Security
                </button>

              </aside>

              {/* SETTINGS CONTENT */}

              <div className="settings-content">

                {/* PROFILE */}

                {activeSettingsTab === "profile" && (

                  <section className="settings-card">

                    <div className="settings-card-heading">

                      <div>
                        <h2>
                          Profile Information
                        </h2>

                        <p>
                          Your personal Cipher Connect identity.
                        </p>
                      </div>

                      <div className="settings-profile-avatar">
                        {getInitial(user?.username)}
                      </div>

                    </div>

                    <div className="settings-info-list">

                      <div className="settings-info-row">
                        <div>
                          <label>Username</label>

                          <strong>
                            {user?.username || "Not available"}
                          </strong>
                        </div>

                        <span>Account name</span>
                      </div>

                      <div className="settings-info-row">
                        <div>
                          <label>Email Address</label>

                          <strong>
                            {user?.email || "Not available"}
                          </strong>
                        </div>

                        <span>Registered email</span>
                      </div>

                      <div className="settings-info-row">
                        <div>
                          <label>Cipher ID</label>

                          <strong>
                            {user?.cipherId || "Not available"}
                          </strong>
                        </div>

                        <button
                          className="settings-copy-button"
                          onClick={copyCipherId}
                          disabled={!user?.cipherId}
                        >
                          {copied ? "Copied!" : "Copy ID"}
                        </button>
                      </div>

                      <div className="settings-info-row">
                        <div>
                          <label>Account Status</label>

                          <strong className="settings-status">
                            <span></span>
                            Active
                          </strong>
                        </div>

                        <span>Current account</span>
                      </div>

                    </div>

                  </section>
                )}

                {/* APPEARANCE */}

                {activeSettingsTab === "appearance" && (

                  <section className="settings-card">

                    <div className="settings-card-heading">

                      <div>
                        <h2>
                          Appearance
                        </h2>

                        <p>
                          Choose how your Settings page looks.
                        </p>
                      </div>

                    </div>

                    <div className="settings-option">

                      <div>
                        <strong>
                          Light Mode
                        </strong>

                        <p>
                          A bright and clean appearance.
                        </p>
                      </div>

                      <button
                        className={
                          `theme-choice ${theme === "light" ? "selected" : ""}`
                        }
                        onClick={() => setTheme("light")}
                      >
                        ☀ Light

                        {theme === "light" && (
                          <span>✓</span>
                        )}
                      </button>

                    </div>

                    <div className="settings-option">

                      <div>
                        <strong>
                          Dark Mode
                        </strong>

                        <p>
                          A darker appearance for comfortable viewing.
                        </p>
                      </div>

                      <button
                        className={
                          `theme-choice ${theme === "dark" ? "selected" : ""}`
                        }
                        onClick={() => setTheme("dark")}
                      >
                        ☾ Dark

                        {theme === "dark" && (
                          <span>✓</span>
                        )}
                      </button>

                    </div>

                    <p className="settings-note">
                      This appearance preference currently applies
                      to the Settings page.
                    </p>

                  </section>
                )}

                {/* NOTIFICATIONS */}

                {activeSettingsTab === "notifications" && (

                  <section className="settings-card">

                    <div className="settings-card-heading">

                      <div>
                        <h2>
                          Notification Preferences
                        </h2>

                        <p>
                          Choose which notification preferences
                          you want enabled.
                        </p>
                      </div>

                    </div>

                    <div className="settings-toggle-row">

                      <div>
                        <strong>
                          Connection Requests
                        </strong>

                        <p>
                          Notifications for incoming connection requests.
                        </p>
                      </div>

                      <button
                        className={
                          `settings-toggle ${notifications.connectionRequests ? "enabled" : ""}`
                        }
                        onClick={() =>
                          updateNotification("connectionRequests")
                        }
                        aria-label="Toggle connection request notifications"
                        aria-pressed={notifications.connectionRequests}
                      >
                        <span></span>
                      </button>

                    </div>

                    <div className="settings-toggle-row">

                      <div>
                        <strong>
                          Security Alerts
                        </strong>

                        <p>
                          Preferences for important account security alerts.
                        </p>
                      </div>

                      <button
                        className={
                          `settings-toggle ${notifications.securityAlerts ? "enabled" : ""}`
                        }
                        onClick={() =>
                          updateNotification("securityAlerts")
                        }
                        aria-label="Toggle security alerts"
                        aria-pressed={notifications.securityAlerts}
                      >
                        <span></span>
                      </button>

                    </div>

                    <div className="settings-toggle-row">

                      <div>
                        <strong>
                          Message Notifications
                        </strong>

                        <p>
                          Preferences for new message notifications.
                        </p>
                      </div>

                      <button
                        className={
                          `settings-toggle ${notifications.messageNotifications ? "enabled" : ""}`
                        }
                        onClick={() =>
                          updateNotification("messageNotifications")
                        }
                        aria-label="Toggle message notifications"
                        aria-pressed={notifications.messageNotifications}
                      >
                        <span></span>
                      </button>

                    </div>

                    <p className="settings-note">
                      These preferences are saved in this browser.
                      Actual notification delivery still requires
                      notification-system integration.
                    </p>

                  </section>
                )}

                {/* SECURITY */}

                {activeSettingsTab === "security" && (

                  <section className="settings-card">

                    <div className="settings-card-heading">

                      <div>
                        <h2>
                          Security &amp; Account
                        </h2>

                        <p>
                          Review your current account session.
                        </p>
                      </div>

                      <span className="settings-security-icon">
                        ◈
                      </span>

                    </div>

                    <div className="settings-security-banner">

                      <span>✓</span>

                      <div>
                        <strong>
                          Authenticated Session
                        </strong>

                        <p>
                          Your account is currently signed in.
                        </p>
                      </div>

                    </div>

                    <div className="settings-info-list">

                      <div className="settings-info-row">
                        <div>
                          <label>Authentication</label>

                          <strong>
                            JWT Token
                          </strong>
                        </div>

                        <span>Enabled</span>
                      </div>

                      <div className="settings-info-row">
                        <div>
                          <label>Account</label>

                          <strong>
                            {user?.email || "Not available"}
                          </strong>
                        </div>

                        <span>Signed in</span>
                      </div>

                      <div className="settings-info-row">
                        <div>
                          <label>Session Status</label>

                          <strong className="settings-status">
                            <span></span>
                            Active
                          </strong>
                        </div>

                        <span>Current browser</span>
                      </div>

                    </div>

                    <div className="settings-danger-zone">

                      <div>
                        <strong>
                          Sign out of Cipher Connect
                        </strong>

                        <p>
                          End your current authenticated session
                          on this device.
                        </p>
                      </div>

                      <button onClick={logout}>
                        Logout
                      </button>

                    </div>

                  </section>
                )}

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
