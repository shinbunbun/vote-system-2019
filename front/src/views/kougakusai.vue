<template>
  <div class="row" v-if="voteSession === 3">
    <div class="container-fluid">
      <div class="raw">
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
  </div>
  <div v-else>
    <transition name="view">
      <router-view />
    </transition>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
export default {
  data: function() {
    return {
      voteSession: parseInt(Cookies.get('voteSession'), 10)
    };
  },
  created: function () {
    this.$store.commit('addDivision', 'kougakusai');
  }
};
</script>
