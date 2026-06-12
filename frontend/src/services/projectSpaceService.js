import api from "./api";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/projects`;


const getProjects = () => {
  return api.get("/projects");
};


const createProject = (projectData) => {
  return api.post("/projects/new", projectData);
};

const queryUserByName = (username) => {
  return api.get(`/projects/query?search=${username}`);
};


const getProjectDetails = (projectId) => {
  return api.get(`/projects/${projectId}`);
};


const editProject = (projectId, projectData) => {
  return api.patch(`/projects/${projectId}/edit`, projectData);
};

const deleteProject = (projectId) => {
  return api.delete(`/projects/${projectId}`);
};


const getProjectProgress = (projectId) => {
  return api.get(`/projects/${projectId}/progress`);
};

export {
  getProjects,
  createProject,
  queryUserByName,
  getProjectDetails,
  editProject,
  deleteProject,
  getProjectProgress,
};
