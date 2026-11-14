import axios from 'axios'

const apiBaseUrl = (() => {
    const url = new URL(window.location.origin)

    if (import.meta.env.DEV) {
        url.port = '8000'
    }

    url.pathname = '/api'
    return url.href.replace(/\/$/, '')
})()

const appearanceCacheKey = `delifast:appearance:${apiBaseUrl}/appearance`
const clientTokenKey = 'clientToken'

const normalizeAppearance = (response) => {
    const data = response?.data?.appearance || response?.data || response
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('A resposta de /appearance não contém os dados do tenant.')
    }

    return {
        name: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : null,
        logo: typeof data.logo === 'string' && data.logo.trim() ? data.logo.trim() : null,
        colors: data.colors && typeof data.colors === 'object' && !Array.isArray(data.colors)
            ? data.colors
            : {},
    }
}

export const getCachedAppearance = () => {
    if (typeof localStorage === 'undefined') return null

    try {
        const cached = localStorage.getItem(appearanceCacheKey)
        if (!cached) return null

        const appearance = normalizeAppearance(JSON.parse(cached))
        return appearance.name || appearance.logo || Object.keys(appearance.colors).length
            ? appearance
            : null
    } catch (error) {
        console.warn('Não foi possível ler a aparência em cache.', error)
        return null
    }
}

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

export const getCategories = async () => {
    const { data } = await api.get('/category')
    const categories = data?.data

    if (!Array.isArray(categories)) {
        throw new Error('A resposta de /category não contém uma lista de categorias.')
    }

    return categories
}

export const getServiceLocations = async () => {
    const { data } = await api.get('/service-locations')
    const locations = data?.data

    if (!Array.isArray(locations)) {
        throw new Error('A resposta de /service-locations não contém uma lista de locais.')
    }

    return locations
}

export const getContacts = async () => {
    const { data } = await api.get('/contacts')
    const contacts = data?.data

    if (!Array.isArray(contacts)) {
        throw new Error('A resposta de /contacts não contém uma lista de contatos.')
    }

    return contacts
}

export const getAppearance = async () => {
    const { data } = await api.get('/appearance')
    const appearance = normalizeAppearance(data)

    if (typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem(appearanceCacheKey, JSON.stringify(appearance))
        } catch (error) {
            console.warn('Não foi possível salvar a aparência em cache.', error)
        }
    }

    return appearance
}

export const resolveApiAssetUrl = (path) => {
    if (/^https?:\/\//i.test(path)) {
        const assetUrl = new URL(path)
        const apiUrl = new URL(apiBaseUrl)

        if (['localhost', '127.0.0.1', '::1'].includes(assetUrl.hostname)) {
            assetUrl.protocol = apiUrl.protocol
            assetUrl.host = apiUrl.host
        }

        return assetUrl.href
    }

    const imagePath = path.replace(/^\/+/, '')
    const storagePath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`
    return new URL(storagePath, `${new URL(apiBaseUrl).origin}/`).href
}
