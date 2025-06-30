"use client"; // because it has interactive toggling and form inputs

import { useState } from "react";

const API_BASE_URL = `${typeof window !== 'undefined' ? window.location.protocol + "//" + window.location.hostname + ":8000/api" : ""}`;

export default function MerchantLoginPage() {
  const [showSignup, setShowSignup] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupShopName, setSignupShopName] = useState("");

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        }),
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error("Login Failed");
      const result = await response.json();
      // Redirect on success
      window.location.href = '/merchant/dashboard/';
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();

    const artisanData = {
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
      shop_name: signupShopName,
      product_specialty: "",
      price_range_low: 0,
      price_range_high: 100,
      accepting_custom_orders: true,
    };

    try {
      const artisanResp = await fetch(`${API_BASE_URL}/artisan/`, {
        method: "POST",
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify(artisanData),
      });

      if (!artisanResp.ok) throw new Error("Failed to sign up");

      const artisanResult = await artisanResp.json();

      const inventoryResp = await fetch(`${API_BASE_URL}/inventories/`, {
        method: "POST",
        headers: {"Content-Type": 'application/json'},
        body: JSON.stringify({ artisan_id: artisanResult.id }),
      });

      if (!inventoryResp.ok) throw new Error("Failed to create inventory");

      // After all successful, redirect to login page
      window.location.href = '/merchant/login/';
    } catch (error) {
      alert("Signup failed");
      console.error(error);
    }
  }

  return (
    <main className="auth-container min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="auth-card bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Welcome, Artisan</h2>
        <p className="auth-subtitle mb-6 text-gray-700">
          Log in or create your dashboard account to begin managing your custom orders.
        </p>

        {/* LOGIN FORM */}
        {!showSignup && (
          <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder="Email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button type="submit" className="btn-primary py-2 mt-2">
              Log In
            </button>
            <p className="auth-toggle mt-4 text-center text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setShowSignup(true)}
                className="text-indigo-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* SIGNUP FORM */}
        {showSignup && (
          <form className="flex flex-col gap-4" onSubmit={handleSignupSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Username"
              required
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Shop Name"
              required
              value={signupShopName}
              onChange={(e) => setSignupShopName(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <button type="submit" className="btn-primary py-2 mt-2">
              Sign Up
            </button>
            <p className="auth-toggle mt-4 text-center text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setShowSignup(false)}
                className="text-indigo-600 hover:underline"
              >
                Log In
              </button>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
