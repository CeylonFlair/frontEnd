import axios from "axios";

const api = axios.create({
  baseURL: "https://ceylonflair-backend-fed6708afb09.herokuapp.com/api",
  withCredentials: true,
});

export default api;
