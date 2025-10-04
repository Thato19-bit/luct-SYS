import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", password: "", role: "student" });
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!form.name || !form.password) {
      setError("Please fill all fields");
      return;
    }

    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check duplicate
    if (users.find(u => u.name === form.name)) {
      setError("User already exists");
      return;
    }

    // Save user
    users.push(form);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! You can now login.");
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: 10 }}>
          <label>Name:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password:</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Role:</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="prl">PRL</option>
            <option value="pl">PL</option>
          </select>
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>Register</button>
      </form>
    </div>
  );
}
