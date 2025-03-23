<template>
  <header id="page-header">
    <b-container>
      <h1>Sen Cours De Maths</h1>
      <hr>
      <p class="mb-0">
        Petit site contenant une flopée de ressources  de mathématiques pour le lycée : plans, exercices,évaluations, ...
      </p>
    </b-container>
  </header>
</template>

<style lang="scss" scoped>
#page-header {
  min-height: 400px;
  position: relative;
  color: white;
  text-align: center;
  background-image: url('/images/header.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;

  > * {
    z-index: 2;
  }

  hr {
    opacity: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(black, 0.65);
  }
}
</style>
