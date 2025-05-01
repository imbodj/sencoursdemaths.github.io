<script setup lang="ts">
import { siteMeta } from '~/site/meta'
</script>

<template>
  <footer
    id="page-footer"
    class="bg-dark"
  >
    <b-container class="pt-4 pb-4">
      <b-row>
        <b-col
          cols="12"
          md="6"
          class="mb-4 mb-md-0"
        >
          <h2>Copyright</h2>
          <p>
            Copyright &copy; 2025 - <a href="/SenCoursDeMaths/">Ismaila Mbodji</a>. Tous droits réservés.
            <current-commit-sha />
          </p>
          <p class="mb-0">
            Les contenus de ce site sont disponibles sous licence
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr">CC BY-NC-SA 4.0</a>.
           </p>
          <ul class="logos">
            <li>
              <a href="https://www.latex-project.org/">
                <img
                  src="/images/technologies/latex.svg"
                  alt="LaTeX"
                  title="LaTeX"
                >
              </a>
            </li>
            <li>
              <a href="https://github.com/imbodj/ThatLatexLib">
                <img
                  src="/images/technologies/thatlatexlib.svg"
                  alt="ThatLatexLib"
                  title="ThatLatexLib"
                >
              </a>
            </li>
            <li>
              <a href="https://vuejs.org/">
                <img
                  src="/images/technologies/vue.svg"
                  alt="Vue"
                  title="Vue"
                >
              </a>
            </li>
            <li>
              <a href="https://nuxtjs.org/">
                <img
                  src="/images/technologies/nuxt.svg"
                  alt="Nuxt"
                  title="Nuxt"
                >
              </a>
            </li>
            <li>
              <a href="https://github.com/imbodj/SenCoursDeMaths">
                <img
                  src="/images/technologies/github.svg"
                  alt="Github"
                  title="Github"
                >
              </a>
            </li>
          </ul>
        </b-col>
        <b-col
          cols="12"
          md="6"
        >
          <h2>PDFs</h2>
          <p>
            Les contenus du site ont été écrits en <a href="https://fr.wikipedia.org/wiki/LaTeX">LaTeX</a>, et sont
            par conséquent téléchargeables au format PDF.
          </p>
          <ul class="mb-0">
            <li><a href="/pdf/lecons.pdf">Plans de leçons</a></li>
            <li><a href="/pdf/developpements.pdf">Développements</a></li>
            <li><a href="/pdf/lecons-developpements.pdf">Plans de leçons &amp; développements</a></li>
          </ul>
        </b-col>
      </b-row>
      
    </b-container>
  </footer>
</template>

<style lang="scss" scoped>
#page-footer {
  padding: 0.5rem 1rem;
  color: rgba(white, 0.5);

  h2 {
    font-size: 1.5em;
    color: rgba(white, 0.75);
    border-bottom: 1px solid rgba(white, 0.75);
    padding-bottom: 0.15em;
    margin-bottom: 0.5em;
  }

  .logos {
    display: flex;
    flex-direction: row;
    list-style-type: none;
    margin-top: 1rem;
    margin-bottom: 0;
    padding-left: 0;

    li {
      margin-right: 0.6rem;

      &:last-child {
        margin-right: 0;
      }
    }

    img {
      height: 1rem;
    }
  }

  :deep(a) {
    text-decoration: underline;
    color: rgba(white, 0.75);
  }

  .discord {
    max-width: 90%;
    width: 200px;
  }
}
</style>