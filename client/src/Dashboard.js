import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';

const Dashboard = () => {
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [seconds, setSeconds] = useState(10);
    const [visibility, setVisibility] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch initial values on component mount
    useEffect(() => {
        const fetchBannerData = async () => {
            try {
                const response = await axios.get('http://localhost:9000/dashboard');
                const { description, url, duration, visibility } = response.data;
                console.log(response.data);
                setDescription(description || '');
                setLink(url || '');
                setSeconds(duration || 10);
                setVisibility(visibility);
            } catch (err) {
                console.error('Error fetching banner data:', err);
                setError('Failed to load banner data.');
            }
        };

        fetchBannerData();
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put('http://localhost:9000/dashboard', {
                description,
                link,
                duration: seconds,
                visibility
            });

            setSuccess('Banner updated successfully!');
            setError(null);
        } catch (err) {
            console.error('Error updating banner:', err);
            setError('Failed to update banner.');
            setSuccess(null);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Banner Dashboard</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="description">Banner Description:</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        required // Make input required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="link">Banner Link URL:</label>
                    <input
                        type="text"
                        id="link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Enter link URL"
                        required // Make input required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="seconds">Countdown Time (seconds):</label>
                    <input
                        type="number"
                        id="seconds"
                        value={seconds}
                        onChange={(e) => setSeconds(parseInt(e.target.value, 10))}
                        placeholder="Enter countdown time"
                        required // Make input required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="visibility">Show Banner:</label>
                    <input
                        type="checkbox"
                        id="visibility"
                        checked={visibility}
                        onChange={(e) => setVisibility(e.target.checked)}
                    />
                </div>
                <button type="submit">Update Banner</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
    );
};

export default Dashboard;
