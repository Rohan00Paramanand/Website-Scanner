import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("username");
        navigate("/login");
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <p>Logging out...</p>
        </div>
    );
};

export default Logout;
