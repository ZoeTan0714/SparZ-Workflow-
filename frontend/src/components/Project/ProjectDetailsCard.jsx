import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  Button,
  Alert,
  Link,
  Grid,
  Autocomplete,
  MenuItem,
  IconButton,
  Stack,
  Icon,
} from "@mui/material";
import { useState, preventDefault, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  queryUserByName,
  getProjectDetails,
  editProject,
} from "../../services/projectSpaceService";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import UserAvatar from "../UserAvatar";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { debounce } from "lodash";

function ProjectDetailsCard({ projectId, onClose }) {
  const { user } = useAuth();
  const [projectData, setProjectData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [membersList, setMembersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      try {
        const response = await getProjectDetails(projectId);
        const data = response.data.project;
        setProjectData(data);
        setEditForm(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProject();
  }, [projectId]);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (query, callback) => {
        setLoading(true);
        try {
          const response = await queryUserByName(query);
          callback(response.data);
        } catch (err) {
          console.error("search failed", err);
        } finally {
          setLoading(false);
        }
      }, 500),
    [],
  );

  const handleSearch = (event, newInputValue) => {
    debouncedFetch(newInputValue, (results) => setMembersList(results));
  };

  const isProjectLead = user && projectData?.projectLead?._id === user._id;
  console.log(projectData);

  const handleSave = async () => {
    try {
      await editProject(projectId, editForm);
      setProjectData(editForm);
      setIsEdit(false);
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  if (!projectData) return <Typography>Loading...</Typography>;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 448,
        p: 4,
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 3,
        position: "relative",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {isEdit ? (
          <Stack spacing={2}>
            <TextField
              label="Project Title"
              fullWidth
              value={editForm.projectTitle || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, projectTitle: e.target.value })
              }
            />
            <TextField
              label="Project Key"
              fullWidth
              value={editForm.projectKey || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, projectKey: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
            <TextField
              disabled
              name="projectLead"
              id="project-lead-input"
              label="Project Lead"
              value={`${editForm.projectLead.firstName} ${editForm.projectLead.lastName}`}
              variant="outlined"
              size="small"
              fullWidth
            />
            <Autocomplete
              multiple
              fullWidth
              label="Project Members"
              value={editForm.members || []}
              options={membersList}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName}`
              }
              loading={loading}
              onFocus={() => {
                if (membersList.length === 0) {
                  handleSearch(null, "");
                }
              }}
              onInputChange={(event, value) => handleSearch(event, value)}
              onChange={(event, newValue) => {
                // newValue is the updated array of selected members
                setEditForm({ ...editForm, members: newValue });
              }}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {option.firstName} {option.lastName}
                </li>
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              variant="outlined"
              size="small"
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Project Members"
                  placeholder="Type to search..."
                  size="small"
                />
              )}
            />
            <DatePicker
              slotProps={{
                openPickerButton: { color: "primary" },
                inputAdornment: { component: "span" },
              }}
              name="targetDate"
              id="target-date-input"
              label="Target Date"
              value={editForm.targetDate ? dayjs(editForm.targetDate) : null}
              onChange={(newValue) =>
                setEditForm((prev) => ({ ...prev, targetDate: newValue }))
              }
            />
            <TextField
              select
              name="status"
              id="status-input"
              label="Project Status"
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value })
              }
              variant="outlined"
              size="small"
              fullWidth
            >
              <MenuItem value={"To Do"}>To Do</MenuItem>
              <MenuItem value={"In Progress"}>In Progress</MenuItem>
              <MenuItem value={"In Review"}>In Review</MenuItem>
              <MenuItem value={"Completed"}>Completed</MenuItem>
            </TextField>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant="outlined" onClick={() => setIsEdit(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 2 }}
              spacing={2}
            >
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
              {isProjectLead && (
                <IconButton onClick={() => setIsEdit(true)}>
                  <EditIcon />
                </IconButton>
              )}
            </Stack>
            <Stack spacing={1}>
              <Typography variant="h5" fontWeight={600}>
                <strong>Project Title:</strong> {projectData.projectTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Project Key: {projectData.projectKey}
              </Typography>
              <Typography variant="body1">
                Description: {projectData.description}
              </Typography>
              <Typography>
                Target Date:
                {projectData.targetDate
                  ? dayjs(projectData.targetDate).format("YYYY-MM-DD")
                  : "No target date set"}
              </Typography>
              <Typography>Project Status: {projectData.status}</Typography>
              <Typography variant="body2">Project Lead:</Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ p: 1, borderBottom: "1px solid #f0f0f0:" }}
              >
                <UserAvatar
                  name={`${projectData.projectLead?.firstName} ${projectData.projectLead?.lastName}`}
                />
                <Typography variant="body2">
                  {projectData.projectLead?.firstName}{" "}
                  {projectData.projectLead?.lastName}
                </Typography>
              </Stack>

              <Typography>Members:</Typography>
              <Stack spacing={0.5}>
                {projectData.members?.map((member) => (
                  <Stack
                    key={member._id}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <UserAvatar
                      name={`${member.firstName} ${member.lastName}`}
                    />
                    <Typography variant="body2">
                      {member.firstName} {member.lastName}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Stack>
        )}
      </LocalizationProvider>
    </Paper>
  );
}

export default ProjectDetailsCard;
