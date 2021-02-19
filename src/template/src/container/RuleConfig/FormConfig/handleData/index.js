import { isEqual, unionWith, omit } from 'lodash';

// 需要更改数据结构
const keyList = ['Day', 'Amount', 'Ratio'];

// 需要转百分比
const ratioList = ['ratio', 'Ratio'];

// 利率配置的各种提交拦截验证
const submitRule = data => {
  return data.map(item => {
    // 取 item.ratioVos 数据的交集
    const sameRatio = item.ratioVos.some((current, index, array) => {
      const currentKeyList = keyList.filter(key => !['Ratio'].includes(key));

      return currentKeyList.some(key => {
        if (current[`min${key}`] != null && current[`max${key}`] != null) {
          return !!array.find((item, currentIndex) => {
            if (
              index !== currentIndex &&
              isEqual(current[`min${key}`], item[`min${key}`]) &&
              isEqual(current[`max${key}`], item[`max${key}`])
            ) {
              return true;
            }

            return false;
          });
        }
        return false;
      });
    });

    // 固定金额、固定利率 在相同维度下不允许有不同的配置
    const isFixed = item.ratioVos.some((current, index, array) => {
      const currentKeyList = keyList
        .filter(key => !['Day'].includes(key))
        .map(item => item?.toLowerCase());

      return currentKeyList.some(key => {
        if (current[key] != null) {
          return !!array.find((item, currentIndex) => {
            if (index !== currentIndex && !isEqual(current[key], item[key])) {
              return true;
            }

            return false;
          });
        }
        return false;
      });
    });

    // 判断是否有相同的配置   这样做主要不影响传值  与数据无关的数据保存在链上  只供前端自己交互界面使用
    Object.setPrototypeOf(item, {
      sameRatio,
      isFixed
    });

    return item;
  });
};

// 逆向解析数据
export const formatReverseFormConfig = (data = []) => {
  return (
    data?.map(item => {
      // 还款日配置
      item.repayDayRule = item.repayDayRule
        ? JSON.parse(item.repayDayRule)
        : {};

      item.skuConfigVos = item.skuConfigVos.reduce((prev, next) => {
        next = next.ratioVos.map(item => {
          // 更改数据结构   { maxXXX: number } -> { XXX:{ max:number } }
          item = Object.fromEntries(
            Object.entries(item).reduce((prev, [currentKey, currentValue]) => {
              const key = keyList.find(key => currentKey.endsWith(key));

              if (currentValue != null && key) {
                return prev.map(([prevKey, value]) => {
                  if (Object.is(key, prevKey)) {
                    return [
                      key,
                      {
                        ...value,
                        [currentKey.replace(new RegExp(key), '')]: currentValue
                      }
                    ];
                  }

                  return [prevKey, value];
                });
              }

              return [...prev, [currentKey, currentValue]];
            }, keyList.map(key => [key, {}]))
          );

          ratioList.forEach(key => {
            // 非数字类型都统一当对象处理
            if (Number.isNaN(+item[key])) {
              item[key] = Object.fromEntries(
                Object.entries(item[key]).map(([currentKey, value]) => [
                  currentKey,
                  (value * 100).toFixed(2)
                ])
              );
              return;
            }

            item[key] = (item[key] * 100).toFixed(2);
          });

          return {
            ratioVos: [item],
            ...omit(next, ['ratioVos'])
          };
        });

        return [...prev, ...next];
      }, []);

      return item;
    }) ?? []
  );
};

// 正向解析数据
export const formatFormConfig = (data = []) => {
  return data
    .filter(item => item)
    .map(item => {
      item.dimensions = item.dimensions?.filter(item => item) || [];

      // type 只是前端界面交互数据没有必要传后端
      return omit(item, ['type']);
    })
    .reduce((prev, next) => {
      next.ratioVos = next.ratioVos.map(item => {
        ratioList.forEach(key => {
          if (!item[key]) {
            return;
          }

          // 非数字类型都统一当对象处理
          if (Number.isNaN(+item[key])) {
            item[key] = Object.fromEntries(
              Object.entries(item[key]).map(([currentKey, value]) => [
                currentKey,
                (value / 100).toFixed(4)
              ])
            );
            return;
          }

          item[key] = (item[key] / 100).toFixed(4);
        });

        keyList.forEach(key => {
          if (item[key]) {
            const newValue = Object.fromEntries(
              Object.entries(item[key]).map(([currentKey, value]) => [
                `${currentKey}${key}`,
                value
              ])
            );

            item = {
              ...omit(item, [key]),
              ...newValue
            };
          }
        });

        return item;
      });

      const unionItem = unionWith(prev, [next], (prev, next) =>
        isEqual(prev.dimensions, next.dimensions)
      );

      // 维度不同直接插入数据
      if (!isEqual(prev, unionItem)) {
        prev = unionItem;
      } else {
        // 维度相同 push 当前数据
        prev = prev.map(item => {
          if (isEqual(item.dimensions, next.dimensions)) {
            item.ratioVos = [...item.ratioVos, ...next.ratioVos];
          }

          return item;
        });
      }

      return submitRule(prev);
    }, []);
};
