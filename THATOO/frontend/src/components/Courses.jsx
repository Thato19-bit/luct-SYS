import React, { useEffect, useState } from "react";
import { fetchCourses, createCourse, updateCourse, deleteCourse, fetchClasses, fetchUsers } from "../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// --- Demo data for courses, classes, and students ---
const demoCourses = [
  { id: 1, name: "Mathematics", code: "MAT101", description: "Intro to Maths", category: "Science" },
  { id: 2, name: "Physics", code: "PHY101", description: "Physics Basics", category: "Science" },
  { id: 3, name: "Sesotho Literature", code: "SEL101", description: "Study of Sesotho texts", category: "Arts" },
  { id: 4, name: "Business Entrepreneurship", code: "BBE101", description: "Business skills and entrepreneurship", category: "Business" },
  { id: 5, name: "Information Technology", code: "BIT101", description: "IT fundamentals and software", category: "IT" },
  { id: 6, name: "Fashion and Retailing", code: "BFR101", description: "Fashion and retail design", category: "Design" },
];

const demoClasses = [
  { id: 1, name: "Math - Lerato", course_id: 1 },
  { id: 2, name: "Physics - Thabo", course_id: 2 },
  { id: 3, name: "Sesotho Lit - Keletso", course_id: 3 },
  { id: 4, name: "Entrepreneurship - Sasa", course_id: 4 },
  { id: 5, name: "IT - Didi", course_id: 5 },
  { id: 6, name: "Fashion - Palesa", course_id: 6 },
];

const demoStudents = [
  { id: 1, name: "Mpho", class_id: 1 },
  { id: 2, name: "Palesa", class_id: 1 },
  { id: 3, name: "Teboho", class_id: 2 },
  { id: 4, name: "Kea", class_id: 3 },
  { id: 5, name: "Neo", class_id: 3 },
  { id: 6, name: "Lerato", class_id: 4 },
  { id: 7, name: "Thabo", class_id: 5 },
  { id: 8, name: "Boitumelo", class_id: 6 },
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailCourse, setDetailCourse] = useState(null);
  const pageSize = 5;

  // --- Load data ---
  async function load() {
    try {
      const [crs, cls, users] = await Promise.all([fetchCourses(), fetchClasses(), fetchUsers()]);
      setCourses(crs.length ? crs : demoCourses);
      setClasses(cls.length ? cls : demoClasses);
      setStudents(users.length ? users : demoStudents);
    } catch {
      setCourses(demoCourses);
      setClasses(demoClasses);
      setStudents(demoStudents);
    }
  }

  useEffect(() => { load(); }, []);

  // --- Add new course ---
  async function addCourse(e) {
    e.preventDefault();
    if (!name || !code) return alert("Name and code required!");
    await createCourse({ name, code, description, category });
    setName(""); setCode(""); setDescription(""); setCategory(""); load();
  }

  // --- Save edits ---
  async function saveEdit(id) {
    if (!editName || !editCode) return alert("Name and code required!");
    await updateCourse(id, { name: editName, code: editCode, description: editDescription, category: editCategory });
    setEditingId(null); load();
  }

  // --- Delete course ---
  async function removeCourse(id) {
    if (window.confirm("Delete this course?")) { await deleteCourse(id); load(); }
  }

  // --- Toggle selection for bulk actions ---
  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  // --- Export CSV ---
  function exportCSV() {
    const rows = filtered.map(c => ({
      "Course Name": c.name,
      "Course Code": c.code,
      Description: c.description || "",
      Category: c.category || "",
      Classes: classes.filter(cl => cl.course_id === c.id).length,
      Students: students.filter(s => classes.filter(cl => cl.course_id === c.id).map(cl => cl.id).includes(s.class_id)).length
    }));
    const csv = [Object.keys(rows[0]||{}).join(","), ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "courses.csv"; a.click(); URL.revokeObjectURL(url);
  }

  // --- Export Excel ---
  function exportExcel() {
    const rows = filtered.map(c => ({
      "Course Name": c.name,
      "Course Code": c.code,
      Description: c.description || "",
      Category: c.category || "",
      Classes: classes.filter(cl => cl.course_id === c.id).length,
      Students: students.filter(s => classes.filter(cl => cl.course_id === c.id).map(cl => cl.id).includes(s.class_id)).length
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Courses");
    XLSX.writeFile(wb, "courses.xlsx");
  }

  // --- Export PDF ---
  function exportPDF() {
    const doc = new jsPDF();
    const rows = filtered.map(c => [
      c.name,
      c.code,
      c.description || "-",
      c.category || "-",
      classes.filter(cl => cl.course_id === c.id).length,
      students.filter(s => classes.filter(cl => cl.course_id === c.id).map(cl => cl.id).includes(s.class_id)).length
    ]);
    doc.autoTable({ head: [["Name","Code","Description","Category","Classes","Students"]], body: rows });
    doc.save("courses.pdf");
  }

  // --- Bulk delete ---
  async function bulkDelete() {
    if (selected.length === 0) return alert("No courses selected");
    if (!window.confirm(`Delete ${selected.length} courses?`)) return;
    for (const id of selected) { await deleteCourse(id); }
    setSelected([]); load();
  }

  // --- Filter courses ---
  const filtered = courses.filter(c => {
    const matchQuery = query ? c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase()) : true;
    const matchCategory = categoryFilter ? c.category === categoryFilter : true;
    return matchQuery && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  return (
    <div>
      <h3 className="mb-3">🏫 Courses</h3>

      {/* --- Add Course Form --- */}
      <form onSubmit={addCourse} className="mb-3 row g-2">
        <div className="col-md"><input className="form-control" placeholder="Course Name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="col-md"><input className="form-control" placeholder="Code" value={code} onChange={e => setCode(e.target.value)} /></div>
        <div className="col-md"><input className="form-control" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div className="col-md"><input className="form-control" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} /></div>
        <div className="col-auto"><button className="btn btn-primary">Add</button></div>
      </form>

      {/* --- Filters and Export --- */}
      <div className="row mb-2">
        <div className="col-md-6"><input className="form-control" placeholder="Search courses..." value={query} onChange={e => setQuery(e.target.value)} /></div>
        <div className="col-md-4">
          <select className="form-control" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="col-md-2 text-end">
          <button className="btn btn-outline-secondary me-2" onClick={exportCSV}>CSV</button>
          <button className="btn btn-outline-success me-2" onClick={exportExcel}>Excel</button>
          <button className="btn btn-outline-danger me-2" onClick={exportPDF}>PDF</button>
          <button className="btn btn-danger" onClick={bulkDelete}>Delete Selected</button>
        </div>
      </div>

      {/* --- Courses Table --- */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th><input type="checkbox" checked={selected.length > 0 && selected.length === filtered.length} onChange={e => e.target.checked ? setSelected(filtered.map(f => f.id)) : setSelected([])} /></th>
            <th>Name</th><th>Code</th><th>Description</th><th>Category</th><th>Classes</th><th>Students</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map(c => (
            <tr key={c.id}>
              <td><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
              <td><button className="btn btn-link p-0" onClick={() => setDetailCourse(c)}>{c.name}</button></td>
              <td>{editingId === c.id ? <input className="form-control" value={editCode} onChange={e => setEditCode(e.target.value)} /> : c.code}</td>
              <td>{editingId === c.id ? <input className="form-control" value={editDescription} onChange={e => setEditDescription(e.target.value)} /> : c.description || "-"}</td>
              <td>{editingId === c.id ? <input className="form-control" value={editCategory} onChange={e => setEditCategory(e.target.value)} /> : c.category || "-"}</td>
              <td>{classes.filter(cl => cl.course_id === c.id).length}</td>
              <td>{students.filter(s => classes.filter(cl => cl.course_id === c.id).map(cl => cl.id).includes(s.class_id)).length}</td>
              <td>
                {editingId === c.id ?
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={() => saveEdit(c.id)}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  </> :
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => { setEditingId(c.id); setEditName(c.name); setEditCode(c.code); setEditDescription(c.description); setEditCategory(c.category); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => removeCourse(c.id)}>Delete</button>
                  </>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Pagination --- */}
      <nav>
        <ul className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num =>
            <li key={num} className={`page-item ${page === num ? "active" : ""}`}>
              <button className="page-link" onClick={() => setPage(num)}>{num}</button>
            </li>)}
        </ul>
      </nav>

      {/* --- Details Modal --- */}
      {detailCourse && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setDetailCourse(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>{detailCourse.name} ({detailCourse.code})</h5>
                <button className="btn-close" onClick={() => setDetailCourse(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Description:</strong> {detailCourse.description || "-"}</p>
                <p><strong>Category:</strong> {detailCourse.category || "-"}</p>
                <p><strong>Classes:</strong></p>
                <ul>
                  {classes.filter(cl => cl.course_id === detailCourse.id).map(cl =>
                    <li key={cl.id}>{cl.name} ({students.filter(s => s.class_id === cl.id).map(s => s.name).join(", ")})</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
