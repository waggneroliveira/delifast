import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
}))

vi.mock('vue-toastification', () => ({
  useToast: () => toast,
}))

if (!globalThis.localStorage) {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
}

const { useCartStore } = await import('../useCartStore')

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('calculates the selected size, option, flavors and extras exactly once', () => {
    const cart = useCartStore()
    const item = {
      id: 1,
      name: 'Pizza',
      price: 20,
      basePrice: 20,
      originalPrice: 20,
      selectedSize: { id: 2, name: 'M', price: 20 },
      options: [{
        items: [{ id: 'crust', name: 'Borda', price: 3 }],
      }],
      selectedOption: 'crust',
      selectedFlavors: [{ id: 'cheese', name: 'Quatro queijos', price: 4 }],
      aditionals: [{
        title: 'Extras',
        items: [{ id: 'bacon', name: 'Bacon', price: 5, quantity: 2 }],
      }],
    }

    cart.add(item)

    expect(cart.items).toHaveLength(1)
    expect(cart.calculateItemTotal(cart.items[0])).toBe(37)
    expect(cart.subTotal).toBe(37)
    expect(cart.getItemDetails(cart.items[0].id)).toMatchObject({
      choicesTotal: 7,
      aditionalsTotal: 10,
      itemTotal: 37,
    })
  })

  it('keeps products with different selections as separate cart items', () => {
    const cart = useCartStore()

    cart.add({
      id: 1,
      name: 'Lanche',
      price: 15,
      selectedOption: 'cheddar',
      options: [{ items: [{ id: 'cheddar', price: 2 }] }],
      aditionals: [],
    })
    cart.add({
      id: 1,
      name: 'Lanche',
      price: 15,
      selectedOption: 'bacon',
      options: [{ items: [{ id: 'bacon', price: 3 }] }],
      aditionals: [],
    })

    expect(cart.items).toHaveLength(2)
    expect(cart.total).toBe(35)
  })

  it('uses a selected size option as the product price and adds multiple flavors', () => {
    const cart = useCartStore()

    cart.add({
      id: 2,
      name: 'Pizza 2 sabores',
      price: 45,
      basePrice: 45,
      selectedOptions: {
        sizes: 'large',
        flavors: ['pepperoni', 'cheese'],
      },
      options: [
        {
          id: 'sizes',
          title: 'Tamanho',
          isSizeOption: true,
          priceMode: 'replace',
          items: [{ id: 'large', name: 'Grande', price: 45 }],
        },
        {
          id: 'flavors',
          title: 'Sabores',
          type: 'checkbox',
          items: [
            { id: 'pepperoni', name: 'Pepperoni', price: 2 },
            { id: 'cheese', name: 'Queijo', price: 3 },
          ],
        },
      ],
      selectedFlavors: [],
      aditionals: [],
    })

    expect(cart.calculateItemTotal(cart.items[0])).toBe(50)
    expect(cart.subTotal).toBe(50)
  })

  it('clears the cart silently when the caller provides its own completion message', () => {
    const cart = useCartStore()
    cart.items = [{ id: 1, name: 'Lanche', quantity: 1 }]

    cart.clear({ silent: true })

    expect(cart.items).toEqual([])
    expect(toast.info).not.toHaveBeenCalled()
  })
})
