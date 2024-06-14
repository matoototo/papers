// SettingsModal.jsx
import { useState, useEffect } from 'react';
import '../styles/SettingsModal.css';

const SettingsModal = ({ preferenceText, onSave, onCancel }) => {
    const [text, setText] = useState(preferenceText);
    const [isDirty, setDirty] = useState(false);

    useEffect(() => {
        setDirty(text !== preferenceText);
    }, [text, preferenceText]);

    const handleSave = () => {
        if (isDirty) {
            onSave(text);
        } else {
            onCancel();
        }
    };

    const cancelIfOutside = (e) => {
        if (e.target.classList.contains('modal-overlay') && !isDirty) {
            onCancel();
        }
    }

    return (
        <div className="modal-overlay" onClick={cancelIfOutside}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">Settings</h2>
                </div>
                <div className="modal-body">
                    <div className="preference-label">
                        <label htmlFor="preference-text">What are you interested in?</label>
                        <p className="sublabel">
                            This text is used to intelligently rank and filter papers based on your interests.
                        </p>
                    </div>
                    <textarea
                        className="preference-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter a description of your interests here."
                    />
                </div>
                <div className="modal-footer">
                    <button className="save-button" onClick={handleSave}>Save</button>
                    <button className="cancel-button" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
