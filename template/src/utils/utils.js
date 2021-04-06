import moment from 'moment';

export const options = (option = [], text = 'text', value = 'value') => {
  return (
    option?.map(item => ({
      text: item[text],
      value: item[value]
    })) || []
  );
};

export const ArraytoObject = (data = [], key, value) => {
  return (
    data?.reduce((prev, next) => {
      const text = next[key];

      return {
        ...prev,
        [text]: next[value]
      };
    }, {}) || {}
  );
};

export const whetherenum = (data, YES, NO) => {
  const textObject = { YES, NO };

  return data.map(item => ({
    value: item.value,
    text: textObject[item.value]
  }));
};

export const optionArray = (map = {}, ignore = []) => {
  const array = !ignore.length
    ? Object.keys(map)
    : Object.keys(map).filter(value => !ignore.includes(value));

  return array.map(value => ({ key: value, value, text: map[value] }));
};

export const handleFormatTime = time => {
  if (Array.isArray(time) && time.length) {
    const [startTime, endTime] = time;
    const fmt = 'YYYY-MM-DD HH:mm:ss';

    return [
      moment(startTime)
        .startOf('date')
        .format(fmt),
      moment(endTime)
        .endOf('date')
        .format(fmt)
    ];
  }

  return [];
};

export const statusColor = ({
  wait = [],
  progress = [],
  failure = [],
  succeed = [],
  invalid = []
}) => status => {
  if (wait.includes(status)) {
    return 'phecda-wait';
  }
  if (progress.includes(status)) {
    return 'phecda-progress';
  }
  if (failure.includes(status)) {
    return 'phecda-failure';
  }
  if (succeed.includes(status)) {
    return 'phecda-succeed';
  }
  if (invalid.includes(status)) {
    return 'phecda-invalid';
  }
};
