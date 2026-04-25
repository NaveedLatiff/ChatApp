import axios from "axios";

const Axios = axios.create({
  baseURL:process.env.NEXT_PUBLIC_BACKEND_URL, 
  withCredentials: true, 
});

Axios.defaults.withCredentials = true;

export default Axios;
