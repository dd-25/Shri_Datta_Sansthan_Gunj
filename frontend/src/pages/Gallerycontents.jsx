import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axiosConfig';
import Modal from 'react-modal';
import './Gallerycontents.css';
import { AuthContext } from '../context/Authcontext';
import cloudinaryAxios from '../config/cloudinaryAxiosConfig';

Modal.setAppElement('#root');

function GalleryContents() {
    const { isAuthenticated, bhakt } = useContext(AuthContext);

    const { directoryName, type } = useParams();
    const [contents, setContents] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [fileType, setFileType] = useState('');
    const [file, setFile] = useState(null);
    const [optionsVisible, setOptionsVisible] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [contentModalIsOpen, setContentModalIsOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [playingVideo, setPlayingVideo] = useState(null);

    useEffect(() => {
        axios.get('/api/content', {
            params: { directoryName, type }
        })
            .then(res => {
                if (res.data.success && Array.isArray(res.data.finalContent)) {
                    setContents(res.data.finalContent);
                } else {
                    setContents([]);
                }
            })
            .catch(err => {
                console.error("Error fetching content:", err);
            });
    }, [directoryName, type]);

    const openModal = () => {
        setModalIsOpen(true);
        setFileType(type === 'images' ? 'image' : 'video');
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setFile(null);
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            setFileType(type === 'images' ? 'image' : 'video');
            const response = await cloudinaryAxios.post(import.meta.env.VITE_CLOUDINARY_UPLOAD_URL, formData);
            const cloudinaryUrl = response.data.secure_url;

            const res = await axios.post('/api/content', {
                directoryName,
                url: cloudinaryUrl,
                type: fileType === 'image' ? 'images' : 'videos'
            });

            setContents(res.data.finalContent);
            closeModal();
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleOptionsClick = (index) => {
        setOptionsVisible(optionsVisible === index ? null : index);
    };

    const handleDownload = (content) => {
        // Trigger the download
        const link = document.createElement('a');
        link.href = content;
        link.download = content.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (index, content) => {
        try {
            const response = await axios.delete('/api/content', {
                data: {
                    directoryName,
                    type,
                    content
                }
            });

            if (response.data.success) {
                setContents(response.data.newContent);
            } else {
                console.error('Failed to delete content:', response.data.message);
            }
        } catch (err) {
            console.error('Error deleting content:', err);
        }
    };

    const openContentModal = (content) => {
        // Pause any playing video in the gallery
        if (playingVideo) {
            playingVideo.pause();
        }
        setSelectedContent(content);
        setZoom(1); // Reset zoom on new content open
        setContentModalIsOpen(true);
    };

    const closeContentModal = () => {
        setContentModalIsOpen(false);
        setSelectedContent(null);
    };

    const zoomIn = () => {
        setZoom(prevZoom => prevZoom + 0.2);
    };

    const zoomOut = () => {
        setZoom(prevZoom => (prevZoom > 1 ? prevZoom - 0.2 : 1));
    };

    const handleVideoPlay = (event) => {
        setPlayingVideo(event.target.pause());
    };

    return (
        <div className="gallery-contents">
            {contents.length > 0 ? (
                contents.map((content, index) => (
                    <div key={index} className="gallery-item">
                        {content.endsWith('.jpg') || content.endsWith('.jpeg') || content.endsWith('.png') ? (
                            <img
                                src={content}
                                alt=""
                                className="gallery-image"
                                onClick={() => openContentModal(content)}
                            />
                        ) : (
                            <video
                                src={content}
                                className="gallery-video"
                                controls
                                onClick={() => openContentModal(content)}
                                onPlay={handleVideoPlay}
                            />
                        )}
                        <button
                            className="options-button"
                            onClick={() => handleOptionsClick(index)}
                        >
                            ...
                        </button>
                        {optionsVisible === index && (
                            <div className="options-menu">
                                <div
                                    className="options-menu-item"
                                    onClick={() => handleDownload(content)}
                                >
                                    Download
                                </div>
                                {isAuthenticated && bhakt.role==='admin' && <div
                                    className="options-menu-item"
                                    onClick={() => handleDelete(index, content)}
                                >
                                    Delete
                                </div>}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>No content found</p>
            )}

            {isAuthenticated && bhakt.role==='admin' && <button className="upload-button" onClick={openModal}>
                <i className="upload-icon">+</i>
            </button>}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="upload-modal"
                overlayClassName="upload-overlay"
            >
                <h2>Upload {fileType === 'image' ? 'Image' : 'Video'}</h2>
                <input
                    type="file"
                    accept={fileType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                />
                <button onClick={handleUpload}>Upload</button>
                <button onClick={closeModal}>Cancel</button>
            </Modal>

            {selectedContent && (
                <Modal
                    isOpen={contentModalIsOpen}
                    onRequestClose={closeContentModal}
                    className="content-modal"
                    overlayClassName="content-overlay"
                >
                    <div className="zoom-container">
                        <button className="zoom-button" onClick={zoomIn}>+</button>
                        <button className="zoom-button" onClick={zoomOut}>-</button>
                    </div>
                    {selectedContent.endsWith('.jpg') || selectedContent.endsWith('.jpeg') || selectedContent.endsWith('.png') ? (
                        <img
                            src={selectedContent}
                            alt="Selected"
                            className="content-image"
                            style={{ transform: `scale(${zoom})` }}
                        />
                    ) : (
                        <video
                            src={selectedContent}
                            className="content-video"
                            controls
                        />
                    )}
                    <button className="close-button" onClick={closeContentModal}>Close</button>
                </Modal>
            )}
        </div>
    );
}

export default GalleryContents;
