<script setup lang="ts">
defineProps<{ body: string }>()
const root = ref<HTMLElement | null>(null)
const setupTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const needMarkerPseudoElementFix = () => {
  const testElement = document.createElement('li')
  testElement.style.setProperty('content', '\'(i)\'', 'important')
  return getComputedStyle(testElement, '::marker').content === 'none'
}

const romanize = (n: number): string | null => {
  if (isNaN(n)) {
    return null
  }
  const digits = String(+n).split('')
  const key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']
  let roman = ''
  let i = 3
  while (i--) {
    roman = (key[+digits.pop()! + (i * 10)] || '') + roman
  }
  return Array(+digits.join('') + 1).join('M') + roman
}

const setupDocument = () => {
  const tables = root.value!.querySelectorAll<HTMLElement>('table')
  for (const table of tables) {
    table.classList.add('table', 'table-bordered', 'table-hover')
    const parent = table.parentNode
    const wrapper = document.createElement('div')
    wrapper.classList.add('table-responsive')
    parent!.replaceChild(wrapper, table)
    wrapper.appendChild(table)
  }

  if (needMarkerPseudoElementFix()) {
    const lists = root.value!.querySelectorAll<HTMLElement>('ol')
    for (const list of lists) {
      list.classList.add('safari-ol-fix')
      const items = list.querySelectorAll<HTMLElement>('li')
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        item.classList.add('safari-li-fix')
        const marker = `<span class="safari-marker">(${romanize(i + 1)!.toLowerCase()})</span> `
        item.insertAdjacentHTML('afterbegin', marker)
      }
    }
  }

  const router = useRouter()
  const devLinks = root.value!.querySelectorAll<HTMLElement>('.devlink')
  for (const devLink of devLinks) {
    const linkA = document.createElement('a')
    const href = `/developpements/${devLink.textContent!.trim()}/`
    linkA.innerText = 'Développement'
    linkA.setAttribute('href', href)
    linkA.onclick = (event) => {
      event.preventDefault()
      router.push(href)
    }
    devLink.replaceChildren(...[linkA])
    if (devLink.nextElementSibling) {
      devLink.parentNode?.insertBefore(devLink.nextElementSibling, devLink)
    }
  }

  const proofs = root.value!.querySelectorAll<HTMLElement>('.proof')
  for (let i = 0; i < proofs.length; i++) {
    const proof = proofs[i]
    const id = `proof-${i + 1}`
    const details = document.createElement('details')
    details.setAttribute('id', id)
    details.innerHTML = proof.outerHTML
    proof.parentNode?.insertBefore(details, proof)
    proof.remove()
    const summary = document.createElement('summary')
    summary.classList.add('proof-label')
    summary.innerText = 'Preuve'
    details.insertBefore(summary, details.firstChild)
  }

  const refs = root.value!.querySelectorAll<HTMLElement>('[data-reference-type="ref"]')
  for (const ref of refs) {
    const refElement = document.getElementById(ref.getAttribute('data-reference')!)
    if (refElement) {
      const titleElement = refElement.querySelector('strong, em')
      if (titleElement && titleElement.textContent) {
        ref.textContent = titleElement.textContent
      }
    }
  }

  setupTimeout.value = null
}

onMounted(async () => {
  await nextTick()
  setupDocument()
})

onUnmounted(() => {
  if (setupTimeout.value) {
    clearTimeout(setupTimeout.value)
    setupTimeout.value = null
  }
})
</script>

<template>
  <div
    ref="root"
    class="math-document"
    v-html="body"
  />
</template>

<style lang="scss" scoped>
@import 'assets/colors';

@mixin bubble($color, $hover, $left: true) {
  @if $left {
    border-left: 10px solid darken($color, 10%);
  }

  @else {
    border-right: 10px solid darken($color, 10%);
  }

  background-color: lighten($color, 2%);
  transition: background-color 200ms;
  padding: 10px;

  &:hover {
    background-color: $hover;
  }
}

@mixin environment($color) {
  @include bubble($color, $color);

  width: 100%;
  margin-bottom: 1rem;
  overflow-x: auto;

  > *:last-child {
    margin-bottom: 0;
  }

  a {
    color: darken($color, 60%) !important;
  }
}

.math-document {
  position: relative;
  counter-reset: figure;

  :deep(.doctitle),
  :deep(.doccategories) {
    display: none;
  }

  :deep(.docsummary) {
    font-style: italic;
    color: rgba(black, 0.6);
  }

  :deep(h2:not(.unnumbered)) {
    counter-increment: headline-2;
    counter-reset: headline-3 headline-4;

    &:before {
      content: counter(headline-2, upper-roman) ' - ';
    }
  }

  :deep(h3:not(.unnumbered)) {
    counter-increment: headline-3;
    counter-reset: headline-4;

    &::before {
      content: counter(headline-3) '. ';
    }
  }

  :deep(h4:not(.unnumbered)) {
    counter-increment: headline-4;

    &::before {
      content: counter(headline-4, lower-alpha) '. ';
    }
  }

  :deep(img) {
    max-width: 100%;
  }

  :deep(table) {
    background-color: white;

    td {
      height: 2.5em;
    }
  }

  :deep(figure figcaption) {
    text-align: center;
    counter-increment: figure;

    &:before {
      content: 'Figure ' counter(figure) '. ';
      font-weight: bold;
    }
  }

  @each $environment, $color in $math-environments {
    :deep(.#{$environment}) {
      @include environment($color);
    }
  }

  :deep(.proof-label),
  :deep(.devlink > a) {
    float: left;
    margin-bottom: 1rem;
    font-size: .8em;
    padding: 0;
    text-decoration: none !important;
    color: rgba(black, 0.75);
  }

  :deep(ol) {
    counter-reset: ol;

    > li {
      list-style: none;
      counter-increment: ol;
    }

    > li::marker {
      content: "(" counter(ol, lower-roman) ") ";
    }

    &.safari-ol-fix {
      padding-left: 0;

      .safari-li-fix {
        display: flex;

        > *:not(.safari-marker) {
          flex: 1;
        }

        .safari-marker {
          display: inline-block;
          text-align: right;
          padding-right: 0.3rem;
          min-width: 2rem;
        }
      }
    }
  }

  :deep(.center) {
    text-align: center;
  }
}
</style>
