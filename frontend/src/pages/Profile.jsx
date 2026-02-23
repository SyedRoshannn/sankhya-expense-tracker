import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Profile = () => {
    const [formData, setFormData] = useState({ name: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setFormData((prev) => ({ ...prev, name: user.name }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const payload = { name: formData.name };
            if (formData.password) {
                payload.password = formData.password;
            }

            const { data } = await API.put('/auth/update', payload);

            // Update local storage token natively
            localStorage.setItem('user', JSON.stringify(data));
            setMessage('Profile updated successfully!');
            setFormData({ ...formData, password: '', confirmPassword: '' }); // clear password fields selectively
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">User Profile</h2>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
                {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{message}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="text-gray-600 text-sm font-semibold -mb-2">Update Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <label className="text-gray-600 text-sm font-semibold -mb-2 mt-4">Change Password (Leave blank to keep current)</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="New Password"
                        className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm New Password"
                        className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button type="submit" className="bg-blue-600 text-white font-bold p-3 mt-4 rounded hover:bg-blue-700 transition">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
