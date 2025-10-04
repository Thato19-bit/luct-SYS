import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pie, Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js";
import * as XLSX from "xlsx";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [loading, setLoading] = useState(true);

  // --- Demo data ---
  const demoReports = [
    { id: 1, course_name: "Computer Science", course_code: "CS101", lecturer_name: "Dr. Malefu Mopi", actual_present: 45, faculty_name: "Science", created_at: new Date().toISOString() },
    { id: 2, course_name: "Mechanical Engineering", course_code: "ME201", lecturer_name: "Prof. Thato Mohlanka", actual_present: 32, faculty_name: "Engineering", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, course_name: "Business Info Tech", course_code: "BIT101", lecturer_name: "Prof. Refiloe Konyana", actual_present: 30, faculty_name: "Business", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  ];

  const demoUsers = [
    { id: 1, name: "Judith", role: "Admin" },
    { id: 2, name: "Karabo", role: "Lecturer" },
    { id: 3, name: "Moxxy", role: "Student" },
    { id: 4, name: "Lerato", role: "Student" },
    { id: 5, name: "Thabo", role: "Lecturer" },
  ];

  const demoCourses = [
    { id: 1, name: "Mathematics", code: "MAT101" },
    { id: 2, name: "Physics", code: "PHY101" },
    { id: 3, name: "Sesotho Literature", code: "SEL101" },
    { id: 4, name: "Entrepreneurship", code: "BBE101" },
    { id: 5, name: "Information Technology", code: "BIT101" },
  ];

  const demoClasses = [
    { id: 1, name: "Math - Lerato", course_id: 1 },
    { id: 2, name: "Physics - Thabo", course_id: 2 },
    { id: 3, name: "Sesotho Lit - Keletso", course_id: 3 },
    { id: 4, name: "Entrepreneurship - Sasa", course_id: 4 },
    { id: 5, name: "IT - Didi", course_id: 5 },
  ];

  const demoTotals = [
    { faculty_name: "Science", total_registered: 120 },
    { faculty_name: "Engineering", total_registered: 80 },
    { faculty_name: "Arts", total_registered: 60 },
  ];

  useEffect(() => {
    setReports(demoReports);
    setUsers(demoUsers);
    setCourses(demoCourses);
    setClasses(demoClasses);
    setLoading(false);
  }, []);

  // --- Filters ---
  const faculties = useMemo(() => [...new Set(demoTotals.map(t => t.faculty_name))], []);
  const courseOptions = useMemo(() => [...new Set(demoCourses.map(c => c.name))], []);
  const roleOptions = useMemo(() => [...new Set(demoUsers.map(u => u.role))], []);

  const filteredReports = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return reports.filter(r => {
      if (facultyFilter && r.faculty_name !== facultyFilter) return false;
      if (courseFilter && r.course_name !== courseFilter) return false;
      if (roleFilter && demoUsers.find(u => u.name === r.lecturer_name)?.role !== roleFilter) return false;
      if (!q) return true;
      return r.course_name.toLowerCase().includes(q) || r.course_code.toLowerCase().includes(q) || r.lecturer_name.toLowerCase().includes(q) || r.faculty_name.toLowerCase().includes(q);
    });
  }, [query, facultyFilter, courseFilter, roleFilter, reports, demoUsers]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  // --- Charts ---
  const facultyTotalsChart = {
    labels: demoTotals.map(t => t.faculty_name),
    datasets: [{ label: "Registered Students", data: demoTotals.map(t => t.total_registered), backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"] }],
  };

  const classesPerCourseChart = {
    labels: demoCourses.map(c => c.name),
    datasets: [{ label: "Classes per Course", data: demoCourses.map(c => demoClasses.filter(cl => cl.course_id === c.id).length), backgroundColor: "#20c997" }],
  };

  const rolesDistributionChart = {
    labels: roleOptions,
    datasets: [{ label: "Users by Role", data: roleOptions.map(r => demoUsers.filter(u => u.role === r).length), backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"] }],
  };

  const reportsTrendChart = {
    labels: filteredReports.map(r => new Date(r.created_at).toLocaleDateString()),
    datasets: [{ label: "Reports (attendance)", data: filteredReports.map(r => r.actual_present), borderColor: "#0d6efd", backgroundColor: "rgba(13, 110, 253, 0.15)", tension: 0.3 }],
  };

  const attendanceDistributionChart = {
    labels: ["0-10", "11-20", "21-30", "31-40", "41-50", "51+"],
    datasets: [{
      label: "Attendance Distribution",
      data: [filteredReports.filter(r => r.actual_present <= 10).length,
            filteredReports.filter(r => r.actual_present > 10 && r.actual_present <= 20).length,
            filteredReports.filter(r => r.actual_present > 20 && r.actual_present <= 30).length,
            filteredReports.filter(r => r.actual_present > 30 && r.actual_present <= 40).length,
            filteredReports.filter(r => r.actual_present > 40 && r.actual_present <= 50).length,
            filteredReports.filter(r => r.actual_present > 50).length],
      backgroundColor: "#6f42c1"
    }],
  };

  // --- CSV/Excel Export ---
  const exportReportsCSV = () => {
    if (!filteredReports.length) return alert("No reports to export");
    const rows = filteredReports.map(r => ({
      date: new Date(r.created_at).toISOString(),
      course: r.course_name,
      code: r.course_code,
      lecturer: r.lecturer_name,
      faculty: r.faculty_name,
      present: r.actual_present
    }));
    const header = Object.keys(rows[0]).join(",");
    const csv = [header, ...rows.map(row => Object.values(row).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReportsExcel = () => {
    if (!filteredReports.length) return alert("No reports to export");
    const ws = XLSX.utils.json_to_sheet(filteredReports.map(r => ({
      Date: new Date(r.created_at).toLocaleString(),
      Course: r.course_name,
      Code: r.course_code,
      Lecturer: r.lecturer_name,
      Faculty: r.faculty_name,
      Present: r.actual_present
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, `reports_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const resetFilters = () => {
    setFacultyFilter(""); setCourseFilter(""); setRoleFilter(""); setQuery(""); setPage(1);
  };

  return (
    <div>
      <h2 className="mb-4">📊 Dashboard</h2>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-md-3"><div className="card p-3 text-center shadow-sm border-primary"><h6>Total Reports</h6><h2>{reports.length}</h2></div></div>
        <div className="col-md-3"><div className="card p-3 text-center shadow-sm border-success"><h6>Total Courses</h6><h2>{courses.length}</h2></div></div>
        <div className="col-md-3"><div className="card p-3 text-center shadow-sm border-info"><h6>Total Classes</h6><h2>{classes.length}</h2></div></div>
        <div className="col-md-3"><div className="card p-3 text-center shadow-sm border-warning"><h6>Total Users</h6><h2>{users.length}</h2></div></div>
      </div>

      {/* Filters */}
      <div className="mb-3 card p-3 mb-4">
        <form className="row g-2 align-items-center" onSubmit={e => e.preventDefault()}>
          <div className="col-md-3"><input className="form-control" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} /></div>
          <div className="col-md-3"><select className="form-select" value={facultyFilter} onChange={e=>setFacultyFilter(e.target.value)}><option value="">All Faculties</option>{faculties.map(f => <option key={f}>{f}</option>)}</select></div>
          <div className="col-md-3"><select className="form-select" value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}><option value="">All Courses</option>{courseOptions.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="col-md-2"><select className="form-select" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}><option value="">All Roles</option>{roleOptions.map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="col-md-1 text-end">
            <button className="btn btn-primary me-1" onClick={()=>setPage(1)}>Search</button>
            <button className="btn btn-secondary me-1" onClick={resetFilters}>Reset</button>
          </div>
        </form>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-3"><div className="card p-3 shadow-sm"><h6>📌 Faculty Registrations</h6><Pie data={facultyTotalsChart} /></div></div>
        <div className="col-md-3"><div className="card p-3 shadow-sm"><h6>📌 Classes per Course</h6><Bar data={classesPerCourseChart} /></div></div>
        <div className="col-md-3"><div className="card p-3 shadow-sm"><h6>📌 Users by Role</h6><Doughnut data={rolesDistributionChart} /></div></div>
        <div className="col-md-3"><div className="card p-3 shadow-sm"><h6>📌 Reports Trend</h6><Line data={reportsTrendChart} /></div></div>
      </div>

      {/* Attendance Distribution & Quick Links */}
      <div className="row mb-4">
        <div className="col-md-6"><div className="card p-3 shadow-sm"><h6>📈 Attendance Distribution</h6><Bar data={attendanceDistributionChart} /></div></div>
        <div className="col-md-6"><div className="card p-3 shadow-sm h-100"><h6>Quick Links</h6><div className="d-grid gap-2"><Link className="btn btn-outline-primary" to="/students-overview">👩‍🎓 Students Overview</Link><Link className="btn btn-outline-secondary" to="/reports">📝 Reports</Link><Link className="btn btn-outline-success" to="/courses">📚 Courses</Link></div></div></div>
      </div>

      {/* Recent Reports */}
      <div className="card p-3 shadow-sm mb-4">
        <h5>📑 Recent Reports</h5>
        <div className="table-responsive" style={{ maxHeight:"420px" }}>
          <table className="table table-striped">
            <thead><tr><th>Date</th><th>Course (Code)</th><th>Lecturer</th><th>Faculty</th><th className="text-end">Present</th></tr></thead>
            <tbody>
              {paginatedReports.length===0 ? <tr><td colSpan={5} className="text-center">No reports found</td></tr> :
              paginatedReports.map((r,idx) => <tr key={r.id ?? idx}><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.course_name} ({r.course_code})</td><td>{r.lecturer_name}</td><td>{r.faculty_name}</td><td className="text-end">{r.actual_present}</td></tr>)}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav className="mt-2">
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <li key={num} className={`page-item ${page===num?"active":""}`}><button className="page-link" onClick={()=>setPage(num)}>{num}</button></li>
            ))}
          </ul>
        </nav>

        <div className="mt-2">
          <button className="btn btn-outline-secondary me-2" onClick={exportReportsCSV}>Export CSV</button>
          <button className="btn btn-outline-success" onClick={exportReportsExcel}>Export Excel</button>
        </div>
      </div>

      {loading && <div className="text-center p-3"><div className="spinner-border text-primary" role="status"></div><p>Loading dashboard...</p></div>}
    </div>
  );
}
