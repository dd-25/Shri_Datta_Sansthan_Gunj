import axios from 'axios';

const cloudinaryAxios = axios.create({
    withCredentials: false,
});

export default cloudinaryAxios;