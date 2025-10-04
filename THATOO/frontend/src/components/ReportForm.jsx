import React, { useState, useEffect } from "react";
import { createReport, fetchReports } from "../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// --- DEMO DATA ---
const demoReports = [
  {
    id: 1,
    faculty_name: "Faculty of ICT",
    class_name: "Math - Lerato",
    week_of_reporting: "1",
    date_of_lecture: "2025-09-01",
    course_name: "Mathematics",
    course_code: "MAT101",
    lecturer_name: "Lerato",
    actual_present: 2,
    total_registered: 3,
    venue: "Room 101",
    scheduled_time: "09:00 - 10:30",
    topic: "Algebra",
    learning_outcomes: "Understand basic algebraic operations",
    recommendations: "Provide extra exercises for students",
  },
];

const empty = {
  faculty_name: "Faculty of ICT",
  class_name: "",
  week_of_reporting: "",
  date_of_lecture: "",
  course_name: "",
  course_code: "",
  lecturer_name: "",
  actual_present: 0,
  total_registered: 0,
  venue: "",
  scheduled_time: "",
  topic: "",
  learning_outcomes: "",
  recommendations: "",
};

export default function ReportForm() {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const data = await fetchReports();
      setReports(data.length ? data : demoReports);
    } catch (err) {
      console.error("Error fetching reports:", err.message);
      setReports(demoReports);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await createReport({
        ...form,
        actual_present: Number(form.actual_present),
        total_registered: Number(form.total_registered),
      });
      setMsg("Report submitted successfully!");
      setForm(empty);
      loadReports();
    } catch (err) {
      setMsg("Error saving report: " + (err.message || ""));
    }
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "reports.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = Object.keys(empty).map((k) => k.replace(/_/g, " ").toUpperCase());
    const tableRows = reports.map((r) => Object.values(r));
    doc.autoTable({ head: [tableColumn], body: tableRows });
    doc.save("reports.pdf");
  };

  return (
    <div className="card p-3 mb-4">
      <h5>Submit Lecture Report</h5>
      {msg && <div className="alert alert-info">{msg}</div>}

      <form onSubmit={onSubmit}>
        {Object.keys(empty).map((key) => (
          <div className="mb-2" key={key}>
            <label className="form-label">{key.replace(/_/g, " ")}</label>
            {key === "learning_outcomes" || key === "recommendations" ? (
              <textarea
                name={key}
                className="form-control"
                value={form[key]}
                onChange={onChange}
              />
            ) : key === "actual_present" || key === "total_registered" ? (
              <input
                type="number"
                name={key}
                className="form-control"
                value={form[key]}
                onChange={onChange}
              />
            ) : key === "date_of_lecture" ? (
              <input
                type="date"
                name={key}
                className="form-control"
                value={form[key]}
                onChange={onChange}
              />
            ) : (
              <input
                name={key}
                className="form-control"
                value={form[key]}
                onChange={onChange}
              />
            )}
          </div>
        ))}
        <button className="btn btn-primary w-100 mt-2" type="submit">
          Submit Report
        </button>
      </form>

      <div className="mt-4">
        <h5>Submitted Reports</h5>
        <div className="mb-2 d-flex gap-2 flex-wrap">
          <button className="btn btn-success" onClick={exportExcel}>
            Export Excel
          </button>
          <button className="btn btn-danger" onClick={exportPDF}>
            Export PDF
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                {Object.keys(empty).map((k) => (
                  <th key={k}>{k.replace(/_/g, " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  {Object.keys(empty).map((k) => (
                    <td key={k}>{r[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
