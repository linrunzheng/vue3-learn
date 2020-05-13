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
