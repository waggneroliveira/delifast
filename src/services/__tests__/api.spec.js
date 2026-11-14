import { afterEach, describe, expect, it, vi } from 'vitest'

if (typeof window === 'undefined') {
  globalThis.window = { location: { origin: 'http://localhost' } }
}

const { api, getCategories, getServiceLocations } = await import('../api')

describe('getCategories', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads categories from /category', async () => {
    const categories = [{ id: 1, name: 'Bebidas' }]
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: categories } })

    await expect(getCategories()).resolves.toEqual(categories)
    expect(getSpy).toHaveBeenCalledWith('/category')
  })

  it('rejects responses without a category list', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: null } })

    await expect(getCategories()).rejects.toThrow(
      'A resposta de /category não contém uma lista de categorias.',
    )
  })

  it('loads service locations from /service-locations', async () => {
    const locations = [{
      id: 1,
      title: 'Salvador',
      neighborhoods: [{ name: 'Centro', delivery_fee: 20 }],
    }]
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: locations } })

    await expect(getServiceLocations()).resolves.toEqual(locations)
    expect(getSpy).toHaveBeenCalledWith('/service-locations')
  })

  it('rejects responses without a service location list', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: null } })

    await expect(getServiceLocations()).rejects.toThrow(
      'A resposta de /service-locations não contém uma lista de locais.',
    )
  })
})
