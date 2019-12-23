<template>
  <div class="container-fluid">
    <div class="row">
      <h5 class="col text-center">ご投票ありがとうございました。</h5>
    </div>
    <div class="py-4"></div>
    <div class="row">
      <div class="col"></div>
      <router-link :to="{ name: 'choosing_page' }">
        <button class="col btn btn-primary">トップへ戻る</button>
      </router-link>
      <div class="col"></div>
    </div>
  </div>
</template>

<style scoped>
button {
  white-space: nowrap;
}
</style>
