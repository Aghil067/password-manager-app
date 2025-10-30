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

// Helper: Extract domain from URL
function getDomain(url) {
  if (!url) return "unknown";
  try {
    let fullUrl = url;
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `https://${fullUrl}`;
    }
    const domain = new URL(fullUrl).hostname;
    return domain.replace(/^www\./, "");
  } catch (e) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0] || "unknown";
  }
}

// Helper: Format date nicely
function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "Invalid Date";
  }
}

export default function Dashboard() {
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [groupedList, setGroupedList] = useState({});
  const [openGroups, setOpenGroups] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const sortedList = [...list].sort((a, b) => {
      const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;
      const domainA = getDomain(a.website);
      const domainB = getDomain(b.website);
      const domainDiff = domainA.localeCompare(domainB);
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

  const handleSeamlessAutofill = (credential) => {
    let targetUrl = credential.website;
    if (!targetUrl.startsWith("http")) {
      targetUrl = `https://${targetUrl}`;
    }
    const event = new CustomEvent("autofillRequest", {
      detail: {
        username: credential.username,
        password: credential.password,
        targetUrl: targetUrl,
      },
    });
    window.dispatchEvent(event);
  };

  const addOrUpdatePassword = async () => {
    if (!website || !username || !password) {
      alert("Please fill in all fields.");
      return;
    }
    const body = { website, username, password };
    let url = "https://password-manager-app-t77e.onrender.com/passwords";
    let method = "POST";
    if (editingId) {
      url = `https://password-manager-app-t77e.onrender.com/${editingId}`;
      method = "PUT";
    }
    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Server error");
      setEditingId(null);
      setWebsite("");
      setUsername("");
      setPassword("");
      await loadPasswords();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const loadPasswords = async () => {
    try {
      const res = await fetch("https://password-manager-app-t77e.onrender.com/passwords", {
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/");
        return;
      }
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePasswordVisibility = (id) =>
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleGroup = (domain) =>
    setOpenGroups((prev) => ({ ...prev, [domain]: !prev[domain] }));

  const handleEdit = (item) => {
    setWebsite(item.website);
    setUsername(item.username);
    setPassword(item.password);
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await fetch(`https://password-manager-app-t77e.onrender.com/passwords/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadPasswords();
    }
  };

  const handleLogout = async () => {
    await fetch("https://password-manager-app-t77e.onrender.com/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/");
  };

  const handlePinToggle = async (id) => {
    try {
      const res = await fetch(`https://password-manager-app-t77e.onrender.com/${id}/pin`, {
        method: "PUT",
        credentials: "include",
      });
      const { pinned } = await res.json();
      setList((prev) =>
        prev.map((item) => (item._id === id ? { ...item, pinned } : item))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPasswords();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 p-4 md:p-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-700">
          Password Manager
        </h1>
        <button
          onClick={handleLogout}
          className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-4 py-2 rounded-lg shadow-sm transition w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-md max-w-5xl mx-auto space-y-4">
        <input
          className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 w-full"
          placeholder="Website URL"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 w-full"
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
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <button
            onClick={addOrUpdatePassword}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 w-full"
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
      </div>

      {/* Passwords Table */}
      <div className="mt-8 max-w-5xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-md">
        {list.length === 0 ? (
          <p className="text-center text-pink-600 py-6">
            No passwords saved yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-b-2xl">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead className="bg-pink-300 text-pink-900 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 border-b border-pink-400 w-[30%]">
                    Website
                  </th>
                  <th className="py-3 px-4 border-b border-pink-400 w-[20%]">
                    Username
                  </th>
                  <th className="py-3 px-4 border-b border-pink-400 w-[20%]">
                    Password
                  </th>
                  <th className="py-3 px-4 border-b border-pink-400 w-auto text-sm whitespace-nowrap">
                    Last Updated
                  </th>
                  <th className="py-3 px-4 border-b border-pink-400 w-auto">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedList).map(([domain, accounts]) => {
                  const firstAccount = accounts[0];
                  const isGroupOpen = openGroups[domain];
                  const accountCount = accounts.length;
                  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                  const isGroupPinned = firstAccount.pinned;
                  return (
                    <React.Fragment key={domain}>
                      <tr
                        className={`transition-colors duration-150 ${accountCount > 1 ? "bg-pink-100" : "bg-white"
                          } hover:bg-pink-200/50 ${isGroupPinned
                            ? "border-l-4 border-l-yellow-400"
                            : "hover:border-l-4 hover:border-l-yellow-400"
                          }`}
                      >
                        <td className="py-3 px-4 border-b border-pink-100 font-medium text-pink-800 align-top">
                          <div className="flex flex-col">
                            <a
                              href={
                                firstAccount.website.startsWith("http")
                                  ? firstAccount.website
                                  : `https://${firstAccount.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-2 mb-1"
                            >
                              <img
                                src={logoUrl}
                                alt=""
                                className="w-5 h-5 rounded-sm flex-shrink-0"
                              />
                              <span className="truncate">{domain}</span>
                            </a>
                            {accountCount > 1 && (
                              <span className="ml-7 text-xs font-normal text-pink-700 bg-pink-200 px-2 py-0.5 rounded-full self-start">
                                {accountCount} accounts
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 border-b border-pink-100 align-top">
                          {firstAccount.username}
                        </td>
                        <td className="py-3 px-4 border-b border-pink-100 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-mono truncate">
                              {visiblePasswords[firstAccount._id]
                                ? firstAccount.password
                                : "••••••••"}
                            </span>
                            <button
                              className="text-pink-500 hover:text-pink-600"
                              onClick={() =>
                                togglePasswordVisibility(firstAccount._id)
                              }
                            >
                              {visiblePasswords[firstAccount._id] ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 border-b border-pink-100 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(firstAccount.updatedAt)}
                        </td>
                        <td className="py-3 px-4 border-b border-pink-100 align-top">
                          <div className="flex flex-wrap gap-2 items-center">
                            <button
                              onClick={() => handlePinToggle(firstAccount._id)}
                              className={`p-1 rounded text-xl ${isGroupPinned
                                  ? "opacity-100 hover:opacity-75"
                                  : "opacity-30 hover:opacity-60"
                                }`}
                              title={isGroupPinned ? "Unpin" : "Pin"}
                            >
                              📌
                            </button>
                            <button
                              onClick={() =>
                                handleSeamlessAutofill(firstAccount)
                              }
                              className="text-purple-500 hover:text-purple-700 p-1 rounded hover:bg-purple-100"
                              title="Autofill"
                            >
                              <SparklesIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(firstAccount)}
                              className="text-pink-500 hover:text-pink-700 p-1 rounded hover:bg-pink-100"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(firstAccount._id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                            {accountCount > 1 && (
                              <button
                                onClick={() => toggleGroup(domain)}
                                className="text-pink-600 hover:text-pink-800 p-1 rounded hover:bg-pink-100"
                              >
                                {isGroupOpen ? (
                                  <ChevronUpIcon className="h-5 w-5" />
                                ) : (
                                  <ChevronDownIcon className="h-5 w-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isGroupOpen &&
                        accounts.slice(1).map((item) => (
                          <tr
                            key={item._id}
                            className={`bg-white hover:bg-pink-50 ${item.pinned
                                ? "border-l-4 border-l-yellow-400"
                                : "hover:border-l-4 hover:border-l-yellow-400"
                              }`}
                          >
                            <td className="py-3 px-4 border-b border-pink-100 pl-8 text-gray-500 text-sm max-w-[100px]">
                              <a
                                href={
                                  item.website.startsWith("http")
                                    ? item.website
                                    : `https://${item.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline ml-1 truncate block"
                              >
                                ↳ {item.website}
                              </a>
                            </td>
                            <td className="py-3 px-4 border-b border-pink-100">
                              {item.username}
                            </td>
                            <td className="py-3 px-4 border-b border-pink-100">
                              <div className="flex items-center gap-2">
                                <span className="font-mono truncate">
                                  {visiblePasswords[item._id]
                                    ? item.password
                                    : "••••••••"}
                                </span>
                                <button
                                  className="text-pink-500 hover:text-pink-600"
                                  onClick={() =>
                                    togglePasswordVisibility(item._id)
                                  }
                                >
                                  {visiblePasswords[item._id] ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 border-b border-pink-100 text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(item.updatedAt)}
                            </td>
                            <td className="py-3 px-4 border-b border-pink-100">
                              <div className="flex flex-wrap gap-2 items-center">
                                <button
                                  onClick={() => handlePinToggle(item._id)}
                                  className={`p-1 rounded text-xl ${item.pinned
                                      ? "opacity-100 hover:opacity-75"
                                      : "opacity-30 hover:opacity-60"
                                    }`}
                                >
                                  📌
                                </button>
                                <button
                                  onClick={() => handleSeamlessAutofill(item)}
                                  className="text-purple-500 hover:text-purple-700 p-1 rounded hover:bg-purple-100"
                                >
                                  <SparklesIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-pink-500 hover:text-pink-700 p-1 rounded hover:bg-pink-100"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
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
        )}
      </div>
    </div>
  );
}
