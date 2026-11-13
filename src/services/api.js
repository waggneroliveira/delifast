import axios from 'axios'

const localApiBaseUrl = 'http://delivery.localhost:8000/api'
const apiBaseUrl = import.meta.env.DEV
    ? localApiBaseUrl
    : new URL('/api', window.location.origin).href.replace(/\/$/, '')

export const api = axios.create({
    baseURL: apiBaseUrl,
})

export const resolveApiAssetUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path

    const imagePath = path.replace(/^\/+/, '')
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`
    return new URL(storagePath, `${new URL(apiBaseUrl).origin}/`).href
}
