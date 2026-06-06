import api from "./api";

const updateProfile = (profileData) => {
  return api.patch("/auth/profile", profileData);
};

export { updateProfile };
