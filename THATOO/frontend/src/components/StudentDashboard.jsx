import React from 'react';

export default function StudentDashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Student Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Courses Enrolled</h3>
          <p className="text-gray-600">You are enrolled in 5 courses.</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Assignments Pending</h3>
          <p className="text-gray-600">2 assignments are due soon.</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Ratings & Feedback</h3>
          <p className="text-gray-600">You have 3 new ratings from lecturers.</p>
        </div>
      </div>

      {/* Monitoring Section */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-2xl font-semibold mb-3">Monitoring</h3>
        <p className="text-gray-700">
          View your course progress, attendance, and performance metrics.
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Go to Monitoring
        </button>
      </div>

      {/* Rating Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-2xl font-semibold mb-3">Ratings</h3>
        <p className="text-gray-700">
          Check your ratings, provide feedback, and review lecturer comments.
        </p>
        <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          View Ratings
        </button>
      </div>
    </div>
  );
}
