import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";

import KanbanBoard from "../components/Task/KanbanBoard";
import TaskModal from "../components/Task/TaskModal";
import { getProjectDetails } from "../services/projectSpaceService";

export default function TaskPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getProjectDetails(projectId);
        const p = response?.data?.project;
        if (!cancelled) setProject(p || null);
      } catch (err) {
        console.error(err);
        if (!cancelled) setProject(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(
      `${import.meta.env.VITE_BACK_END_SERVER_URL}/api/tasks/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch(console.error);
  }, [projectId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(
      `${import.meta.env.VITE_BACK_END_SERVER_URL}/api/projects/${projectId}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setMembers(data));
  }, [projectId]);


  const handleCreateTask = () => {
    setSelectedTask(null);

    setOpen(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);

    setOpen(true);
  };

  const projectTitle =
    project?.projectTitle || "Project";

  const leadLabel = project?.projectLead
    ? `${project.projectLead.firstName} ${project.projectLead.lastName}`
    : "Project lead";

  const targetDateLabel = project?.targetDate
    ? `Contract Completion Date: ${dayjs(project.targetDate).format("YYYY-MM-DD")}`
    : "Contract Completion Date";

  const statusLabel = project?.status || "Status";

  return (
    <Box
      sx={{
        p: 2.5,
        width: "100%",
        maxWidth: "none",
      }}
    >
      
      <Box sx={{ overflowX: "auto", pb: 0.5, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "max-content",
            minWidth: "100%",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/projects")}
            sx={{ mr: 1, flexShrink: 0 }}
          >
            {'<'}
          </Button>

          <Typography component="h1" variant="h5" fontWeight={700}>
            {projectTitle} Tasks
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTask}
            sx={{ ml: "auto", flexShrink: 0 }}
          >
            + Create Task
          </Button>
        </Box>

        <Box sx={{ mt: 1.25, width: "max-content", minWidth: "100%" }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {project?.description || ""}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                clickable
                variant="outlined"
                label={leadLabel}
                sx={(theme) => ({
                  fontWeight: 600,
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : undefined,
                  borderColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : undefined,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(168, 85, 247, 0.10)"
                      : undefined,
                })}
              />
              <Chip
                clickable
                variant="outlined"
                label={targetDateLabel}
                sx={(theme) => ({
                  fontWeight: 600,
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : undefined,
                  borderColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : undefined,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(168, 85, 247, 0.10)"
                      : undefined,
                })}
              />
              <Chip
                clickable
                variant="outlined"
                label={statusLabel}
                sx={(theme) => ({
                  fontWeight: 600,
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : undefined,
                  borderColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : undefined,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(168, 85, 247, 0.10)"
                      : undefined,
                })}
              />
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ mt: 2, width: "max-content", minWidth: "100%" }}>
          <KanbanBoard
            tasks={tasks}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
          />
        </Box>
      </Box>

      <TaskModal
        open={open}
        setOpen={setOpen}
        selectedTask={selectedTask}
        tasks={tasks}
        setTasks={setTasks}
        members={members}
        projectId={projectId}
      />
    </Box>
  );
}