import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import "./banner.css";

const Banner = () => {
    const [seconds, setSeconds] = useState(60); // Default to 60 seconds
    const [description, setDescription] = useState("Temporary data");
    const [endTime, setEndTime] = useState(Date.now() + 60 * 1000); // Default end time
    const [visibility, setVisibility] = useState(true);
    const [url,setUrl] = useState("");

    const intervalRef = useRef(null);
    const socketRef = useRef(null);

    // Effect to establish socket.io connection when component mounts
    useEffect(() => {
        const socket = io('http://bannerappserver-production.up.railway.app');
        socketRef.current = socket;

        socket.on('initialData', (data) => {
            if (data && data.length > 0) {
                const bannerData = data[0];
                setDescription(bannerData.description);
                setSeconds(bannerData.duration);
                const newEndTime = Date.now() + bannerData.duration * 1000;
                setEndTime(newEndTime);
                setVisibility(bannerData.visibility); // Show the banner when new data is received
                setUrl(bannerData.url);
            }
        });

        socket.on('update', (data) => {
            if (data && data.length > 0) {
                const bannerData = data[0];
                setDescription(bannerData.description);
                setSeconds(bannerData.duration);
                const newEndTime = Date.now() + bannerData.duration * 1000;
                setEndTime(newEndTime);
                setVisibility(bannerData.visibility); // Show the banner when updated data is received
            }
        });

        socket.on('error', (error) => {
            console.error('Socket.io error:', error);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Effect to manage the countdown timer
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        const updateCountdown = () => {
            const currentTime = Date.now();
            const remainingTime = Math.max(0, Math.floor((endTime - currentTime) / 1000));
            setSeconds(remainingTime);

            if (remainingTime <= 0) {
                setVisibility(false);
                clearInterval(intervalRef.current);
            }
        };

        intervalRef.current = setInterval(updateCountdown, 1000);
        updateCountdown(); // Call immediately to update the countdown right away

        return () => clearInterval(intervalRef.current); // Cleanup on component unmount or endTime change
    }, [endTime]);

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="banner-link" style={{ display: visibility ? "block" : "none" }}>
            <div className="banner-container" style={{ display: visibility ? "block" : "none" }}>
                <h1>Countdown Timer</h1>
                <div className="banner-timer">
                    {seconds}s
                </div>
                <div className='banner-description'>
                    {description}
                </div>
            </div>
        </a>
    );
}

export default Banner;
