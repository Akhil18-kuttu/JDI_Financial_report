"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";
import { setAdminSession, getAdminSession } from "@/lib/services/formStorage";

// Secure Admin Credentials for prototype
const ADMIN_CREDENTIALS = {
  username: "admin@jdiwealth.com",
  password: "admin@password123",
  alternateUsername: "admin",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to /admin
  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      router.replace("/admin");
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const isUserMatch =
        username.trim().toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() ||
        username.trim().toLowerCase() === ADMIN_CREDENTIALS.alternateUsername.toLowerCase();
      const isPassMatch = password === ADMIN_CREDENTIALS.password;

      if (isUserMatch && isPassMatch) {
        setAdminSession({
          username: username.trim(),
          email: "admin@jdiwealth.com",
        });
        router.push("/admin");
      } else {
        setIsLoading(false);
        setError("Invalid administrator username or password. Please try again.");
      }
    }, 400);
  };

  const fillDemoCredentials = () => {
    setUsername(ADMIN_CREDENTIALS.username);
    setPassword(ADMIN_CREDENTIALS.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* JDI Wealth Logo */}
        <div className="flex justify-center mb-4">
          <div className="relative h-11 w-44">
            <Image
              src="/jdi-logo.png"
              alt="JDI Wealth"
              fill
              sizes="180px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Advisor & Admin Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access submitted client financial planning profiles
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 rounded-2xl shadow-xs space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Username / Email
              </label>
              <div className="relative flex rounded-lg border border-slate-300 focus-within:border-blue-500 overflow-hidden bg-white">
                <span className="inline-flex items-center px-3 bg-slate-50 text-slate-500 border-r border-slate-200">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="admin@jdiwealth.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 font-semibold focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative flex rounded-lg border border-slate-300 focus-within:border-blue-500 overflow-hidden bg-white">
                <span className="inline-flex items-center px-3 bg-slate-50 text-slate-500 border-r border-slate-200">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-400 font-semibold focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-8 sm:-mx-10 sm:-mb-10 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Demo Admin Credentials:</span>
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                1-Click Autofill
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-500 space-y-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
              <div>Username: <strong className="text-slate-800">admin@jdiwealth.com</strong> (or <strong>admin</strong>)</div>
              <div>Password: <strong className="text-slate-800">admin@password123</strong></div>
            </div>
          </div>
        </div>

        {/* Back to Client Form link */}
        <div className="mt-4 text-center">
          <a
            href="/form"
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            ← Back to Client Financial Planning Form
          </a>
        </div>
      </div>
    </div>
  );
}
