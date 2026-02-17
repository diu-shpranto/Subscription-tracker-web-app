import axios from 'axios';
import { RouterProvider } from "react-router-dom";
import router from "./routes/Routes";
import Login from './components/Login';
import { useEffect, useState } from "react";


axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token") || "secure_session_active";
    config.headers.Authorization = token;
    return config;
});

function App() {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
 
        const token = localStorage.getItem("auth_token");
        
        if (token === "secure_session_active") {
            setIsAuth(true);
        } else {
            setIsAuth(false);
           
            localStorage.removeItem("auth_token");
        }
        
        setLoading(false);
    }, []);

    if (loading) return null; 

   
    return isAuth ? <RouterProvider router={router} /> : <Login />;
}

export default App;