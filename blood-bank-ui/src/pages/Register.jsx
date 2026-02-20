import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        bloodGroup: '',
        available: true
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/auth/register', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert('Registration failed. Email might be taken.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold text-center text-red-600 mb-6">Join as a Hero 🩸</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input name="name" placeholder="Full Name" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <select name="bloodGroup" onChange={handleChange} required className="p-3 border rounded-xl w-full">
                            <option value="">Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="O+">O+</option>
                            <option value="B+">B+</option>
                            <option value="AB+">AB+</option>
                            <option value="A-">A-</option>
                            <option value="O-">O-</option>
                            <option value="B-">B-</option>
                            <option value="AB-">AB-</option>
                        </select>
                        <input name="phone" placeholder="Phone" onChange={handleChange} required className="p-3 border rounded-xl" />
                    </div>
                    <input name="city" placeholder="City" onChange={handleChange} required className="w-full p-3 border rounded-xl" />

                    <button type="submit" className="w-full bg-red-600 text-white p-3 rounded-xl font-bold hover:bg-red-700 transition shadow-md">
                        Sign Up
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-red-500 hover:underline text-sm font-medium">Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
