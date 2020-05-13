<template>
  <div class="home">
    <p>基本使用</p>
    <countdown :time="66000"></countdown>

    <p>毫秒数</p>
    <countdown :time="44444" millisecond></countdown>

    <p>获取组件实例以及方法</p>
    <countdown :time="66000" ref="count" :auto-start="false"></countdown>
    <button @click="count.start()">开始</button>
    <button @click="count.stop()">关闭</button>
    <button @click="count.restart()">重启</button>

    <p>使用插槽自定义样式</p>
    <countdown :time="66000" @change="change">
      <template v-slot="timeData">
        <span class="block">{{ timeData.hours }}</span>
        <span class="colon">:</span>
        <span class="block">{{ timeData.minutes }}</span>
        <span class="colon">:</span>
        <span class="block">{{ timeData.seconds }}</span>
      </template>
    </countdown>

    <p>高阶组件</p>
    <higher :time="8888" word="测试higher" />
  </div>
</template>

<script>
import Countdown from "../components/countdown";
import Higher from "../components/higher";

import { ref, onMounted } from "vue";
export default {
  name: "Home",
  components: {
    Countdown,
    Higher
  },
  setup() {
    const change = () => {};
    const count = ref(null);

    onMounted(() => {
      console.dir(count.value);
    });
    return {
      change,
      count
    };
  }
};
</script>

<style lang="scss" scoped>
p {
  color: #7878bb;
  font-size: 30px;
}

button {
  border: 1px solid #888;
  margin-right: 10px;
  padding: 10px 26px;
}
.home {
  width: 750px;
  height: 200px;
}
.block {
  display: inline-block;
  background: red;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
}
</style>
