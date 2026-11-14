import { afterEach, describe, expect, it, vi } from 'vitest'

if (typeof window === 'undefined') {
  globalThis.window = { location: { origin: 'http://localhost' } }
}

const {
  api,
  createAddress,
  deleteAddress,
  getAddresses,
  getCategories,
  getContacts,
  getServiceLocations,
  updateAddress,
} = await import('../api')

describe('API list endpoints', () => {
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

  it('loads contacts from /contacts', async () => {
    const contacts = [{
      opening_hours: [{ day_of_week: 1, open_time: '14:00', close_time: '18:00', is_closed: false }],
    }]
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: contacts } })

    await expect(getContacts()).resolves.toEqual(contacts)
    expect(getSpy).toHaveBeenCalledWith('/contacts')
  })

  it('rejects responses without a contact list', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: null } })

    await expect(getContacts()).rejects.toThrow(
      'A resposta de /contacts não contém uma lista de contatos.',
    )
  })

  it('loads authenticated customer addresses from /addresses', async () => {
    const addresses = [{
      id: 8,
      title: 'Casa',
      recipient_name: 'Ana Cliente',
      zip_code: '40000-000',
      is_default: true,
    }]
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: addresses } })

    await expect(getAddresses()).resolves.toEqual([{
      ...addresses[0],
      nickname: 'Casa',
      recipientName: 'Ana Cliente',
      cep: '40000-000',
      primary: true,
    }])
    expect(getSpy).toHaveBeenCalledWith('/client/addresses')
  })

  it('supports paginated address responses', async () => {
    const addresses = [{ id: 8, title: 'Casa' }]
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: { data: addresses } } })

    await expect(getAddresses()).resolves.toEqual([{
      ...addresses[0],
      nickname: 'Casa',
      recipientName: '',
      cep: '',
      primary: false,
    }])
  })

  it('rejects address responses without a list', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({ data: { data: null } })

    await expect(getAddresses()).rejects.toThrow(
      'A resposta de /client/addresses não contém uma lista de endereços.',
    )
  })

  it('creates, updates, and deletes addresses through their API endpoints', async () => {
    const address = { nickname: 'Casa', cep: '40000-000' }
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({})
    const putSpy = vi.spyOn(api, 'put').mockResolvedValue({})
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValue({})

    await createAddress(address)
    await updateAddress(8, address)
    await deleteAddress(8)

    expect(postSpy).toHaveBeenCalledWith('/client/addresses', address)
    expect(putSpy).toHaveBeenCalledWith('/client/addresses/8', address)
    expect(deleteSpy).toHaveBeenCalledWith('/client/addresses/8')
  })
})
