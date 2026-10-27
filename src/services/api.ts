import axios from 'axios'

// export const BASE_URL= "http://localhost:8000";
export const BASE_URL= "https://backinventarios.blumbit.net";
// admin@mail.com
// admin54321

const BASE_URL_API = `${BASE_URL}/api`

const instance = axios.create({
    baseURL: BASE_URL_API,
    timeout: 30000
});

// interceptores

export default instance;
