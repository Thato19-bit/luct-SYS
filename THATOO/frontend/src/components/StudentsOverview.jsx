import React, { useEffect, useState } from "react";
import { fetchCourses, fetchClasses, fetchUsers } from "../api";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

// --- DEMO DATA ---
const demoCourses = [
  { id: 1, name: "Mathematics", code: "MAT101" },
  { id: 2, name: "Physics", code: "PHY101" },
  { id: 3, name: "Sesotho Literature", code: "SEL101" },
  { id: 4, name: "Entrepreneurship", code: "BBE101" },
  { id: 5, name: "Information Technology", code: "BIT101" },
  { id: 6, name: "Fashion & Retailing", code: "BFR101" },
];

const demoClasses = [
  { id: 1, name: "Math - Lerato", course_id: 1, total_registered: 2 },
  { id: 2, name: "Physics - Thabo", course_id: 2, total_registered: 1 },
  { id: 3, name: "Sesotho Lit - Keletso", course_id: 3, total_registered: 2 },
  { id: 4, name: "Entrepreneurship - Sasa", course_id: 4, total_registered: 1 },
  { id: 5, name: "IT - Didi", course_id: 5, total_registered: 1 },
];

const demoStudents = [
  { id: 1, name: "Mpho", role: "Student", course_id: 1 },
  { id: 2, name: "Palesa", role: "Student", course_id: 1 },
  { id: 3, name: "Teboho", role: "Student", course_id: 2 },
  { id: 4, name: "Kea", role: "Student", course_id: 3 },
  { id: 5, name: "Neo", role: "Student", course_id: 3 },
  { id: 6, name: "Lerato", role: "Student", course_id: 4 },
  { id: 7, name: "Thabo", role: "Student", course_id: 5 },
];

export default function StudentsOverview() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [crs, cls, usrs] = await Promise.all([
          fetchCourses(),
          fetchClasses(),
          fetchUsers(),
        ]);
        setCourses(crs.length ? crs : demoCourses);
        setClasses(cls.length ? cls : demoClasses);
        setUsers(usrs.length ? usrs : demoStudents);
      } catch {
        setCourses(demoCourses);
        setClasses(demoClasses);
        setUsers(demoStudents);
      }
    }
    load();
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const studentsPerCourse = filteredCourses.map((c) =>
    users.filter((u) => u.course_id === c.id).length
  );

  const classesPerCourse = filteredCourses.map(
    (c) => classes.filter((cl) => cl.course_id === c.id).length
  );

  const barData = {
    labels: filteredCourses.map((c) => c.name),
    datasets: [{ label: "Students", data: studentsPerCourse, backgroundColor: "#4e73df" }],
  };

  const pieColors = ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40"];
  const pieData = {
    labels: filteredCourses.map((c) => c.name),
    datasets: [
      {
        label: "Classes",
        data: classesPerCourse,
        backgroundColor: pieColors.slice(0, filteredCourses.length),
      },
    ],
  };

  const exportExcel = () => {
    const data = users.map((u) => ({
      Name: u.name,
      Role: u.role,
      Course: courses.find((c) => c.id === u.course_id)?.name || "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Name", "Role", "Course"]],
      body: users.map((u) => [
        u.name,
        u.role,
        courses.find((c) => c.id === u.course_id)?.name || "N/A",
      ]),
    });
    doc.save("students.pdf");
  };

  const printList = () => {
    const printContent = document.getElementById("student-list");
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`<html><head><title>Students List</title></head><body>${printContent.innerHTML}</body></html>`);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  return (
    <div className="container my-4">
      <h3 className="mb-3 text-primary">Students Overview</h3>

      <div className="mb-3 d-flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search course..."
          className="form-control w-auto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-success" onClick={exportExcel}>
          Export Excel
        </button>
        <button className="btn btn-danger" onClick={exportPDF}>
          Export PDF
        </button>
        <button className="btn btn-secondary" onClick={printList}>
          Print List
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm hover-card">
            <h6>Students per Course</h6>
            <Bar data={barData} height={150} options={{ responsive: true }} />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm hover-card">
            <h6>Classes per Course</h6>
            <Pie data={pieData} height={150} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      <div id="student-list" className="card p-3 shadow-sm hover-card mb-4">
        <h5>Students List</h5>
        <table className="table table-striped table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Course</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{courses.find((c) => c.id === u.course_id)?.name || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .hover-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0px 4px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
