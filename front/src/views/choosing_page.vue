<template>
  <div class="container-fluid">
    <help ref="help"></help>
    <h6 class="col text-center">投票する区分を選択して下さい。</h6>
    <div class="row py-2">
      <div class="col">
        <router-link to="/kougakusai">
          <img src="@/images/kogakusai-taisyo.svg" alt />
        </router-link>
      </div>
      <div class="col">
        <router-link to="/food-gp">
          <img src="@/images/food-gp.svg" alt />
        </router-link>
      </div>
    </div>
    <div class="py-2"></div>
    <div class="row">
      <div class="col-3"></div>
      <div class="col">
        <img src="@/images/投票方法.svg" @click="help" alt />
      </div>
      <div class="col-3"></div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import help from '@/components/help';
import axios from 'axios';
import LoadingOverlay from '@/components/LoadingOverlay';
export default {
  methods: {
    help() {
      console.log(1);
      this.$refs.help.openModal();
    },
    async reset() {
      await this.$store.commit('reset', [this.$router, this.$route]);
    }
  },
  components: {
    help,
    LoadingOverlay
  },
  mounted() {
    if (!Cookies.get('firstAccess')) {
      this.$refs.help.openModal();
      Cookies.set('firstAccess', 'true');
    }
  }
};
</script>
