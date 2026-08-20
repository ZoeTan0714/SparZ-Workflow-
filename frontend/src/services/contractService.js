import api from "./api";

export const generateContract = (data) => {
  return api.post("/contracts/generate", data, { responseType: "blob" });
};

export default { generateContract };
