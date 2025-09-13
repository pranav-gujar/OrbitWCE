import AuthContext from "../AuthContext/AuthContext";
import useAxiosInstance from "../Hooks/useAxiosInstance";



const AuthProvider = ({children}) => {

    const axiosInstance = useAxiosInstance();

    const handleSubmit = async (url, body) => {
        try {

            const res = await axiosInstance.post(url, body);

            return {
                status: res?.status,
                message: res?.data?.message
            }
            
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <AuthContext.Provider value={{
            handleSubmit
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;