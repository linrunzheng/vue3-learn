# Vue3写一个倒计时组件

vue3 beta版本发布已有一段时间了，文档也大概看了一下，不过对于学一门技术，最好的方法还是实战，于是找了一个比较简单的组件用vue3来实现，参考的是vant的countdown组件。

Vue Composition API文档：
[如果对vue3语法还不熟悉的，可以先看一下语法](https://vue-composition-api-rfc.netlify.app/api.html#setup)

目前文档还是英文的，这里简单翻译下几个比较核心的东西：

## setup

setup函数是一个新的组件option选项，作为在组件内使用Composition API的入口。
###  1. 调用时机
   setup会在组件实例创建并且初始props解析后立即调用。对于生命周期这一层面，会在beforeCreate钩子之前调用。
### 2. 配合template使用
如果setup返回一个对象，那么对象的属性会被合并到当前组件的render上下文。

从setup中返回的refs在template中获取值时会被自动unwrapped(猜测可能是get值时用了unref。unref也是一个新的api，val = isRef(val) ? val.value : val的语法糖)，因此在模板中取值时无需加上.value。

### 3. 配合render函数使用
setup里不仅可以返回一个对象，也可以直接返回一个render函数。不过要注意的是，跟template会自己unwrapped不同，在render中使用refs的值时，需要加上.value。

### 4. 参数
setup接收两个参数，第一个是用的最多的props，第二是ctx上下文，不过是精简版，只提供了三个属性attrs，slots，emit,这三个都是写组件必不可少的。

- emit: 同父组件通信用
- slots: 插槽分发内容
- attrs: 可以用于封装高阶组件, 配合v-bind进行属性透传

### 5. this在setup中不可用
在vue2，你可以在每一个生命周期或者方法中通过this获取当前实例，不过在setup方法中是无法获取到this的。但是，可以通过getCurrentInstance获取到当前实例。


## reactive

传入一个对象并返回对目标源的响应式代理结果，等同于2版本的Vue.observable()。

## ref
类似reactive，但是传入的是基本值，取值时需要加上.vaule去获取，而reactive包裹的对象可以直接像对象那样去获取值。
不过当数据结构是数组或者Map时，即使数组已经被reactive包裹了，如果数组里面的某一项是ref，依然需要通过.value去获取值。


```javascript
//ref
const count = ref(0)
console.log(count.value);

//reactive
const state = reactive({
  count
})
console.log(state.count);

//reactive with array
const arr = reactive([ref(0),3,5])
// need .value here
console.log(arr[0].value)

```


## computed
接收一个回调函数作为getter，或者传入带有getter和setter对象 。一个computed会返回一个对象，有多个computed时就需要调用多次

```javascript
const plusOne = computed(() => count.value + 1)
const plusTwo = computed({
  get: () => count.value + 1,
  set: val => {
    count.value = val - 1
  }
})
```

## toRef, toRefs

toRef可用于为源响应对象上的某个属性创建ref。

```javascript
export default {
    //由于Javascript函数参数是按值传递，所以如果传递的是基本类型，传参可以理解为复制变量值。基本类型复制后俩个变量完全独立，之后任何一方改变都不会影响另一方。如果直接传递props.numner也就是10进去，函数内部跟外部是独立的，函数里面的操作无法影响到外部变量，除非你传递的是一个对象比如整个props，才能保持引用。但是如果你只需要某个属性，传整个进去也是没必要的。此时toRef就显的很有用了。toRef返回的就是一个对象，通过这个对象.value可以获取到值。
  setup(props) {
    // {number:10}
    useSomeFeature(toRef(props, 'number'))
  }
}
```

toRefs可以将响应式对象转换为普通对象，其中结果对象上的每个属性都是指向原始对象中相应属性的引用。可以用于解构的时候防止丢失响应。

## 生命周期

生命周期大部分都改了名字，写法上也稍有不同。

1. 需要自己import；
2. 在setup中调用；

- beforeCreate -> use setup()
- created -> use setup()
- beforeMount -> onBeforeMount
- mounted -> onMounted
- beforeUpdate -> onBeforeUpdate
- updated -> onUpdated
- beforeDestroy -> onBeforeUnmount
- destroyed -> onUnmounted
- errorCaptured -> onErrorCaptured

## 语法就大概介绍这些，具体的内容还是要看看官方文档。下面看一下组件的具体代码

```javascript
<script>
import { h, reactive, onMounted, onBeforeUnmount, toRef } from "vue";
import { formatTime } from "./utils";

export default {
  props: {
    time: {
      type: Number,
      default: 0
    },
    millisecond: {
      type: Boolean,
      default: false
    },
    autoStart: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const interval = props.millisecond ? 16 : 1000;

    let leftTime = toRef(props, "time").value;
    let autoStart = toRef(props, "autoStart").value;

    let ticker = null;
    let timeData = reactive(formatTime(leftTime));

    const updateTime = (timeData, leftTime) => {
      const data = formatTime(leftTime);
      Object.keys(timeData).forEach(k => {
        timeData[k] = data[k];
      });
    };

    const start = () => {
      if (!ticker && leftTime > 0) {
        ticker = setInterval(() => {
          leftTime -= interval;
          if (leftTime <= 0) {
            leftTime = 0;
            clearInterval(ticker);
            emit("finish");
          } else {
            emit("change", leftTime);
          }

          updateTime(timeData, leftTime);
        }, interval);
      }
    };

    const stop = () => {
      clearInterval(ticker);
      ticker = null;
    };

    const restart = () => {
      clearInterval(ticker);
      ticker = null;
      leftTime = props.time;

      emit("change", leftTime);
      updateTime(timeData, leftTime);

      start();
    };

    onMounted(() => {
      autoStart && start();
    });

    onBeforeUnmount(() => {
      stop();
    });

    return {
      timeData,
      start,
      stop,
      restart
    };
  },
  render({ $slots, timeData, millisecond }) {
    const time = ["hours", "minutes", "seconds", "millisecond"]
      .filter(v => v != "millisecond" || millisecond)
      .map(v => timeData[v])
      .join(":");

    const defaultContent = h(
      "span",
      {
        style: { fontSize: "14px", color: "#333" }
      },
      time
    );

    return h(
      "div",
      ($slots.default && $slots.default(timeData)) || defaultContent
    );
  }
};
</script>
```

主要的变化还是在setup，没有data，也没有methods了，都需在setup里面返回才可以使用。基本上绝大部门的代码都写在setup里面，包括事件，生命周期等， 当然这也很变量的作用域有关。也可以考虑把逻辑抽取出去，不过传参的时候，需要使用toRef或者toRefs，不能传基本值。

## 高阶组件
主要是用attrs来实现属性的绑定，但是具体是不是这样写，我还不太确定。

```javascript
<template>
  <div>
    <p>{{ word }}</p>
    <countdown v-bind="attrs"></countdown>
  </div>
</template>

<script>
import Countdown from "../components/countdown";

export default {
  components: {
    Countdown
  },
  props: {
    word: {
      type: String
    }
  },
  setup(props, { attrs }) {
    return {
      attrs
    };
  }
};
</script>
```

## DEMO
```javascript
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
```

## 展示效果

![效果](https://deepexi-moby.oss-cn-shenzhen.aliyuncs.com/guide.jpg)
