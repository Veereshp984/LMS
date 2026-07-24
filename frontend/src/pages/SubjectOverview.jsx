import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/Layout/AppShell";
import apiClient from "../lib/apiClient";

export default function SubjectOverview() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get(`/subjects/${subjectId}/first-video`)
      .then((res) => {
        if (res.data.video_id) {
          navigate(`/subjects/${subjectId}/video/${res.data.video_id}`, { replace: true });
        }
      })
      .catch((err) => {
        if (err?.response?.status === 403) {
          navigate(`/checkout/${subjectId}`, {
            replace: true,
            state: { message: err.response.data?.message || "Purchase the course" },
          });
          return;
        }
        navigate("/", { replace: true });
      });
  }, [subjectId, navigate]);

  return <AppShell>Loading subject...</AppShell>;
}
