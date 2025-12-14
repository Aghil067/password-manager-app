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

/* ----------------------------- helpers ----------------------------- */
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

/* --------------------------- config --------------------------- */
const API_BASE_URL = "https://password-manager-app-t77e.onrender.com";

/* ============================== Component ============================== */
export default function Dashboard() {
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [list, setList] = useState([]);
  const [groupedList, setGroupedList] = useState({});
  const [openGroups, setOpenGroups] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();

  /* ------------------------ grouping + sorting ------------------------ */
  useEffect(() => {
    const sorted = [...list].sort((a, b) => {
      const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;
      const d = getDomain(a.website).localeCompare(getDomain(b.website));
      if (d !== 0) return d;
      return a.username.localeCompare(b.username);
    });

    const groups = sorted.reduce((acc, item) => {
      const d = getDomain(item.website);
      if (!acc[d]) acc[d] = [];
      acc[d].push(item);
      return acc;
    }, {});
    setGroupedList(groups);
  }, [list]);

  /* ------------------------------ api ------------------------------ */
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
    if (!website || !username || !password) return alert("Please fill in all fields.");

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
      if (!res.ok) throw new Error("Failed saving password");
      setWebsite(""); setUsername(""); setPassword(""); setEditingId(null);
      await loadPasswords();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this credential?")) return;
    await fetch(`${API_BASE_URL}/passwords/${id}`, { method: "DELETE", credentials: "include" });
    await loadPasswords();
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
    navigate("/");
  };

  const handlePinToggle = async (id) => {
    const res = await fetch(`${API_BASE_URL}/passwords/${id}/pin`, { method: "PUT", credentials: "include" });
    const { pinned } = await res.json();
    setList((prev) => prev.map((it) => (it._id === id ? { ...it, pinned } : it)));
  };

  /* ------------------------------ ui helpers ------------------------------ */
  const handleEdit = (item) => {
    setWebsite(item.website);
    setUsername(item.username);
    setPassword(item.password);
    setEditingId(item._id);
  };

  const toggleGroup = (domain) =>
    setOpenGroups((p) => ({ ...p, [domain]: !p[domain] }));

  const togglePasswordVisibility = (id) =>
    setVisiblePasswords((p) => ({ ...p, [id]: !p[id] }));

  const handleSeamlessAutofill = (cred) => {
    const targetUrl = cred.website.startsWith("http") ? cred.website : `https://${cred.website}`;
    const event = new CustomEvent("autofillRequest", {
      detail: { username: cred.username, password: cred.password, targetUrl },
    });
    window.dispatchEvent(event);
  };

  useEffect(() => { loadPasswords(); }, []);

  /* ============================== render ============================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-700">Password Manager</h1>
        <button
          onClick={handleLogout}
          className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-4 py-2 rounded-lg shadow-sm transition w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {/* Add / Edit form */}
      <div className="bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl shadow-md max-w-6xl mx-auto">
        <form className="space-y-4" onSubmit={addOrUpdatePassword}>
          <input
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 w-full"
            placeholder="Website URL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="border border-pink-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-pink-500 hover:text-pink-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
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

      {/* Saved Passwords */}
      <div className="mt-8 max-w-6xl mx-auto">
        {list.length === 0 ? (
          <p className="text-center text-pink-600 py-6 bg-white/90 rounded-2xl shadow-md">
            No passwords saved yet.
          </p>
        ) : (
          <>
            {/* =================== DESKTOP: grouped table with accordion =================== */}
            <div className="hidden md:block bg-white/90 rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-pink-300 text-pink-900">
                    <tr>
                      <th className="py-3 px-4 w-[30%]">Website</th>
                      <th className="py-3 px-4 w-[20%]">Username</th>
                      <th className="py-3 px-4 w-[20%]">Password</th>
                      <th className="py-3 px-4">Last Updated</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    {Object.entries(groupedList).map(([domain, accounts]) => {
                      const first = accounts[0];
                      if (!first) return null;
                      const isOpen = !!openGroups[domain];
                      const logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                      const count = accounts.length;
                      const pinned = first.pinned;

                      return (
                        <React.Fragment key={domain}>
                          {/* group header row */}
                          <tr
                            className={`transition-colors ${
                              pinned ? "bg-pink-50" : "bg-white"
                            } hover:bg-pink-100 border-b border-pink-100`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleGroup(domain)}
                                  className="text-pink-700 hover:text-pink-900"
                                  title={isOpen ? "Collapse" : "Expand"}
                                >
                                  {isOpen ? (
                                    <ChevronUpIcon className="h-5 w-5" />
                                  ) : (
                                    <ChevronDownIcon className="h-5 w-5" />
                                  )}
                                </button>
                                <img src={logo} className="w-5 h-5 rounded-sm" alt="" />
                                <a
                                  href={
                                    first.website.startsWith("http")
                                      ? first.website
                                      : `https://${first.website}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-800 font-medium hover:underline truncate"
                                >
                                  {domain}
                                </a>
                                {count > 1 && (
                                  <span className="text-xs bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full">
                                    {count} accounts
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* show first account inline */}
                            <td className="py-3 px-4">{first.username}</td>
                            <td className="py-3 px-4">
                              <span className="font-mono">
                                {visiblePasswords[first._id] ? first.password : "••••••••"}
                              </span>
                              <button
                                className="ml-2 text-pink-500 hover:text-pink-700"
                                onClick={() => togglePasswordVisibility(first._id)}
                              >
                                {visiblePasswords[first._id] ? (
                                  <EyeSlashIcon className="h-4 w-4 inline" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 inline" />
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-600">
                              {formatDate(first.updatedAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handlePinToggle(first._id)}
                                  className={`p-1 rounded text-xl ${
                                    first.pinned ? "opacity-100" : "opacity-40"
                                  } hover:opacity-80`}
                                  title={first.pinned ? "Unpin" : "Pin"}
                                >
                                  📌
                                </button>
                                <button
                                  onClick={() => handleSeamlessAutofill(first)}
                                  className="text-purple-500 hover:text-purple-700 p-1 rounded hover:bg-purple-100"
                                  title="Autofill"
                                >
                                  <SparklesIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleEdit(first)}
                                  className="text-pink-500 hover:text-pink-700 p-1 rounded hover:bg-pink-100"
                                  title="Edit"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(first._id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* collapsed accounts */}
                          {isOpen &&
                            accounts.slice(1).map((item) => (
                              <tr key={item._id} className="bg-white hover:bg-pink-50 border-b border-pink-100">
                                <td className="py-3 px-4 pl-14 text-gray-600">
                                  <a
                                    href={
                                      item.website.startsWith("http")
                                        ? item.website
                                        : `https://${item.website}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate block hover:underline"
                                    title={item.website}
                                  >
                                    ↳ {item.website}
                                  </a>
                                </td>
                                <td className="py-3 px-4">{item.username}</td>
                                <td className="py-3 px-4">
                                  <span className="font-mono">
                                    {visiblePasswords[item._id] ? item.password : "••••••••"}
                                  </span>
                                  <button
                                    className="ml-2 text-pink-500 hover:text-pink-700"
                                    onClick={() => togglePasswordVisibility(item._id)}
                                  >
                                    {visiblePasswords[item._id] ? (
                                      <EyeSlashIcon className="h-4 w-4 inline" />
                                    ) : (
                                      <EyeIcon className="h-4 w-4 inline" />
                                    )}
                                  </button>
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-600">
                                  {formatDate(item.updatedAt)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handlePinToggle(item._id)}
                                      className={`p-1 rounded text-xl ${
                                        item.pinned ? "opacity-100" : "opacity-40"
                                      } hover:opacity-80`}
                                      title={item.pinned ? "Unpin" : "Pin"}
                                    >
                                      📌
                                    </button>
                                    <button
                                      onClick={() => handleSeamlessAutofill(item)}
                                      className="text-purple-500 hover:text-purple-700 p-1 rounded hover:bg-purple-100"
                                      title="Autofill"
                                    >
                                      <SparklesIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="text-pink-500 hover:text-pink-700 p-1 rounded hover:bg-pink-100"
                                      title="Edit"
                                    >
                                      <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item._id)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
                                      title="Delete"
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================== MOBILE: accordion cards by domain =================== */}
            <div className="block md:hidden space-y-4">
              {Object.entries(groupedList).map(([domain, accounts]) => {
                const first = accounts[0];
                if (!first) return null;
                const isOpen = !!openGroups[domain];
                const count = accounts.length;
                const logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

                return (
                  <div
                    key={domain}
                    className={`rounded-2xl shadow-md overflow-hidden border ${
                      first.pinned ? "border-yellow-300 bg-pink-50" : "border-pink-100 bg-white"
                    }`}
                  >
                    {/* header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={logo} alt="" className="w-6 h-6 rounded-sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-pink-800 truncate">{domain}</div>
                          {count > 1 && (
                            <span className="text-xs bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full inline-block mt-1">
                              {count} accounts
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleGroup(domain)}
                        className="text-pink-700 hover:text-pink-900"
                        title={isOpen ? "Collapse" : "Expand"}
                      >
                        {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* first account row */}
                    <div className="px-4 pb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800 truncate">{first.username}</span>
                        <span className="text-xs text-gray-500">{formatDate(first.updatedAt)}</span>
                      </div>

                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {visiblePasswords[first._id] ? first.password : "••••••••"}
                          </span>
                          <button
                            className="text-pink-500"
                            onClick={() => togglePasswordVisibility(first._id)}
                          >
                            {visiblePasswords[first._id] ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handlePinToggle(first._id)}
                            className={`text-lg ${first.pinned ? "opacity-100" : "opacity-40"} hover:opacity-80`}
                            title={first.pinned ? "Unpin" : "Pin"}
                          >
                            📌
                          </button>
                          <button onClick={() => handleEdit(first)} className="text-pink-500">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(first._id)} className="text-red-500">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* expanded items */}
                    {isOpen &&
                      accounts.slice(1).map((item) => (
                        <div key={item._id} className="px-4 py-3 border-t border-pink-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-800 truncate">{item.username}</span>
                            <span className="text-xs text-gray-500">{formatDate(item.updatedAt)}</span>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">
                                {visiblePasswords[item._id] ? item.password : "••••••••"}
                              </span>
                              <button
                                className="text-pink-500"
                                onClick={() => togglePasswordVisibility(item._id)}
                              >
                                {visiblePasswords[item._id] ? (
                                  <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                  <EyeIcon className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handlePinToggle(item._id)}
                                className={`text-lg ${item.pinned ? "opacity-100" : "opacity-40"} hover:opacity-80`}
                                title={item.pinned ? "Unpin" : "Pin"}
                              >
                                📌
                              </button>
                              <button onClick={() => handleEdit(item)} className="text-pink-500">
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDelete(item._id)} className="text-red-500">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
