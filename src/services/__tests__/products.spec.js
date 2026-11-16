import { describe, expect, it } from 'vitest'

if (typeof window === 'undefined') {
  globalThis.window = { location: { origin: 'http://localhost' } }
}

const { normalizeProduct } = await import('../products')

describe('normalizeProduct', () => {
  it('maps backend product images, category and normal options to the storefront shape', () => {
    const product = normalizeProduct({
      id: 2,
      product_category_id: 1,
      name: null,
      title: 'Combo Yakisoba Completo',
      description: 'Yakisoba + Refrigerante',
      path_image: 'admin/uploads/product.avif',
      price: '69.90',
      old_price: null,
      cashback: '0.00',
      product_type: 'food',
      featured: true,
      active: true,
      category: { id: 1, title: 'Hamburger', slug: 'hamburger' },
      galleries: [],
      options: [{
        id: 7,
        type: 'single',
        title: '1x Refrigerante',
        required: false,
        max_selections: 1,
        choices: [{ id: 'choice-pepsi', name: 'Pepsi', price: '0.00' }],
      }],
      tags: '[]',
    })

    expect(product).toMatchObject({
      name: 'Combo Yakisoba Completo',
      image: 'http://localhost:8000/storage/admin/uploads/product.avif',
      category: 'hamburger',
      price: 69.9,
      featured: true,
      isCombo: false,
      options: [{
        title: '1x Refrigerante',
        type: 'radio',
        items: [{ id: 'choice-pepsi', name: 'Pepsi', price: 0 }],
      }],
    })
  })

  it('maps combo items, nested choices and addons', () => {
    const product = normalizeProduct({
      id: 3,
      title: 'Combo teste',
      price: '39.90',
      product_type: 'combo',
      combo_items: [{
        id: 9,
        name: 'Refrigerante',
        quantity: 1,
        required: true,
        options: [{
          id: 6,
          type: 'single',
          title: 'Escolha o sabor',
          max_selections: 1,
          choices: [{ id: 'choice-guarana', name: 'Guaraná', price: '0.00', default: '1' }],
        }],
      }],
      combo_addons: [{
        id: 5,
        name: 'Hashi',
        price: '1.00',
        max_quantity: 2,
      }],
    })

    expect(product.isCombo).toBe(true)
    expect(product.comboItems[0]).toMatchObject({
      quantity: 1,
      options: {
        type: 'radio',
        maxSelections: 1,
        choices: [{ id: 'choice-guarana', default: true, price: 0 }],
      },
    })
    expect(product.comboAddons[0]).toMatchObject({ price: 1, maxQuantity: 2 })
  })

  it('normalizes required size and multiple option metadata from the API', () => {
    const product = normalizeProduct({
      id: 4,
      name: 'Pizza 2 sabores',
      price: '0.00',
      sizes: [
        { id: 1, name: 'Média', price: '35.00', is_default: '1' },
        { id: 2, name: 'Grande', price: '45.00' },
      ],
      customization: {
        hasSize: true,
        sizes: [],
        size_required: 'true',
      },
      options: [{
        id: 10,
        title: 'Sabores',
        type: 'multiple_choice',
        is_required: '1',
        max_selections: '2',
        choices: [
          { id: 11, name: 'Calabresa', is_recommended: '1', is_pre_selected: 'true' },
          { id: 12, name: 'Mussarela' },
        ],
      }],
    })

    expect(product.customization).toMatchObject({
      hasSize: true,
      sizeRequired: true,
      sizes: [{ id: 1, price: 35, default: true }, { id: 2, price: 45 }],
    })
    expect(product.options[0]).toMatchObject({
      type: 'checkbox',
      required: true,
      maxSelections: 2,
      items: [
        { id: 11, isRecommended: true, default: true },
        { id: 12, isRecommended: false, default: false },
      ],
    })
  })
})
