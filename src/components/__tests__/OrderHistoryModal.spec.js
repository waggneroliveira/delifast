import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const orderApi = vi.hoisted(() => ({
  getOrder: vi.fn(),
  getOrders: vi.fn(),
}))

vi.mock('@/services/api', () => orderApi)
vi.mock('vue-toastification', () => ({
  useToast: () => ({
    error: vi.fn(),
  }),
}))

import OrderHistoryModal from '@/components/OrderHistoryModal.vue'

describe('OrderHistoryModal customizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    orderApi.getOrders.mockResolvedValue([
      { id: 21, status: 'pending', total: 80, items: [] },
    ])
    orderApi.getOrder.mockResolvedValue({
      id: 21,
      status: 'pending',
      total: 80,
      items: [
        {
          product_title: 'Pizza 2 sabores',
          quantity: 1,
          unit_price: 40,
          total_price: 40,
          details: {
            name: 'Pizza 2 sabores',
            selectedSize: { id: 2, name: 'Grande', price: 35 },
            selectedFlavors: [
              { id: 3, name: 'Calabresa' },
              { id: 4, name: 'Quatro queijos' },
            ],
            customization: {
              hasToppings: true,
              toppings: [{ id: 8, name: 'Bacon' }],
            },
            aditionals: [{
              title: 'Adicionais',
              items: [{ id: 8, name: 'Bacon', quantity: 0 }],
            }],
          },
        },
        {
          product_title: 'Combo família',
          quantity: 1,
          unit_price: 40,
          total_price: 40,
          details: {
            name: 'Combo família',
            isCombo: true,
            comboItems: [
              { id: 'main', name: 'Prato principal' },
              { id: 'drink', name: 'Bebida' },
            ],
            itemSelections: {
              main: { choice: { id: 10, name: 'Hambúrguer artesanal' }, quantity: 1 },
              drink: { choice: { id: 11, name: 'Suco de laranja' }, quantity: 1 },
            },
            selectedAddons: [
              { id: 13, name: 'Batata extra', price: 4, quantity: 1 },
            ],
          },
        },
        {
          product_title: 'Sobremesa',
          quantity: 1,
          unit_price: 10,
          total_price: 10,
          details: {
            name: 'Sobremesa',
            customization: {
              hasToppings: true,
              toppings: [{ id: 12, name: 'Calda' }],
            },
            aditionals: [{
              title: 'Adicionais',
              items: [{ id: 12, name: 'Calda', quantity: 0 }],
            }],
          },
        },
      ],
    })
  })

  it('shows selected size and flavors, renders combo choices, and hides unselected extras', async () => {
    const wrapper = mount(OrderHistoryModal, {
      props: { modelValue: true, userId: 7 },
    })
    await flushPromises()
    await wrapper.find('.order-header').trigger('click')
    await flushPromises()

    const customizations = wrapper.find('.order-customizations')
    expect(customizations.exists()).toBe(true)
    expect(customizations.text()).toContain('Tamanho: Grande')
    expect(customizations.text()).toContain('Sabores: Calabresa, Quatro queijos')
    expect(customizations.text()).toContain('Prato principal: Hambúrguer artesanal')
    expect(customizations.text()).toContain('Bebida: Suco de laranja')
    expect(customizations.text()).toContain('1x Batata extra')
    const pizzaDetails = wrapper.findAll('.customization-item')
      .find((item) => item.text().includes('Pizza 2 sabores'))
    expect(pizzaDetails.text()).not.toContain('Adicionais:')
    expect(customizations.text()).not.toContain('Sobremesa')
  })
})
