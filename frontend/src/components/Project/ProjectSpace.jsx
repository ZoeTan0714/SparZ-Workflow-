import {
  Box,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import * as workspaceService from "../../services/projectSpaceService";
import UserAvatar from "../UserAvatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { useAuth } from "../../context/AuthContext";
import CreateProjectForm from "./CreateProjectForm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditProjectForm from "./EditProjectForm";
import { useNavigate } from "react-router-dom";

const ProjectSpace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [openProjectForm, setOpenProjectForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [openTaskPage, setOpenTaskPage] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  const fetchWorkspace = async () => {
    try {
      const workspaceData = await workspaceService.getProjects(user);
      const projectsData = workspaceData.data.projects || [];
      const projectsDataWithProgress = await Promise.all(
        projectsData.map(async (proj) => {
          try {
            const progressData = await workspaceService.getProjectProgress(
              proj._id,
            );
            return {
              ...proj,
              progress: progressData.data,
            };
          } catch (err) {
            console.error(
              `Failed to fetch progress for ${proj.projectKey}`,
              err,
            );
            return { ...proj, progress: { completed: 0, total: 0 } };
          }
        }),
      );
      setProjects(projectsDataWithProgress);
    } catch (err) {
      console.error("Failed to fetch workspace:", err);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleOpenDeleteDialog = (projectId, event) => {
    event.stopPropagation();
    setDeleteProjectId(projectId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteProjectId(null);
    setOpenDeleteDialog(false);
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteProjectId) return;
    try {
      await workspaceService.deleteProject(deleteProjectId);
      setProjects((prev) => prev.filter((project) => project._id !== deleteProjectId));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Unable to delete project.");
    }
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          点击 Project 获取项目进度情况
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
          gap: 2,
        }}
      >
        <Card>
          <CardActionArea
            sx={{
              height: "100%",
              border: "2px dashed",
              borderColor: "divider",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(107, 33, 168, 0.02)",
              },
            }}
            onClick={() => setOpenProjectForm(true)}
          >
            <CardContent
              sx={{
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.9,
                  color: isDark ? "text.primary" : "primary.main",
                }}
              >
                + New Project
              </Typography>
            </CardContent>
          </CardActionArea>
          <Dialog
            open={openProjectForm}
            onClose={() => setOpenProjectForm(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogContent>
              <CreateProjectForm
                onClose={() => {
                  setOpenProjectForm(false);
                  fetchWorkspace();
                }}
              />
            </DialogContent>
          </Dialog>
        </Card>
        {projects?.map((project, index) => {
          const isProjectLead = user && project?.projectLead?._id === user._id;
          const canEditProject = user?.role === "admin" || isProjectLead;
          const canViewOnly = !canEditProject;
          return (
            <Card key={project._id} sx={{ position: "relative" }}>
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  display: "flex",
                  gap: 0.5,
                }}
              >
                {canEditProject ? (
                  <>
                    <IconButton
                      size="small"
                      sx={{
                        color: "primary.main",
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "white",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(project._id);
                        setOpenEditForm(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: "error.main",
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": {
                          bgcolor: "error.main",
                          color: "white",
                        },
                      }}
                      onClick={(e) => handleOpenDeleteDialog(project._id, e)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <IconButton
                    size="small"
                    sx={{
                      color: "text.secondary",
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tasks/${project._id}`);
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <CardActionArea
                onClick={() => {
                  navigate(`/tasks/${project._id}`);
                }}
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    ></Stack>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 700 }}
                      >
                        {project.projectKey}
                      </Typography>
                      <Typography variant="h6" sx={{ lineHeight: 1.2, mb: 1 }}>
                        {project.projectTitle}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ height: 40, overflow: "hidden" }}
                  >
                    {project.description}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {project.progress.completed} / {project.progress.total}{" "}
                    tasks completed
                  </Typography>

                  <AvatarGroup
                    max={4}
                    total={project.members.length + 1}
                    sx={{ justifyContent: "flex-end", mt: 1 }}
                  >
                    <UserAvatar
                      name={`${project.projectLead.firstName} ${project.projectLead.lastName}`}
                    />
                    {project.members.map((member) => (
                      <UserAvatar
                        key={member._id}
                        name={`${member.firstName} ${member.lastName}`}
                      />
                    ))}
                  </AvatarGroup>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}

        <Dialog
          open={openEditForm}
          onClose={() => setOpenEditForm(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent>
            <EditProjectForm
              projectId={selectedProjectId}
              onClose={() => {
                setOpenEditForm(false);
                fetchWorkspace();
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Confirm delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this project? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button color="error" onClick={handleConfirmDeleteProject}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ProjectSpace;
