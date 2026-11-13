import axios from 'axios'

const apiBaseUrl = (() => {
    const url = new URL(window.location.origin)

    if (import.meta.env.DEV) {
        url.port = '8000'
    }

    url.pathname = '/api'
    return url.href.replace(/\/$/, '')
})()

const clientTokenKey = 'clientToken'

export const getClientToken = () => (
    typeof localStorage === 'undefined' ? null : localStorage.getItem(clientTokenKey)
)

export const clearClientToken = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(clientTokenKey)
    }
}

export const api = axios.create({
    baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
    const token = getClientToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

const clientEndpoint = '/client'

export const clientApi = {
    login: async (credentials) => {
        const response = await api.post(`${clientEndpoint}/login`, credentials)
        const { token, client } = response.data?.data || {}

        if (!token || !client?.id) {
            throw new Error('A resposta do login não contém um token e os dados do cliente.')
        }

        localStorage.setItem(clientTokenKey, token)
        return response
    },
    me: {
        get: () => api.get(`${clientEndpoint}/me`),
        put: (data) => api.put(`${clientEndpoint}/me`, data),
        patch: (data) => {
            if (typeof FormData !== 'undefined' && data instanceof FormData) {
                // Laravel/PHP parses multipart form fields reliably through POST with method spoofing.
                data.set('_method', 'PATCH')
                return api.post(`${clientEndpoint}/me`, data)
            }

            return api.patch(`${clientEndpoint}/me`, data)
        },
        delete: () => api.delete(`${clientEndpoint}/me`),
    },
    logout: () => {
        const token = getClientToken()
        if (!token) return Promise.resolve(null)

        return api.post(
            `${clientEndpoint}/logout`,
            null,
            { headers: { Authorization: `Bearer ${token}` } },
        ).finally(clearClientToken)
    },
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
