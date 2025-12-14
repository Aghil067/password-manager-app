import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/solid";

// --- Helper: Extract domain ---
function getDomain(url) {
  if (!url) return "unknown";
  try {
    let fullUrl = url;
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `https://${fullUrl}`;
    }
    const domain = new URL(fullUrl).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0] || "unknown";
  }
}

// --- Helper: Format Date ---
function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

const API_BASE_URL = "https://password-manager-app-t77e.onrender.com";

export default function Dashboard() {
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const [groupedList, setGroupedList] = useState({});
  const [openGroups, setOpenGroups] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // --- Group and sort passwords ---
  useEffect(() => {
    const sortedList = [...list].sort((a, b) => {
      const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;
      const domainDiff = getDomain(a.website).localeCompare(getDomain(b.website));
      if (domainDiff !== 0) return domainDiff;
      return a.username.localeCompare(b.username);
    });
    const groups = sortedList.reduce((acc, item) => {
      const domain = getDomain(item.website);
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(item);
      return acc;
    }, {});
    setGroupedList(groups);
  }, [list]);

  // --- CRUD + Auth Handlers ---
  const loadPasswords = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/passwords`, { credentials: "include" });
      if (res.status === 401) return navigate("/");
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("Error loading passwords:", err);
    }
  };

  const addOrUpdatePassword = async (e) => {
    e?.preventDefault();
    if (!website || !username || !password) return alert("Please fill all fields.");
    const body = { website, username, password };
    let url = `${API_BASE_URL}/passwords`;
    let method = "POST";
    if (editingId) {
      url = `${API_BASE_URL}/passwords/${editingId}`;
      method = "PUT";
    }
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error saving password");
      setWebsite("");
      setUsername("");
      setPassword("");
      setEditingId(null);
      await loadPasswords();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await fetch(`${API_BASE_URL}/passwords/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadPasswords();
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/");
  };

  const handleEdit = (item) => {
    setWebsite(item.website);
    setUsername(item.username);
    setPassword(item.password);
    setEditingId(item._id);
  };

  const handlePinToggle = async (id) => {
    const res = await fetch(`${API_BASE_URL}/passwords/${id}/pin`, {
      method: "PUT",
      credentials: "include",
    });
    const { pinned } = await res.json();
    setList((prev) =>
      prev.map((i) => (i._id === id ? { ...i, pinned } : i))
    );
  };

  const togglePasswordVisibility = (id) =>
    setVisiblePasswords((p) => ({ ...p, [id]: !p[id] }));

  const toggleGroup = (domain) =>
    setOpenGroups((p) => ({ ...p, [domain]: !p[domain] }));

  const handleSeamlessAutofill = (cred) => {
    let url = cred.website.startsWith("http") ? cred.website : `https://${cred.website}`;
    const event = new CustomEvent("autofillRequest", {
      detail: { username: cred.username, password: cred.password, targetUrl: url },
    });
    window.dispatchEvent(event);
  };

  useEffect(() => { loadPasswords(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 p-4 sm:p-8">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-700">Password Manager</h1>
        <button
          onClick={handleLogout}
          className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-4 py-2 rounded-lg shadow-sm transition w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {/* --- Add/Edit Form --- */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-md max-w-5xl mx-auto">
        <form className="space-y-4" onSubmit={addOrUpdatePassword}>
          <input
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 w-full"
            placeholder="Website URL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="border border-pink-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-pink-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
            >
              {editingId ? (
                <>
                  <CheckIcon className="h-5 w-5" /> Update
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" /> Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- Saved Passwords --- */}
      <div className="mt-8 max-w-5xl mx-auto">
        {list.length === 0 ? (
          <p className="text-center text-pink-600 py-6 bg-white/90 rounded-2xl shadow-md">
            No passwords saved yet.
          </p>
        ) : (
          <>
            {/* --- Desktop Table --- */}
            <div className="hidden md:block bg-white/90 rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-pink-300 text-pink-900">
                    <tr>
                      <th className="py-3 px-4">Website</th>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Password</th>
                      <th className="py-3 px-4">Last Updated</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedList).map(([domain, accounts]) =>
                      accounts.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-pink-100 hover:bg-pink-50"
                        >
                          <td className="py-3 px-4 flex items-center gap-2">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                              alt=""
                              className="w-5 h-5 rounded-sm"
                            />
                            <span>{domain}</span>
                          </td>
                          <td className="py-3 px-4">{item.username}</td>
                          <td className="py-3 px-4 font-mono">
                            {visiblePasswords[item._id]
                              ? item.password
                              : "••••••••"}
                            <button
                              className="ml-2 text-pink-500"
                              onClick={() => togglePasswordVisibility(item._id)}
                            >
                              {visiblePasswords[item._id] ? (
                                <EyeSlashIcon className="h-4 w-4 inline" />
                              ) : (
                                <EyeIcon className="h-4 w-4 inline" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
                            {formatDate(item.updatedAt)}
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              onClick={() => handlePinToggle(item._id)}
                              className="p-1 text-xl"
                            >
                              📌
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-pink-500 hover:text-pink-700"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- Mobile Optimized Table-Like Cards --- */}
            <div className="block md:hidden space-y-3">
              {Object.entries(groupedList).map(([domain, accounts]) =>
                accounts.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-md p-4 border border-pink-100 flex flex-col gap-2 hover:bg-pink-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                          alt=""
                          className="w-5 h-5 rounded-sm"
                        />
                        <a
                          href={
                            item.website.startsWith("http")
                              ? item.website
                              : `https://${item.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-pink-700 font-medium truncate"
                        >
                          {domain}
                        </a>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.updatedAt)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">
                          {item.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <span>
                          {visiblePasswords[item._id]
                            ? item.password
                            : "••••••••"}
                        </span>
                        <button
                          className="text-pink-500"
                          onClick={() => togglePasswordVisibility(item._id)}
                        >
                          {visiblePasswords[item._id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-pink-100">
                      <button
                        onClick={() => handlePinToggle(item._id)}
                        className="text-lg"
                        title="Pin"
                      >
                        📌
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-pink-500"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
