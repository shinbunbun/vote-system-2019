<template>
  <div class="container-fluid">
    <div class="row">
      <h6 class="col text-center">投票する団体を選択して下さい。</h6>
    </div>

    <!-- コンポーネント MyModal -->
    <div class="row">
      <div class="col-auto"></div>
      <MyModal @close="closeModal" v-if="modal" class="col">
        <div class="header">
          <div class="row py-3">
            <div class="col-auto"></div>
            <h5>この団体に投票しますか？</h5>
            <div class="col-auto"></div>
          </div>
        </div>
        <!-- default スロットコンテンツ -->
        <template slot="default">
          <div class="card" style="width:17rem;">
            <img class="card-img-top" :src="image" alt="Card image cap" />
            <div class="card-body">
              <h5 class="card-title">{{name}}</h5>
              <h6 class="card-subtitle text-muted">{{clubName}}</h6>
              <p>投票番号:{{id}}</p>
              <div class="py-2"></div>
              <div class="row">
                <div class="col-auto"></div>
                <button class="btn btn-primary col" @click="vote">投票する</button>
                <div class="col-auto"></div>
                <button class="btn btn-danger col" @click="closeModal">戻る</button>
                <div class="col-auto"></div>
              </div>
            </div>
          </div>
        </template>
        <!-- /default -->
      </MyModal>
      <div class="col-auto"></div>
    </div>

    <div class v-for="item in list" v-bind:key="item.id">
      <div class="col-auto"></div>
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{item.name}}</h5>
            <h6 class="card-subtitle text-muted">{{item.clubName}}</h6>
            <p>投票番号:{{item.id}}</p>
            <div class="py-2"></div>
            <div class="row">
              <div class="col"></div>
              <button
                class="btn btn-primary col"
                @click="openModal([item.id, item.name, item.clubName, item.image])"
              >投票する</button>
              <div class="col"></div>
            </div>
          </div>
        </div>
        <div class="py-2"></div>
      </div>
      <div class="col-auto"></div>
    </div>
  </div>
</template>

<script>
import kougakusaiData from '@/json/kougakusai';
import foodData from '@/json/food';
import MyModal from '@/components/modal.vue';
let isSubmit = false;
export default {
  data: function() {
    return {
      list: [],
      modal: false,
      message: '',
      id: '',
      name: '',
      clubName: '',
      image: '',
      division: this.$store.state.division
    };
  },
  components: {
    MyModal
  },
  methods: {
    openModal([id, name, clubName, image]) {
      this.addOrganizationData([id, name, clubName, image]);
      this.modal = true;
    },
    closeModal() {
      this.modal = false;
    },
    addOrganizationData([id, name, clubName, image]) {
      this.id = id;
      this.name = name;
      this.clubName = clubName;
      this.image = image;
    },
    async vote() {
      if (isSubmit) {
        // フラグがtrueならアラートを表示してsubmitしない
        alert('処理中です。');
        console.log(false);
        isSubmit = false;
      } else {
        // フラグがtrueでなければ、フラグをtrueにした上でsubmitする
        isSubmit = true;
        console.log(true);
        if (this.division === 'kougakusai') {
          await this.$store.commit('kougakusaiVote', [this.id, this.name, this.clubName, this.$router]);
        } else if (this.division === 'food-gp') {
          await this.$store.commit('foodGpVote', [this.id, this.name, this.clubName, this.$router]);
        }
      }
    }
  },
  created() {
    isSubmit = false;
    if (this.division === 'kougakusai') {
      this.list = kougakusaiData;
    } else if (this.division === 'food-gp') {
      this.list = foodData;
    }
  }
};
</script>

<style scoped>
button {
  white-space: nowrap;
}
</style>
