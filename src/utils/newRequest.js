import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://ceylonflair-backend-fed6708afb09.herokuapp.com/api",
  withCredentials: true,
});

export default newRequest;
