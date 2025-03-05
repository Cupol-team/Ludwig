import React, { useState, useEffect } from "react";
import "../styles/global.css";

const notificationTypes = {
    error: {
        icon: "⚠️",
        color: "#ff4d4d",
    },
    success: {
        icon: "✅",
        color: "#4caf50",
    },
    info: {
        icon: "ℹ️",
        color: "#2196f3",
    },
};

const Notification = ({ message, type = "info", duration = 3000 }) => {
    const [visible, setVisible] = useState(false);
    const { icon, color } = notificationTypes[type] || notificationTypes.info;

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration]);

    return (
        visible && (
            <div
                className={`notification ${visible ? "visible" : ""}`}
                style={{ backgroundColor: color }}
            >
                <span className="error-icon">{icon}</span>
                {message}
            </div>
        )
    );
};

export default Notification;
