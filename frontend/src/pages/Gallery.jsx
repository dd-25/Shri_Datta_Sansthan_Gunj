import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from '../config/axiosConfig';
import { FaEllipsisV, FaFolder, FaFolderPlus, FaTrash, FaEdit } from 'react-icons/fa';
import './Gallery.css';
import { AuthContext } from '../context/Authcontext';
import { Navigate, useNavigate } from 'react-router-dom';

function Gallery() {
  const [directories, setDirectories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [floatingWindow, setFloatingWindow] = useState(null);
  const inputRef = useRef();
  const { isAuthenticated, bhakt } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from API
    axios.get('/api/gallery')
      .then(res => {
        setDirectories(res.data.directories);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, [editingIndex]);

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleCreateDirectory = () => {
    setIsCreating(true);
    setEditingIndex(null);
    setNewDirectoryName('');
  };

  const handleSaveNewDirectory = () => {
    const trimmedName = newDirectoryName.trim();
    if (trimmedName) {
      // Send request to backend to add new directory
      axios.post('/api/gallery', { name: trimmedName })
        .then((res) => {
          // Update UI with new directory
          if (res.data.success) {
            setDirectories([...directories, { name: trimmedName }]);
            setIsCreating(false);
            setNewDirectoryName('');
          } else {
            console.log("error: ", res.data.message);
          }
        })
        .catch(err => console.log(err));
    }
  };

  const handleEditDirectory = (index) => {
    setEditingIndex(index);
    setEditedName(directories[index].name);
  };

  const handleRenameDirectory = (index, oldName) => {
    const trimmedName = editedName.trim();
    if (trimmedName && trimmedName !== oldName) {
      // Send request to backend to rename directory
      axios.put('/api/gallery', { old_name: oldName, new_name: trimmedName })
        .then((res) => {
          // Update UI with renamed directory
          if (res.data.success) {
            const updatedDirectories = directories.map((dir, i) =>
              i === index ? { ...dir, name: trimmedName } : dir
            );
            setDirectories(updatedDirectories);
            setEditingIndex(null);
            setEditedName('');
            setDropdownOpen(null);
          } else {
            console.log("error: ", res.data.message);
          }
        })
        .catch(err => console.log(err));
    }
  };

  const handleDeleteDirectory = (name) => {
    axios.delete(`/api/gallery`, { data: { name } })
      .then(res => {
        if (res.data.success) {
          setDirectories(directories.filter(dir => dir.name !== name));
          setDropdownOpen(null);
        }
        else {
          console.log("error: ", res.data.message);
        }
      })
      .catch(err => console.log(err));
  };

  const openFloatingWindow = (index) => {
    setFloatingWindow(index);
  };

  const closeFloatingWindow = () => {
    setFloatingWindow(null);
  };

  const handleNavigation = (type, folderName) => {
    navigate(`/gallery/${folderName}/${type}`);
  };

  return (
    <div className="gallery-container">
      <div className="directory-list">
        {directories.length > 0 && directories.map((item, index) => (
          <div key={index} className="directory-item">
            <FaFolder className="directory-icon" onClick={() => openFloatingWindow(index)} />
            <div className="directory-info">
              {editingIndex === index ? (
                <div className="directory-edit-container">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    autoFocus
                    ref={inputRef}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameDirectory(index, item.name);
                    }}
                  />
                  <button className="save-btn" onClick={() => handleRenameDirectory(index, item.name)}>Save</button>
                </div>
              ) : (
                <>
                  <div className="directory-name">{item.name}</div>
                  {isAuthenticated && bhakt.role === 'admin' && (
                    <button className="directory-dropdown-btn" onClick={() => toggleDropdown(index)}>
                      <FaEllipsisV />
                    </button>
                  )}
                  {dropdownOpen === index && (
                    <div className="directory-dropdown-menu">
                      <button className="dropdown-item" onClick={() => handleEditDirectory(index)}>
                        <FaEdit /> Rename
                      </button>
                      <button className="dropdown-item" onClick={() => handleDeleteDirectory(item.name)}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            {floatingWindow === index && (
              <div className="floating-window">
                <button className="floating-option" onClick={() => handleNavigation('images', item.name)}>Images</button>
                <button className="floating-option" onClick={() => handleNavigation('videos', item.name)}>Videos</button>
                <button className="close-window" onClick={closeFloatingWindow}>Close</button>
              </div>
            )}
          </div>
        ))}
        {isCreating && (
          <div className="directory-item">
            <FaFolder className="directory-icon" />
            <div className="directory-edit-container">
              <input
                type="text"
                value={newDirectoryName}
                onChange={(e) => setNewDirectoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNewDirectory();
                }}
                placeholder="Enter directory name"
                autoFocus
              />
              <button className="save-btn" onClick={handleSaveNewDirectory}>Save</button>
            </div>
          </div>
        )}
      </div>
      {isAuthenticated && bhakt.role === 'admin' && (
        <button className="create-directory-btn" onClick={handleCreateDirectory}>
          <FaFolderPlus />
        </button>
      )}
    </div>
  );
}

export default Gallery;
