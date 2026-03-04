import { useEffect, useState } from "react";
import AppShell from "../components/Layout/AppShell";
import useAuthStore from "../store/authStore";
import apiClient from "../lib/apiClient";

export default function Profile() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    apiClient.get("/subjects?page=1&pageSize=50").then((res) => {
      setSubjects(res.data.items || []);
    });
  }, []);

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm">Name: {user?.name}</p>
          <p className="text-sm">Email: {user?.email}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Subject Progress</h2>
          {subjects.map((subject) => (
            <SubjectProgressItem key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function SubjectProgressItem({ subject }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient.get(`/progress/subjects/${subject.id}`).then((res) => setData(res.data));
  }, [subject.id]);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="font-medium">{subject.title}</h3>
      <p className="text-sm text-slate-600">
        {data ? `${data.completed_videos}/${data.total_videos} videos (${data.percent_complete}%)` : "Loading..."}
      </p>
    </div>
  );
}
