export default {
  // 格式化金额
  formatAmount(amount) {
    if (amount == null || amount == undefined) return;
    return Number(amount).toFixed(2);
  },

  // 格式化日期，fmt: yyyy-MM-dd hh:mm:ss
  formatDate(second, fmt, isMs) {
    if (!second || !fmt || isNaN(second)) {
      return '';
    }
    let date = new Date(isMs ? second : second * 1000);
    let tObj = {
      M: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds()
    };
    fmt = fmt.replace(/y+/, date.getFullYear());
    for (let key in tObj) {
      if (new RegExp(`(${key}+)`).test(fmt)) {
        if (RegExp.$1.length == 1) {
          fmt = fmt.replace(RegExp.$1, tObj[key]);
        } else {
          fmt = fmt.replace(
            RegExp.$1,
            ('00' + tObj[key]).slice((tObj[key] + '').length)
          );
        }
      }
    }
    return fmt;
  },

  // 获取值对应的index
  getIndex(val, list, valueField) {
    if (val == null || !list || !list.length) {
      return -1;
    }
    for (let i = 0, len = list.length; i < len; i++) {
      if (val == list[i][valueField]) {
        return i;
      }
    }
    return -1;
  },

  showToast(msg, time = 3000) {
    if (!msg) return;
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: time
    });
  },

  getMaskTel(tel) {
    return (tel && tel.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')) || '';
  },

  formatByFileds(obj, fomatArr) {
    if (!obj || !fomatArr || !Array.isArray(fomatArr)) {
      return;
    }
    fomatArr.forEach(key => {
      if (obj[key]) {
        obj[key] = this.formatAmount(obj[key]);
      }
    });
  },

  toFixed(num, s) {
    var times = Math.pow(10, s);
    var des = num * times + 0.5;
    des = parseInt(des, 10) / times;
    return des + '';
  },

  getQueryString(str, name) {
    if (!str || !name) return;
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    let r = str.match(reg);
    if (r != null) return unescape(r[2]);
    return undefined;
  },

  // 查询授权情况
  isAuth(key) {
    return new Promise((resolve) => {
      wx.getSetting({
        success(res) {
          let map = res.authSetting || {}
          resolve(map[key])
        },
        fail() {
          resolve(false)
        }
      })
    })
  },

  // 数据埋点
  saData(type, opts) {
    let defautData = {
      name: 'haohuosousou',
      page: 'default',
      seller_id: wx.getStorageSync('sellerId') || 'no_seller_id',
      source: wx.getStorageSync('sourceId') || 'no_source',
      page_source: wx.getStorageSync('pageSource') || 'no_pageSource',
    }
    // 首页曝光
    this.$wxapp.md.track(type || 'no_type', Object.assign({}, defautData, opts));
  },

  wxLogin() {
    return new Promise((resolve) => {
      wx.login({
        success(loginRes) {
          resolve(loginRes)
        },
        fail() {
          resolve({})
        }
      })
    })
  },

  // 截取num位小数
  formatDecimal(amount, num) {
    if (!amount || !num || num < 0) {
      return 0
    }
    let base = Math.pow(10, num)
    amount = Math.floor(amount * base) / base
    return amount.toFixed(num)
  }
}
