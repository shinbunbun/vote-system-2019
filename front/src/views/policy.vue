<template>
  <div class="container-fluid">
    <div class="row">
      <h4 class="col text-center">プライバシーポリシー</h4>
      <br />
    </div>
    <div class="row">
      <ul>
        <li class="col">
          <h5>アクセス解析ツールについて</h5>当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。
          このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。
          このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
          この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
          この規約に関して、詳しくはこちらをご確認下さい。
        </li>
      </ul>
      <div class="col-auto"></div>
    </div>
    <div class="row">
      <div class="col-auto"></div>
      <button class="btn btn-danger col" @click="back">戻る</button>
      <div class="col-auto"></div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    back() {
      this.$router.go(-1);
    }
  }
};
</script>
