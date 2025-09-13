
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1/auth`, // Using environment variable for API URL
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }

});



const useAxiosInstance = () => {
    return axiosInstance;
};

export default useAxiosInstance;