<template>
  <!-- コンポーネント MyModal -->
  <div class="row">
    <div class="col-auto"></div>
    <MyModal @close="closeModal" v-if="helpModal" class="col">
      <div class="header">
        <div class="row py-3">
          <div class="col-auto"></div>
          <h5 class="col text-center">投票方法</h5>
          <div class="col-auto"></div>
        </div>
      </div>
      <!-- default スロットコンテンツ -->
      <template slot="default">
        <div class="row">
          <div class="col">
            <ul>
              <li>投票番号に欠番があるのは仕様です</li>
              <li>飲食出展団体の投票番号は101〜です</li>
              <li>子供の事情により団体名などを実際に使ったものと差し替えています。</li>
            </ul>
          </div>
          <div class="col-auto"></div>
        </div>
      </template>
      <!-- /default -->
      <div class="row">
        <div class="col-auto"></div>
        <button class="btn btn-danger col" @click="closeModal">戻る</button>
        <div class="col-auto"></div>
      </div>
      <div class="py-2"></div>
    </MyModal>
    <div class="col-auto"></div>
  </div>
</template>

<script>
import MyModal from '@/components/modal.vue';
export default {
  data: function() {
    return {
      helpModal: false
    };
  },
  components: {
    MyModal
  },
  methods: {
    openModal() {
      this.helpModal = true;
    },
    closeModal() {
      this.helpModal = false;
    }
  },
  mounted() {
  }
};
</script>
