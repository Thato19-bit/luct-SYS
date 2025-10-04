import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import LecturerDashboard from './components/LecturerDashboard';
import PRLDashboard from './components/PRLDashboard';
import PLDashboard from './components/PLDashboard';
import ReportsPage from './components/ReportsPage';
import StudentsOverview from './components/StudentsOverview';
import Reports from './components/Reports';
import Monitoring from './components/Monitoring';
import Rating from './components/Rating';
import Courses from './components/Courses';
import Classes from './components/Classes';
import Lectures from './components/Lectures';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const user = typeof window !== 'undefined' && localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')) 
    : null;

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Faculty Reporting</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/reports">Reports</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/courses">Courses</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/classes">Classes</Link></li>
            </ul>
            <ul className="navbar-nav">
              {!user && <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>}
              {!user && <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>}
              {user && <li className="nav-item"><span className="nav-link">Hello, {user.name} ({user.role})</span></li>}
              {user && <li className="nav-item"><a className="nav-link" href="#" onClick={() => {
                localStorage.removeItem('token'); 
                localStorage.removeItem('user'); 
                window.location.href='/login';
              }}>Logout</a></li>}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/students-overview" element={<StudentsOverview />} />
          <Route path="/reports-new" element={<Reports />} />
          <Route path="/lectures" element={<Lectures />} />

          {/* Role-based protected routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lecturer" 
            element={
              <ProtectedRoute roles={['lecturer']}>
                <LecturerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/prl" 
            element={
              <ProtectedRoute roles={['prl']}>
                <PRLDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pl" 
            element={
              <ProtectedRoute roles={['pl']}>
                <PLDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/rating" element={<Rating />} />

          {/* Login & Register */}
          <Route 
            path="/login" 
            element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to={`/${user.role}`} replace /> : <Register />} 
          />

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
