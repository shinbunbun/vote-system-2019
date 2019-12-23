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
      <h5 class="col text-center">キーワードを入力して下さい。</h5>
    </div>
    <div class="py-2"></div>
    <div class="row">
      <div class="input-group mb-2 col">
        <input type="text" class="form-control" v-model="keyword" />
        <div class="input-group-append">
          <button type="button" class="btn btn-outline-secondary" @click="receiveKeyword">検索</button>
        </div>
      </div>
    </div>
    <div v-if="organizationListNoMatched">
      <font color="red">見つかりませんでした</font>
    </div>
    <div class="py-3"></div>

    <div v-show="organizationListBool">
      <div class="row">
        <p class="col">{{matched}}件を表示中</p>
      </div>
      <div class="row" v-for="item in organizationList" v-bind:key="item.id">
        <div class="col-auto"></div>
        <div class="col">
          <div class="card">
            <img class="card-img-top" v-bind:src="item.image" alt="Card image cap" />
            <div class="card-body">
              <h5 class="card-title">{{item.name}}</h5>
              <h6 class="card-subtitle text-muted">{{item.clubName}}</h6>
              <p>投票番号:{{item.id}}</p>
              <div class="py-2"></div>
              <div class="row">
                <div class="col"></div>
                <button
                  class="btn btn-primary col"
                  @click="openModal({id: item.id, name: item.name, clubName: item.clubName, image: item.image})"
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
  </div>
</template>

<script>
// import { async } from 'q';
import MyModal from '@/components/modal.vue';
let isSubmit = false;
export default {
  data: function() {
    return {
      keyword: '',
      list: this.$store.getters.returnJsonData,
      modal: false,
      message: '',
      id: '',
      name: '',
      clubName: '',
      image: '',
      organizationListBool: false,
      organizationListNoMatched: false,
      organizationList: [],
      matched: 0,
      division: this.$store.state.division
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
    receiveKeyword() {
      this.organizationListBool = false;
      const keyword = this.keyword;
      console.log(keyword);
      this.organizationList = [];
      (this.list).some((organizationData) => {
        console.log(organizationData.id);
        const comparisonWord = organizationData.name + organizationData.clubName;
        // console.log(comparisonWord);
        if ((comparisonWord).indexOf(keyword) !== -1) {
          // this.openModal({id: organizationData.id, name: organizationData.name, clubName: organizationData.name, image: organizationData.image});
          this.organizationList.push(organizationData);
          this.organizationListBool = true;
        }
        console.log(this.organizationList);
      });
      this.matched = this.organizationList.length;
      this.organizationListNoMatched = !this.organizationListBool;
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
