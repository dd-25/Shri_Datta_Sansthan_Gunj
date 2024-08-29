import React, { useState, useRef, useContext, useEffect } from 'react';
import axios from '../config/axiosConfig';
import Modal from 'react-modal';
import { AuthContext } from '../context/Authcontext';
import './Audio.css';
import cloudinaryAxios from '../config/cloudinaryAxiosConfig';

Modal.setAppElement('#root');

function Audio() {
    const [audios, setAudios] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [audioName, setAudioName] = useState('');
    const [optionsVisible, setOptionsVisible] = useState(null);
    const [renameIsOpen, setRenameIsOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const { isAuthenticated, bhakt } = useContext(AuthContext);

    const audioRef = useRef(null);

    useEffect(() => {
        axios.get('/api/audio')
            .then(res => {
                if (res.data.success && Array.isArray(res.data.finalContent)) {
                    setAudios(res.data.finalContent);
                } else {
                    setAudios([]);
                }
            })
            .catch(err => {
                console.error("Error fetching audio:", err);
            });
    }, []);

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => {
        setModalIsOpen(false);
        setFile(null);
        setAudioName('');
    };

    const handleFileChange = (event) => setFile(event.target.files[0]);
    const handleUpload = async () => {
        if (!file || !audioName.trim()) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await cloudinaryAxios.post(import.meta.env.VITE_CLOUDINARY_UPLOAD_URL, formData);
            const cloudinaryUrl = response.data.secure_url;

            const res = await axios.post('/api/audio', {
                name: audioName,
                url: cloudinaryUrl
            });

            if (res.data.success) {
                setAudios(res.data.finalContent);
                closeModal();
            } else {
                console.error('Failed to save audio URL in backend:', res.data.message);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleOptionsClick = (index) => setOptionsVisible(optionsVisible === index ? null : index);

    const handleDelete = async (index, audio) => {
        try {
            const response = await axios.delete('/api/audio', {
                data: { content: audio }
            });

            if (response.data.success) {
                setAudios(response.data.newContent);
            } else {
                console.error('Failed to delete audio:', response.data.message);
            }
        } catch (err) {
            console.error('Error deleting audio:', err);
        }
    };

    const handleDownload = (audioUrl) => {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.setAttribute('download', 'audio.mp3');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openRenameModal = (audio) => {
        setSelectedAudio(audio);
        setRenameIsOpen(true);
        setNewName(audio.name);
    };

    const closeRenameModal = () => {
        setRenameIsOpen(false);
        setSelectedAudio(null);
    };

    const handleRename = async () => {
        if (!newName.trim()) return;

        try {
            const response = await axios.put('/api/audio', {
                oldName: selectedAudio.name,
                newName
            });

            if (response.data.success) {
                setAudios(response.data.newContent);
                closeRenameModal();
            } else {
                console.error('Failed to rename audio:', response.data.message);
            }
        } catch (err) {
            console.error('Error renaming audio:', err);
        }
    };

    const handlePlayAudio = (audioUrl) => {
        setCurrentAudio(audioUrl);
        if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch((err) => {
                console.error('Error playing audio:', err);
            });
        }
    };

    return (
        <div className="audio-page">
            {audios.length > 0 ? (
                audios.map((audio, index) => (
                    <div
                        key={index}
                        className="audio-item"
                        onClick={() => handlePlayAudio(audio.url)}
                    >
                        <span className="audio-name">{audio.name}</span>
                        <button
                            className="options-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOptionsClick(index);
                            }}
                        >
                            ...
                        </button>
                        {optionsVisible === index && (
                            <div className="options-menu">
                                <div
                                    className="options-menu-item"
                                    onClick={() => handleDownload(audio.url)}
                                >
                                    Download
                                </div>
                                {isAuthenticated && bhakt.role === 'admin' && (
                                    <>
                                        <div
                                            className="options-menu-item"
                                            onClick={() => handleDelete(index, audio)}
                                        >
                                            Delete
                                        </div>
                                        <div
                                            className="options-menu-item"
                                            onClick={() => openRenameModal(audio)}
                                        >
                                            Rename
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>No audio files found</p>
            )}

            {currentAudio && (
                <div className="audio-player-container">
                    <audio
                        ref={audioRef}
                        controls
                        autoPlay
                    >
                        {/* <source src={currentAudio} type="audio/mpeg" />
                        Your browser does not support the audio element. */}
                    </audio>
                </div>
            )}

            {isAuthenticated && bhakt.role === 'admin' && (
                <button className="upload-button" onClick={openModal}>
                    <i className="upload-icon">+</i>
                </button>
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="upload-modal"
                overlayClassName="upload-overlay"
            >
                <h2>Upload Audio</h2>
                <input
                    type="text"
                    placeholder="Enter audio name"
                    value={audioName}
                    onChange={(e) => setAudioName(e.target.value)}
                />
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                />
                <button onClick={handleUpload}>Upload</button>
                <button onClick={closeModal}>Cancel</button>
            </Modal>

            <Modal
                isOpen={renameIsOpen}
                onRequestClose={closeRenameModal}
                className="rename-modal"
                overlayClassName="rename-overlay"
            >
                <h2>Rename Audio</h2>
                <input
                    type="text"
                    placeholder="Enter new name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={handleRename}>Rename</button>
                <button onClick={closeRenameModal}>Cancel</button>
            </Modal>
        </div>
    );
}

export default Audio;
