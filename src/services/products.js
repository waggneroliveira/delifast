import { resolveApiAssetUrl } from './api'

const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const toBoolean = (value) => value === true
  || value === 1
  || (typeof value === 'string' && ['1', 'true', 'yes', 'sim'].includes(value.toLowerCase()))

const parseArray = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []

  const parsed = JSON.parse(value)
  if (!Array.isArray(parsed)) {
    throw new Error('Um campo de lista do produto nao contem um array.')
  }

  return parsed
}

const getImageUrl = (image) => {
  const path = typeof image === 'string'
    ? image
    : image?.url ?? image?.path_image ?? image?.path ?? image?.image

  return typeof path === 'string' && path.trim() ? resolveApiAssetUrl(path) : null
}

const normalizeChoice = (choice) => ({
  ...choice,
  id: choice.id,
  name: choice.name ?? choice.title ?? '',
  description: choice.description ?? '',
  price: toNumber(choice.price),
  image: getImageUrl(choice.image ?? choice.path_image ?? choice.image_url),
  default: toBoolean(
    choice.default
      ?? choice.is_default
      ?? choice.preselected
      ?? choice.pre_selected
      ?? choice.is_preselected
      ?? choice.is_pre_selected,
  ),
  isRecommended: toBoolean(
    choice.isRecommended ?? choice.is_recommended ?? choice.recommended,
  ),
  maxPerOption: toNumber(choice.maxPerOption ?? choice.max_per_option ?? choice.maxQuantity),
})

const normalizeOptionType = (type, group) => {
  const normalizedType = String(type ?? '').toLowerCase().replace(/[\s-]+/g, '_')
  const allowsMultiple = toBoolean(
    group.multiple
      ?? group.is_multiple
      ?? group.allow_multiple
      ?? group.multiple_choice
      ?? group.allowMultiple,
  )

  if (allowsMultiple || [
    'checkbox',
    'checkboxes',
    'multiple',
    'multi',
    'multicheckbox',
    'multiple_choice',
    'multiple_choices',
    'multiple_selection',
    'multi_select',
    'multiselect',
    'multi_choice',
    'multichoice',
  ].includes(normalizedType)) return 'checkbox'
  if (['select', 'dropdown'].includes(normalizedType)) return 'select'
  return 'radio'
}

const normalizeOptionGroup = (group) => {
  const choices = parseArray(group.choices ?? group.items).map(normalizeChoice)
  const type = normalizeOptionType(
    group.type ?? group.input_type ?? group.selection_type ?? group.choice_type,
    group,
  )
  const title = group.title ?? group.name ?? 'Opcoes'
  const explicitPriceMode = group.priceMode ?? group.price_mode ?? group.pricing_type
  const isSizeOption = toBoolean(
    group.isSize ?? group.is_size ?? group.isSizeOption ?? group.is_size_option,
  )
    || /tamanho|size/i.test(title)

  return {
    ...group,
    id: group.id,
    title,
    type,
    required: toBoolean(group.required ?? group.is_required ?? group.mandatory),
    maxSelections: toNumber(
      group.maxSelections
        ?? group.max_selections
        ?? group.maxChoices
        ?? group.max_choices,
      type === 'checkbox' ? choices.length : 1,
    ),
    isSizeOption,
    priceMode: isSizeOption ? 'replace' : (explicitPriceMode ?? 'add'),
    items: choices,
  }
}

const normalizeComboItem = (item) => {
  const groups = parseArray(item.options)
  const optionGroup = groups[0] ?? (item.options && !Array.isArray(item.options) ? item.options : null)

  return {
    ...item,
    id: item.id,
    quantity: toNumber(item.quantity, 1),
    required: toBoolean(item.required),
    options: optionGroup
      ? (() => {
          const normalized = normalizeOptionGroup(optionGroup)
          return {
            ...normalized,
            choices: normalized.items,
          }
        })()
      : null,
  }
}

const normalizeAdditionalGroup = (group) => ({
  ...group,
  title: group.title ?? group.name ?? 'Adicionais',
  items: parseArray(group.items ?? group.choices).map(normalizeChoice),
})

const normalizeSize = (size) => ({
  ...size,
  price: toNumber(size.price),
  oldPrice: toNumber(size.oldPrice ?? size.old_price),
  description: size.description ?? '',
  default: toBoolean(
    size.default ?? size.is_default ?? size.preselected ?? size.pre_selected,
  ),
  required: toBoolean(size.required ?? size.is_required),
})

export const normalizeProduct = (product, apiCategories = []) => {
  if (!product || typeof product !== 'object' || product.id == null) {
    throw new Error('A resposta de /products contem um produto sem identificador.')
  }

  const categoryRelation = product.category && typeof product.category === 'object'
    ? product.category
    : null
  const categoryId = product.product_category_id
    ?? product.category_id
    ?? product.categoryId
    ?? categoryRelation?.id
    ?? (typeof product.category === 'number' ? product.category : null)
  const categoryValue = typeof product.category === 'string' ? product.category : null
  const categoryById = apiCategories.find((category) => (
    String(category.id) === String(categoryId ?? categoryValue)
  ))
  const categoryBySlug = apiCategories.find((category) => category.slug === categoryValue)
  const categorySlug = categoryRelation?.slug
    ?? product.category_slug
    ?? product.categorySlug
    ?? categoryBySlug?.slug
    ?? categoryById?.slug
    ?? categoryValue
  const galleryImages = parseArray(product.galleries)
  const images = [
    product.path_image,
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
    product.image_url,
    product.photo,
    ...galleryImages,
  ].map(getImageUrl).filter(Boolean)

  const sizes = parseArray(product.sizes).map(normalizeSize)
  const flavors = parseArray(product.flavors).map(normalizeChoice)
  const toppings = parseArray(product.toppings).map(normalizeChoice)
  const rawCustomization = product.customization && typeof product.customization === 'object'
    ? product.customization
    : {}
  const customizationSizes = rawCustomization.sizes
    ? parseArray(rawCustomization.sizes)
    : []
  const customizationFlavors = rawCustomization.flavors
    ? parseArray(rawCustomization.flavors)
    : []
  const customizationToppings = rawCustomization.toppings
    ? parseArray(rawCustomization.toppings)
    : []
  const customization = {
    ...rawCustomization,
    sizes: (customizationSizes.length ? customizationSizes : sizes).map(normalizeSize),
    flavors: (customizationFlavors.length ? customizationFlavors : flavors)
      .map(normalizeChoice),
    toppings: (customizationToppings.length ? customizationToppings : toppings)
      .map(normalizeChoice),
  }
  customization.hasSize = toBoolean(rawCustomization.hasSize) || customization.sizes.length > 0
  customization.hasFlavors = toBoolean(rawCustomization.hasFlavors) || customization.flavors.length > 0
  customization.hasToppings = toBoolean(rawCustomization.hasToppings) || customization.toppings.length > 0
  const rawSizeRequired = rawCustomization.sizeRequired
    ?? rawCustomization.size_required
    ?? product.sizeRequired
    ?? product.size_required
  customization.sizeRequired = rawSizeRequired === undefined
    ? customization.sizes.some((size) => size.required) || customization.sizes.length > 0
    : toBoolean(rawSizeRequired)
  customization.maxFlavors = toNumber(
    rawCustomization.maxFlavors ?? rawCustomization.max_flavors ?? product.max_flavors,
  )

  const comboItems = parseArray(product.comboItems ?? product.combo_items).map(normalizeComboItem)
  const comboAddons = parseArray(product.comboAddons ?? product.combo_addons).map((addon) => ({
    ...addon,
    price: toNumber(addon.price),
    maxQuantity: toNumber(addon.maxQuantity ?? addon.max_quantity, 99),
  }))
  const options = parseArray(product.options).map(normalizeOptionGroup)
  const additionalGroups = parseArray(product.aditionals ?? product.additionals)
    .map(normalizeAdditionalGroup)
  const title = typeof product.name === 'string' && product.name.trim()
    ? product.name
    : product.title ?? ''
  const featuredValue = product.featured ?? product.is_featured ?? product.highlighted
  const stock = product.stock && typeof product.stock === 'object'
    ? {
        ...product.stock,
        available: product.active !== false && product.active !== 0,
        quantity: toNumber(product.stock.quantity),
      }
    : { available: product.active !== false && product.active !== 0 }

  return {
    ...product,
    id: product.id,
    name: title,
    description: product.description ?? product.text ?? '',
    price: toNumber(product.price),
    oldPrice: toNumber(product.oldPrice ?? product.old_price),
    cashback: toNumber(product.cashback),
    image: images[0] ?? null,
    images,
    category: categorySlug ?? 'outros',
    featured: toBoolean(featuredValue),
    isCombo: toBoolean(product.isCombo ?? product.is_combo)
      || product.product_type === 'combo'
      || product.type === 'combo',
    cuisineType: product.cuisineType ?? product.cuisine_type,
    tags: parseArray(product.tags),
    specifications: product.specifications ?? {},
    stock,
    customization,
    options,
    aditionals: additionalGroups,
    comboItems,
    comboAddons,
  }
}
