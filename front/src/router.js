import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';
import axios from 'axios';
import Cookies from 'js-cookie';
import bootstrapVue from 'bootstrap-vue';
// ルート用のコンポーネントを読み込む
import choosingPage from '@/views/choosing_page';
import kougakusai from '@/views/kougakusai';
import foodGp from '@/views/food-gp';
import policy from '@/views/policy';
import kougakusaiExhibitList from '@/views/kougakusai/exhibitList';
import kougakusaiRoot from '@/views/kougakusai/kougakusai-root';
import foodGpRoot from '@/views/food-gp/food-gp-root';
import foodGpExhibitList from '@/views/food-gp/food-gp-exhibitList';
import thanks from '@/views/thanks';
import kougakusaiVoteNumber from '@/views/kougakusai/vote-number';
import kougakusaiKeyword from '@/views/kougakusai/keyword';
import foodGpVoteNumber from '@/views/food-gp/vote-number';
import foodGpVoteKeyword from '@/views/food-gp/keyword';
import invalidate from '@/views/invalidate';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
// Vuexと同様で最初にプラグインとして登録
Vue.use(VueRouter);
// VueRouterインスタンスを生成する
const router = new VueRouter({
  // URLのパスと紐づくコンポーネントをマッピング
  routes: [{
    name: 'choosing_page',
    path: '/',
    component: choosingPage
  }, {
    name: 'kougakusai',
    path: '/kougakusai',
    component: kougakusai,
    children: [{
      name: 'kougakusai-root',
      path: '',
      component: kougakusaiRoot
    }, {
      name: 'kougakusai-exhibitList',
      path: 'exhibitList',
      component: kougakusaiExhibitList
    }, {
      name: 'kougakusai-vote-number',
      path: 'vote-number',
      component: kougakusaiVoteNumber
    }, {
      name: 'kougakusai-keyword',
      path: 'keyword',
      component: kougakusaiKeyword
    }]
  }, {
    name: 'policy',
    path: '/policy',
    component: policy
  }, {
    name: 'food-gp',
    path: '/food-gp',
    component: foodGp,
    children: [{
      name: 'food-gp-root',
      path: '',
      component: foodGpRoot
    }, {
      name: 'food-gp-exhibitList',
      path: 'exhibitList',
      component: foodGpExhibitList
    }, {
      name: 'food-gp-vote-number',
      path: 'vote-number',
      component: foodGpVoteNumber
    }, {
      name: 'food-gp-keyword',
      path: 'keyword',
      component: foodGpVoteKeyword
    }]
  }, {
    name: 'thanks',
    path: '/thanks',
    component: thanks
  }, {
    name: 'invalidate',
    path: '/invalidate',
    component: invalidate
  }],
  data() {
    return {
      hash: this.$route.hash
    };
  }
});

// ルーターナビゲーションの前にフック
router.beforeEach(async (to, from, next) => {
  store.commit('loadingStart');
  // await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('router.js, beforeEach');
  console.log(`path:${to.path}`);
  if (to.path !== '/invalidate') {
    try {
      localStorage.test = 'hoge';
    } catch (e) {
      alert('シークレットブラウズを検知しました。通常のモードでご利用ください。（Cookieの使用許可を行なっていない場合は、使用許可をしてからご利用下さい）');
      return;
    }
    const access = Cookies.get('access');
    const invalidate = Cookies.get('invalidate');
    if (invalidate === 'true') {
      console.log('invalidate: true');
      next({
        name: 'invalidate'
      });
    } else {
      console.log('invalidate: false');
      if (!access) {
        console.log(`accessなし: ${access}`);
        try {
          await axios.post('https://XXX/transition', {
            'path': to.path,
            'sessionId': Cookies.get('sessionId')
          }).then((data) => {
            if (data.data.status === 'pathFoully') {
              console.log('pathFoully');
              Cookies.set('invalidate', 'true');
              next({
                path: '/invalidate'
              });
            } else if (data.data.status === 'ipFoully') {
              console.log('ipFoully');
              Cookies.set('invalidate', 'true');
              Cookies.set('sessionId', data.data.sessionId);
              next({
                path: '/invalidate'
              });
            } else if (data.data.status === 'sessionFoully') {
              console.log('sessionFoully');
              Cookies.set('invalidate', 'true');
              Cookies.set('access', 'true');
              next({
                path: '/invalidate'
              });
            } else if (data.data.status === 'success') {
              console.log('success');
              Cookies.set('access', 'true');
              Cookies.set('sessionId', data.data.sessionId);
            }
          });
        } catch (e) {
          alert(`エラーが発生しました。最初からやり直して下さい。app.vue,router.beforeEach:${e}`);
          console.error(e);
          next({
            name: 'choosing_page'
          });
          // err = true;
        }
      } else {
        console.log(`accessあり: ${access}`);
      }
    }
  }
  console.log('せんい');
  next();
});

router.afterEach(() => {
  store.commit('loadingEnd');
});

// 生成したVueRouterインスタンスをエクスポート
export default router;