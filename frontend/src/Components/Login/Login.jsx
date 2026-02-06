import React, { useState } from "react";
import axios from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      // Ensure csrf cookie is set on the browser
      await axios.get("csrf/");

      if (isLogin) {
        const response = await axios.post("login/", {
          username,
          password,
        });
        if (response.status === 200) {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("username", response.data.username);
          navigate("/");
        }
      } else {
        const response = await axios.post("register/", {
          username,
          email,
          password,
        });
        if (response.status === 200) {
          setSuccessMessage("Registration successful! Please log in.");
          setIsLogin(true);
          setPassword(""); // Clear password for security
        }
      }
    } catch (err) {
      if (isLogin) {
        setError("Invalid credentials. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* Left Side - Project Info */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-12 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="z-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
            Privacy Dashboard
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Empowering you to understand and control your digital footprint.
          </p>

          <div className="space-y-6 text-gray-400">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50 mt-1">
                <span className="text-blue-400 text-sm">1</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Scan Websites</h3>
                <p className="mt-1">Analyze websites for tracking cookies and privacy violations.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 mt-1">
                <span className="text-purple-400 text-sm">2</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Detailed Reports</h3>
                <p className="mt-1">Get comprehensive reports on data collection practices.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/50 mt-1">
                <span className="text-pink-400 text-sm">3</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">Secure & Private</h3>
                <p className="mt-1">Your data is yours. We provide the tools to protect it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {isLogin ? "Sign in to access your dashboard" : "Join us to start scanning"}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-800 placeholder-gray-500 text-gray-300 rounded-lg bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-800 placeholder-gray-500 text-gray-300 rounded-lg bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-800 placeholder-gray-500 text-gray-300 rounded-lg bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-900/20 py-2 rounded border border-red-900/50">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-green-500 text-sm text-center bg-green-900/20 py-2 rounded border border-green-900/50">
                {successMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/30"
              >
                {isLogin ? "Sign in" : "Sign up"}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccessMessage("");
                }}
                className="font-medium text-purple-400 hover:text-purple-300 focus:outline-none underline transition-colors duration-200"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
