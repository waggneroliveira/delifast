import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { clientApi } from '@/services/api'
import { useUserStore } from '@/stores/useUserStore'
import IdentifyModal from '@/components/IdentifyModal.vue'

vi.mock('vue-toastification', () => ({
  useToast: () => ({
    error: vi.fn(),
    info: vi.fn(),
  }),
}))

describe('IdentifyModal', () => {
  let wrapper
  let userStore

  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()

    const pinia = createPinia()
    setActivePinia(pinia)
    userStore = useUserStore()
    wrapper = mount(IdentifyModal, {
      props: { modelValue: true },
      global: { plugins: [pinia] },
    })
  })

  it('sends name and formatted phone, then logs in the returned client', async () => {
    vi.spyOn(clientApi, 'login').mockResolvedValue({
      data: {
        data: {
          token: 'test-token',
          client: {
            id: 7,
            name: 'Maria Silva',
            phone: '(11) 99999-9999',
            email: null,
          },
        },
      },
    })

    await wrapper.find('#client-name').setValue(' Maria Silva ')
    await wrapper.find('#client-phone').setValue('11999999999')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(clientApi.login).toHaveBeenCalledWith({
      name: 'Maria Silva',
      phone: '(11) 99999-9999',
    })
    expect(userStore.isLogged).toBe(true)
    expect(userStore.userId).toBe(7)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('keeps the modal open and shows the API message when login fails', async () => {
    vi.spyOn(clientApi, 'login').mockRejectedValue({
      response: { data: { message: 'Telefone já associado a outro nome.' } },
    })

    await wrapper.find('#client-name').setValue('Maria Silva')
    await wrapper.find('#client-phone').setValue('11999999999')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(userStore.isLogged).toBe(false)
    expect(wrapper.find('[role="alert"]').text()).toBe('Telefone já associado a outro nome.')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
