import React, {useEffect, useState} from "react";
import { fetchCourses, fetchClasses } from "../api";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Reports(){
  const [courses,setCourses]=useState([]);
  const [classes,setClasses]=useState([]);
  useEffect(()=>{ async function load(){ const [crs,cls]=await Promise.all([fetchCourses(),fetchClasses()]); setCourses(crs); setClasses(cls); } load(); },[]);

  const classesPerCourse = courses.map(c => classes.filter(cl=>cl.course_id===c.id).length);
  const data = { labels: courses.map(c=>c.name), datasets:[{ label: "Classes per Course", data: classesPerCourse }] };

  return (
    <div>
      <h3 className="mb-3">Reports</h3>
      <div className="card p-3 mb-3"><Bar data={data} /></div>
      <div className="card p-3">
        <h5>Top classes (by registrations)</h5>
        <ol>
          {classes.slice().sort((a,b)=> (b.total_registered||0)-(a.total_registered||0)).slice(0,8).map(c=>(
            <li key={c.id}>{c.name} — {c.total_registered||0} students</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
