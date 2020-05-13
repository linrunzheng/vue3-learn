export function formatTime(time) {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  const format = time => padTwo(Math.floor(time));

  const days = Math.floor(time / DAY);
  const hours = format((time % DAY) / HOUR);
  const minutes = format((time % HOUR) / MINUTE);
  const seconds = format((time % MINUTE) / SECOND);
  const millisecond = format(time % SECOND);

  return {
    days,
    hours,
    minutes,
    seconds,
    millisecond
  };
}

function padTwo(t) {
  return Number(t) >= 10 ? t.toString().slice(0, 2) : "0" + t;
}
