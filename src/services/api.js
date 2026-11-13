import axios from 'axios'

const apiBaseUrl = (() => {
    const url = new URL(window.location.origin)

    if (import.meta.env.DEV) {
        url.port = '8000'
    }

    url.pathname = '/api'
    return url.href.replace(/\/$/, '')
})()

export const api = axios.create({
    baseURL: apiBaseUrl,
})

const clientEndpoint = '/client'

export const clientApi = {
    login: (credentials) => api.post(`${clientEndpoint}/login`, credentials),
    me: () => api.get(`${clientEndpoint}/me`),
    logout: () => api.post(`${clientEndpoint}/logout`),
}

export const getTenantConfig = async () => {
    const { data } = await api.get('/tenant')
    return data.data
}

export const resolveApiAssetUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path

    const imagePath = path.replace(/^\/+/, '')
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`
    return new URL(storagePath, `${new URL(apiBaseUrl).origin}/`).href
}
