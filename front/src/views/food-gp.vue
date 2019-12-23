<template>
  <div class="container-fluid" v-if="foodGpVoteSession === 1">
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
      foodGpVoteSession: parseInt(Cookies.get('food-gp'), 10)
    };
  },
  created: function () {
    this.$store.commit('addDivision', 'food-gp');
  }
};
</script>
