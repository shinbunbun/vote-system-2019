<template>
  <div id="wrap">
    <div id="app">
      <div v-if="this.$store.state.loading">
        <!-- オーバーレイ用のコンポーネント -->
        <LoadingOverlay />
      </div>
      <div v-else-if="!this.$store.state.loading">
        <myheader></myheader>
        <div class="py-3"></div>
        <div class="row" v-if="pc">
          <div class="col-auto"></div>
          <p class="col">PC・タブレットからのアクセスには対応しておりません。スマートフォンでのアクセスをお願い致します。</p>
          <div class="col-auto"></div>
        </div>
        <transition v-else name="view">
          <router-view />
        </transition>
        <div class="py-4"></div>
        <myfooter></myfooter>
      </div>
    </div>
  </div>
</template>

<script>
// import Cookies from 'js-cookie';
// import axios from 'axios';
import myheader from '@/components/myheader';
import myfooter from '@/components/myfooter';
import LoadingOverlay from '@/components/LoadingOverlay';
import Cookies from 'js-cookie';
import axios from 'axios';
export default {
  name: 'App',
  data: function() {
    return {
      pc: false
    };
  },
  components: {
    myheader,
    myfooter,
    LoadingOverlay
  },
  created() {
    console.log(navigator.userAgent);
    if (!navigator.userAgent.match(/(iPhone|iPod|Android.*Mobile)/i)) {
      // PC・タブレットの場合の処理を記述
      this.pc = true;
    }
  }
};
</script>

<style>
.view-enter-active,
.view-leave-active {
  transition: opacity 0.5s;
}
.view-leave-active {
  position: absolute;
}
.view-enter,
.view-leave-to {
  opacity: 0;
}
#wrap {
  overflow: hidden;
}
</style>
