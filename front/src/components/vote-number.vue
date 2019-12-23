<template>
  <div class="container-fluid">
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

    <div class="row">
      <h5 class="col text-center">投票番号を入力して下さい。</h5>
    </div>
    <div class="py-2"></div>
    <div class="row">
      <div class="input-group mb-2 col">
        <input type="number" class="form-control" v-model="voteNumber" />
        <div class="input-group-append">
          <button type="button" class="btn btn-outline-secondary" @click="receiveVoteNumber">検索</button>
        </div>
      </div>
    </div>
    <div class="row">
      <p class="col">※半角数字のみ</p>
    </div>
    <div v-if="organizationListNoMatched">
      <font color="red">見つかりませんでした</font>
    </div>
  </div>
</template>

<script>
import MyModal from '@/components/modal.vue';
let isSubmit = false;
// import { async } from 'q';
export default {
  data: function() {
    return {
      voteNumber: null,
      list: this.$store.getters.returnJsonData,
      modal: false,
      message: '',
      id: '',
      name: '',
      clubName: '',
      image: '',
      division: this.$store.state.division,
      organizationListNoMatched: false
    };
  },
  components: {
    MyModal
  },
  methods: {
    openModal({id, name, clubName, image}) {
      this.addOrganizationData({id, name, clubName, image});
      this.modal = true;
    },
    closeModal() {
      this.modal = false;
    },
    addOrganizationData({id, name, clubName, image}) {
      this.id = id;
      this.name = name;
      this.clubName = clubName;
      this.image = image;
    },
    receiveVoteNumber() {
      const voteNumber = parseInt(this.voteNumber, 10);
      console.log(voteNumber);
      let flag;
      (this.list).some((organizationData) => {
        console.log(organizationData.id);
        if (organizationData.id === voteNumber) {
          flag = false;
          this.openModal({id: organizationData.id, name: organizationData.name, clubName: organizationData.clubName, image: organizationData.image});
          return true;
        } else {
          flag = true;
        }
      });
      if (flag === true) {
        this.organizationListNoMatched = true;
      } else {
        this.organizationListNoMatched = false;
      }
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
  }
};

</script>

<style scoped>
button {
  white-space: nowrap;
}
</style>
