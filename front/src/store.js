import 'babel-polyfill';
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import Cookies from 'js-cookie';
import kougakusaiData from '@/json/kougakusai';
import foodGpData from '@/json/food';
Vue.use(Vuex);

const LoadingOverlay = {
  state: {
    loading: false
  },
  mutations: {
    start(state) {
      state.loading = true;
    },
    end(state) {
      state.loading = false;
    }
  }
};

// ストアを作成
const store = new Vuex.Store({
  state: {
    count: 0,
    division: 'none',
    loading: false
  },
  modules: {
    LoadingOverlay
  },
  mutations: {
    loadingStart(state) {
      state.loading = true;
    },
    loadingEnd(state) {
      state.loading = false;
    },
    // カウントアップするミューテーションを登録
    addDivision(state, payload) {
      state.division = payload;
    },
    async kougakusaiVote(state, payload) {
      state.loading = true;
      const id = payload[0];
      const name = payload[1];
      const clubName = payload[2];
      const router = payload[3];
      const sessionId = Cookies.get('sessionId');
      if (Cookies.get('name')) {
        const votedNames = JSON.parse(Cookies.get('name'));
        let i = 1;
        let flag = false;
        console.log(Object.keys(votedNames).length);
        Object.keys(votedNames).forEach(() => {
          console.log(votedNames[i]);
          if (votedNames[i] === name) {
            flag = true;
          }
          i++;
        });
        if (flag) {
          alert('同じ団体に2回以上投票する事は出来ません。もう一度投票する団体を選択して下さい');
          router.push({
            name: 'kougakusai-root'
          });
          return;
        }
      }
      let err = false;
      let data;
      try {
        data = await axios.post('https://XXX/kougakusai', {
            'id': id,
            'sessionId': sessionId
          }
          /*, {
                    withCredentials: true
                  } */
        );
      } catch (e) {
        alert(`エラーが発生しました。お手数ですがお近くの執行部員までお問い合わせください。store,mutations,kougakusaiVote:${e}`);
        console.error(e);
        err = true;
        state.loading = false;
      }
      if (data.data.status === 'idsFoully') {
        Cookies.set('invalidate', 'true');
        Cookies.set('voteSession', '3');
        router.push({
          name: 'invalidate'
        });
      }
      if (err) {
        let voteSession = parseInt(Cookies.get('voteSession'), 10);
        voteSession++;
        Cookies.set('voteSession', voteSession);
        this.$store.commit('addDivision', 'none');
        router.push({
          name: 'choosing_page'
        });
      } else {
        let voteSession = parseInt(Cookies.get('voteSession'), 10);
        voteSession++;
        Cookies.set('voteSession', voteSession);
        if (voteSession === 1) {
          Cookies.set('name', JSON.stringify({
            1: name
          }));
          Cookies.set('clubName', JSON.stringify({
            1: clubName
          }));
        } else {
          let names = JSON.parse(Cookies.get('name'));
          let clubNames = JSON.parse(Cookies.get('clubName'));
          names[voteSession] = name;
          clubNames[voteSession] = clubName;
          Cookies.set('name', JSON.stringify(names));
          Cookies.set('clubName', JSON.stringify(clubNames));
        }
        // this.$store.commit('addDivision', 'none');
        console.log(router);
        if (voteSession === 3) {
          router.push({
            name: 'thanks'
          });
        } else {
          router.push({
            name: 'kougakusai-root'
          });
        }
      }
      state.loading = false;
    },
    async foodGpVote(state, payload) {
      state.loading = true;
      const id = payload[0];
      const name = payload[1];
      const clubName = payload[2];
      const router = payload[3];
      const sessionId = Cookies.get('sessionId');
      let err = false;
      let data;
      try {
        data = await axios.post('https://XXX/food-gp', ({
          // 'division': 'food-gp',
          'id': id,
          'sessionId': sessionId
        }));
      } catch (e) {
        alert(`エラーが発生しました。お手数ですがお近くの執行部員までお問い合わせください。store,mutations,food-gpVote:${e}`);
        console.error(e);
        err = true;
      }
      if (data.data.status === 'idsFoully') {
        Cookies.set('invalidate', 'true');
        Cookies.set('food-gp', 1);
        router.push({
          name: 'invalidate'
        });
      }
      if (err) {
        this.$store.commit('addDivision', 'none');
        router.push({
          name: 'choosing_page'
        });
      } else {
        Cookies.set('name', JSON.stringify({
          1: name
        }));
        Cookies.set('clubName', JSON.stringify({
          1: clubName
        }));
        Cookies.set('food-gp', 1);
        // this.$store.commit('addDivision', 'none');
        console.log(router);
        router.push({
          name: 'thanks'
        });
      }
      state.loading = false;
    },
    async voteComplete(state, router) {
      state.loading = true;
      console.log(router);
      Cookies.set('voteSession', 3);
      let err = false;
      try {
        await axios.post('https://XXX/vote-complete', ({
          'status': 'voteComplete',
          'sessionId': Cookies.get('sessionId')
        }));
      } catch (e) {
        alert(`エラーが発生しました。お手数ですがお近くの執行部員までお問い合わせください。store,mutations,kougakusaiVote:${e}`);
        console.error(e);
        err = true;
      }
      if (err) {
        this.$store.commit('addDivision', 'none');
        router.push({
          name: 'choosing_page'
        });
      } else {
        router.push({
          name: 'thanks'
        });
      }
      state.loading = false;
    },
    invalidate(state, payload) {
      Cookies.set('invalidate', 'true');
    }
  },
  getters: {
    returnJsonData(state) {
      if (state.division === 'kougakusai') {
        return kougakusaiData;
      } else if (state.division === 'food-gp') {
        return foodGpData;
      }
    }
  }
});
export default store;