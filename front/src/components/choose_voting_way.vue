<template>
  <div id="chooseVotingWay">
    <help ref="help"></help>
    <div class="container-fluid">
      <!-- 投票完了modal -->
      <div class="col-auto"></div>
      <MyModal @close="closeFinishModal" v-if="finishModal" class="col">
        <div class="header">
          <div class="row py-3">
            <div class="col-auto"></div>
            <h5 class="col text-center">以下の団体で投票完了しますか？</h5>
            <div class="col-auto"></div>
          </div>
        </div>
        <!-- default スロットコンテンツ -->
        <template slot="default">
          <h6 class="col text-center">現在以下の団体に投票しています。</h6>
          <div class="row">
            <div class="col">
              <ul>
                <li v-for="item in clubData" v-bind:key="item.id">{{item.clubName}} {{item.name}}</li>
              </ul>
            </div>
            <div class="col-auto"></div>
          </div>
          <div class="row">
            <div class="col-auto"></div>
            <div class="col">
              <b>
                <font color="red">一度投票完了したら残りの{{3- (voteSession - 1)}}団体に投票することは出来ません。</font>
              </b>
            </div>
            <div class="col-auto"></div>
          </div>
          <div class="py-1"></div>
        </template>
        <!-- /default -->
        <div class="row">
          <div class="col-auto"></div>
          <button class="btn btn-primary col" @click="voteComplete">投票完了</button>
          <div class="col-auto"></div>
          <button class="btn btn-danger col" @click="closeFinishModal">戻る</button>
          <div class="col-auto"></div>
        </div>
        <div class="py-2"></div>
      </MyModal>
      <div class="col-auto"></div>

      <div class="row">
        <div class="col text-center">
          <h6>
            <div v-if="path === '/kougakusai'">
              <div v-if="voteSession">
                現在{{voteSession-1}}団体に投票済みです。
                <br />
                あと{{3- (voteSession - 1)}}団体に投票出来ます。
                <br />投票方法を選択して下さい
              </div>
              <div v-else>
                1団体目に投票します。
                <br />投票方法を選択して下さい
              </div>
            </div>
            <div v-else-if="path === '/food-gp'">投票方法を選択して下さい</div>
          </h6>
        </div>
      </div>
      <div class="py-3"></div>
      <div class="row">
        <div class="col">
          <router-link :to="{name: `${division}-exhibitList`}">
            <img src="@/images/出展一覧から投票.svg" alt />
          </router-link>
        </div>
        <div class="col">
          <router-link :to="{name: `${division}-vote-number`}">
            <img src="@/images/投票番号から投票.svg" alt />
          </router-link>
        </div>
      </div>
      <div class="py-2"></div>
      <div class="row">
        <div class="col">
          <router-link :to="{name: `${division}-keyword`}">
            <img src="@/images/キーワードから投票.svg" alt />
          </router-link>
        </div>
        <div class="col">
          <img src="@/images/投票方法.svg" @click="help" alt />
        </div>
      </div>
      <div class="py-2"></div>
      <div class="row">
        <div class="col">
          <img v-if="noVote == 0" src="@/images/投票完了.svg" @click="finish" alt />
        </div>
        <div class="col"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import help from '@/components/help';
import MyModal from '@/components/modal.vue';
let isSubmit = false;
export default {
  data: function() {
    return {
      noVote: 1,
      voteSession: parseInt(Cookies.get('voteSession'), 10),
      path: this.$route.path,
      division: this.$store.state.division,
      finishModal: false,
      names: Cookies.get('name'),
      clubNames: Cookies.get('clubName'),
      clubData: [],
      name: '',
      clubName: ''
    };
  },
  created: function () {
    if (this.path === '/kougakusai' || this.path === '/kougakusai/') {
      if (this.voteSession) {
        this.voteSession++;
        this.noVote = 0;
      } else {
        this.voteSession = 1;
        Cookies.set('voteSession', 0);
      }
      this.path = '/kougakusai';
    } else if (this.path === '/food-gp' || this.path === '/food-gp/') {
      this.path = '/food-gp';
    }
    console.log(this.path);
  },
  components: {
    help,
    MyModal
  },
  methods: {
    help() {
      this.$refs.help.openModal();
    },
    finish() {
      this.clubData = [];
      let name = JSON.parse(this.names);
      const nameList = Object.values(name);
      let clubName = JSON.parse(this.clubNames);
      const clubNameList = Object.values(clubName);
      let i = 0;
      console.log(clubName);
      nameList.forEach(() => {
        (this.clubData).push({name: nameList[i], clubName: clubNameList[i]});
        i++;
      });
      console.log(this.clubData);
      this.finishModal = true;
    },
    closeFinishModal() {
      this.finishModal = false;
    },
    async voteComplete() {
      if (isSubmit) {
        // フラグがtrueならアラートを表示してsubmitしない
        alert('処理中です。');
        isSubmit = false;
      } else {
        // フラグがtrueでなければ、フラグをtrueにした上でsubmitする
        isSubmit = true;
        await this.$store.commit('voteComplete', this.$router);
      }
    }
  }
};
</script>
