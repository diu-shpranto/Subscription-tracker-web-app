import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
        const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
            localStorage.setItem("auth_token", "secure_session_active");
            window.location.reload(); 
        } else {
            alert("Invalid Credentials!");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
                <h2 className="text-2xl font-bold text-center text-slate-800">Admin Access</h2>
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={(e) => setPass(e.target.value)}
                    required
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;