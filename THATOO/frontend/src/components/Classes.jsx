import React, { useEffect, useState } from "react";
import {
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  fetchCourses,
} from "../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const studentNames = [
  "Thabo", "Lesego", "Kea", "Palesa", "Tshepo", "Lerato", "Neo", "Mpho",
  "Kabelo", "Boitumelo", "Teboho", "Sefako", "Nthabiseng", "Katleho"
];

const limkokwingClasses = [
  { name: "Bachelor of Business (Hons) in Entrepreneurship", course_name: "Business Management" },
  { name: "Bachelor of Business Administration", course_name: "Business Management" },
  { name: "Diploma in Marketing", course_name: "Business Management" },
  { name: "Bachelor of Science (Hons) in Information Technology", course_name: "Information Technology" },
  { name: "Bachelor of Science (Hons) in Software Engineering with Multimedia", course_name: "Information Technology" },
  { name: "Bachelor of Arts (Hons) in Broadcasting and Journalism", course_name: "Media Studies" },
  { name: "Bachelor of Arts (Hons) in Professional Communication", course_name: "Media Studies" },
  { name: "Bachelor of Arts (Hons) in Fashion and Retailing", course_name: "Design and Innovation" },
  { name: "Bachelor of Interior Architecture", course_name: "Architecture and Built Environment" },
  { name: "Bachelor of Arts (Hons) in Tourism Management", course_name: "Tourism and Hospitality" },
];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCourseId, setEditCourseId] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [detailClass, setDetailClass] = useState(null);
  const pageSize = 5;

  async function load() {
    try {
      const [cls, crs] = await Promise.all([fetchClasses(), fetchCourses()]);
      const combinedClasses = [
        ...cls,
        ...limkokwingClasses.map((c, index) => ({
          ...c,
          id: `lim-${index + 1}`,
          students: studentNames.slice(0, 5),
        })),
      ];
      setClasses(combinedClasses);
      setCourses(crs);
    } catch {
      const combinedClasses = limkokwingClasses.map((c, index) => ({
        ...c,
        id: `lim-${index + 1}`,
        students: studentNames.slice(0, 5),
      }));
      setClasses(combinedClasses);
    }
  }

  useEffect(() => { load(); }, []);

  async function addClass(e) {
    e.preventDefault();
    if (!name || !courseId) return alert("Please fill all fields");
    await createClass({ name, course_id: courseId, students: studentNames.slice(0, 5) });
    setName(""); setCourseId(""); load();
  }

  async function saveEdit(id) {
    if (!editName || !editCourseId) return alert("Please fill all fields");
    await updateClass(id, { name: editName, course_id: editCourseId });
    setEditingId(null); load();
  }

  async function removeClass(id) {
    if (!window.confirm("Delete this class?")) return;
    await deleteClass(id); load();
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function exportCSV() {
    const rows = filtered.map(c => ({
      name: c.name,
      course: c.course_name,
      students: c.students?.join(", ") || ""
    }));
    const csv = [
      Object.keys(rows[0] || {}).join(","),
      ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "classes.csv"; a.click(); URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const rows = filtered.map(c => ({
      Name: c.name,
      Course: c.course_name,
      Students: c.students?.join(", ") || ""
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");
    XLSX.writeFile(wb, "classes.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    const rows = filtered.map(c => [c.name, c.course_name, c.students?.join(", ") || ""]);
    doc.autoTable({ head: [["Name", "Course", "Students"]], body: rows });
    doc.save("classes.pdf");
  }

  async function bulkDelete() {
    if (selected.length === 0) return alert("No classes selected");
    if (!window.confirm(`Delete ${selected.length} classes?`)) return;
    for (const id of selected) await deleteClass(id);
    setSelected([]); load();
  }

  let filtered = classes.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    (c.course_name && c.course_name.toLowerCase().includes(query.toLowerCase()))
  );

  filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "course") return (a.course_name || "").localeCompare(b.course_name || "");
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <h3 className="mb-3">📘 University Classes</h3>

      <form onSubmit={addClass} className="mb-3 row g-2">
        <div className="col-md"><input className="form-control" placeholder="Class Name" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="col-md">
          <select className="form-control" value={courseId} onChange={e=>setCourseId(e.target.value)}>
            <option value="">-- select course --</option>
            {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-auto"><button className="btn btn-primary">➕ Add Class</button></div>
      </form>

      <div className="mb-2 d-flex gap-2">
        <input className="form-control w-50" placeholder="Search..." value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="form-select w-auto" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="course">Sort by Course</option>
        </select>
        <button className="btn btn-outline-secondary" onClick={exportCSV}>⬇ CSV</button>
        <button className="btn btn-outline-success" onClick={exportExcel}>⬇ Excel</button>
        <button className="btn btn-outline-danger" onClick={exportPDF}>⬇ PDF</button>
        <button className="btn btn-danger" onClick={bulkDelete}>🗑 Delete selected</button>
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th><input type="checkbox" checked={selected.length>0 && selected.length===filtered.length} onChange={e=>e.target.checked?setSelected(filtered.map(f=>f.id)):setSelected([])} /></th>
            <th>Name</th><th>Course</th><th>Students</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map(c=>(
            <tr key={c.id}>
              <td><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggleSelect(c.id)} /></td>
              <td><button className="btn btn-link p-0" onClick={()=>setDetailClass(c)}>{c.name}</button></td>
              <td>{editingId===c.id ?
                <select className="form-control" value={editCourseId} onChange={e=>setEditCourseId(e.target.value)}>
                  {courses.map(crs=><option key={crs.id} value={crs.id}>{crs.name}</option>)}
                </select>
                : c.course_name}</td>
              <td>{c.students?.join(", ")}</td>
              <td>
                {editingId===c.id ? <>
                  <button className="btn btn-success btn-sm me-2" onClick={()=>saveEdit(c.id)}>Save</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setEditingId(null)}>Cancel</button>
                </> : <>
                  <button className="btn btn-warning btn-sm me-2" onClick={()=>{setEditingId(c.id); setEditName(c.name); setEditCourseId(c.course_id)}}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>removeClass(c.id)}>Delete</button>
                </>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav>
        <ul className="pagination">
          {Array.from({length:totalPages},(_,i)=>i+1).map(num=>
            <li key={num} className={`page-item ${page===num?"active":""}`}><button className="page-link" onClick={()=>setPage(num)}>{num}</button></li>
          )}
        </ul>
      </nav>

      {detailClass && (
        <div className="modal fade show d-block" style={{background:"rgba(0,0,0,0.5)"}} onClick={()=>setDetailClass(null)}>
          <div className="modal-dialog" onClick={e=>e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>{detailClass.name}</h5>
                <button className="btn-close" onClick={()=>setDetailClass(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Course:</strong> {detailClass.course_name}</p>
                <p><strong>Students:</strong> {detailClass.students?.join(", ")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
