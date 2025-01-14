'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  dob: string;
  gender: string;
  website: string;
} 

const AdminPortal: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({
    _id: "",
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    website: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<User[]>("/api/admin/users");
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response ? err.response.data : "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  //export the list to csv file
  const exportToCSV = (data: object[], filename: string) => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }
  
    
    const headers = Object.keys(data[0]).join(",") + "\n";
  
    
    const rows = data
      .map((item) =>
        Object.values(item)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"` 
              : value
          )
          .join(",")
      )
      .join("\n");
  
 
    const csvContent = headers + rows;
  
    // trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
  
    URL.revokeObjectURL(url);
  };

  //upload csv file
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }
  
    if (!file.name.endsWith(".csv")) {
      console.error("Please upload a valid CSV file.");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").map((row) => row.trim());
  
      if (rows.length < 2) {
        console.error("The CSV file must have at least one row of data.");
        return;
      }
  
      const headers = rows[0].split(",").map((header) => header.trim());
      const expectedHeaders = ["name", "email", "password", "dob", "gender", "website"];
      if (!expectedHeaders.every((header) => headers.includes(header))) {
        console.error(`Invalid CSV format. Expected headers: ${expectedHeaders.join(", ")}`);
        return;
      }
  
      try {
        const parsedData: User[] = rows.slice(1).map((row) => {
          const values = row.split(",");
          return {
            _id: "",
            name: values[headers.indexOf("name")]?.trim(),
            email: values[headers.indexOf("email")]?.trim(),
            password: values[headers.indexOf("password")]?.trim(),
            dob: values[headers.indexOf("dob")]?.trim(),
            gender: values[headers.indexOf("gender")]?.trim(),
            website: values[headers.indexOf("website")]?.trim(),
          };
        });
  
        const validData = parsedData.filter((user) => {
          // validations
          const isValidName = /^[a-zA-Z\s]+$/.test(user.name || "");
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email || "");
          const isValidPassword = (user.password || "").length >= 8;
          const isValidDOB = (() => {
            if (!user.dob) return false;
            const dob = new Date(user.dob);
            const age = new Date().getFullYear() - dob.getFullYear();
            return dob instanceof Date && !isNaN(dob.getTime()) && age >= 18;
          })();
          const isValidGender = ["male", "female", "other"].includes(user.gender || "");
          const isValidWebsite = /^https?:\/\/(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/[a-zA-Z0-9#?&=._~-]*)*\/?$/.test(user.website || "");
  
          return (
            isValidName &&
            isValidEmail &&
            isValidPassword &&
            isValidDOB &&
            isValidGender &&
            isValidWebsite
          );
        });
  
        if (validData.length === 0) {
          console.error("No valid data found in the CSV file.");
          return;
        }
  
        // Update local state
        setUsers((prevUsers) => [...prevUsers, ...validData]);
  
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validData),
        });
  
        if (!response.ok) {
          console.error("Failed to upload data to the server.");
          return;
        }
  
        const result = await response.json();
        console.log("Data successfully uploaded to the server:", result);
      } catch (err) {
        console.error("Error parsing the CSV file or uploading data. Please check its structure.");
      }
    };
  
    reader.onerror = () => {
      console.error("Error reading the file. Please try again.");
    };
  
    reader.readAsText(file);
  };
  

  // Add a new user
  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.dob || !newUser.gender || !newUser.website ) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/admin/users", newUser);
      setNewUser({ _id: "", name: "", email: "", password: "", dob: "", gender: "", website: "" });
      setError("");
      fetchUsers();
    } catch (err: any) {
      console.error("Error adding user:", err);
      setError(err.response ? err.response.data : "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  // Update an existing user
  const updateUser = async (id: string) => {
    if (!editingUser) return;

    setLoading(true);
    try {
      await axios.put(`/api/admin/users/${id}`, {
        name: editingUser.name,
        email: editingUser.email,
        password: editingUser.password,
        dob: editingUser.dob,
        gender: editingUser.gender,
        website: editingUser.website,
      });

      setEditingUser(null);
      setError("");
      fetchUsers();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.response ? err.response.data : "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setError("");
      fetchUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.response ? err.response.data : "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Search box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2"
        />
      </div>

      {/*import button */}
      <button
  onClick={() => exportToCSV(users, "users")}
  className="bg-green-500 text-white px-4 py-2 rounded mr-4"
>
  Export to CSV
</button>
  

   {/*upload button */}
   <label htmlFor="file-upload" className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer">
  Upload CSV
</label>
<input
  id="file-upload"
  type="file"
  accept=".csv"
  onChange={handleCSVUpload}
  className="hidden"
/>

      {/* Add User Form */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New User</h2>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={newUser.dob}
          onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
          className="border p-2 mr-2"
        />
        <select
          value={newUser.gender}
          onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="">Select Gender</option>
          <option value="Male">male</option>
          <option value="Female">female</option>
          <option value="Other">other</option>
        </select>
        <input
          type="url"
          placeholder="Website "
          value={newUser.website}
          onChange={(e) => setNewUser({ ...newUser, website: e.target.value })}
          className="border p-2 mr-2"
        />
        <button
          onClick={addUser}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </div>

      {/* User List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
        {loading ? (
          <p>Loading...</p>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="border p-4 mb-2 flex items-center justify-between"
            >
              {editingUser && editingUser._id === user._id ? (
                <>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="border p-2 mr-2"
                  />
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="border p-2 mr-2"
                  />
                  <input
                    type="password"
                    value={editingUser.password}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, password: e.target.value })
                    }
                    className="border p-2 mr-2"
                  />
                  <input
                    type="date"
                    value={editingUser.dob}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, dob: e.target.value })
                    }
                    className="border p-2 mr-2"
                  />
                  <select
                    value={editingUser.gender}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, gender: e.target.value })
                    }
                    className="border p-2 mr-2"
                  >
                    <option value="Male">male</option>
                    <option value="Female">female</option>
                    <option value="Other">other</option>
                  </select>
                  <input
                    type="url"
                    value={editingUser.website}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, website: e.target.value })
                    }
                    className="border p-2 mr-2"
                  />
                  <button
                    onClick={() => updateUser(user._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p>{user.email}</p>
                    <p>{user.dob}</p>
                    <p>{user.gender}</p>
                    <p>{user.website}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
