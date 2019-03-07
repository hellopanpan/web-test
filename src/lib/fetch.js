import proxyConfig from '../proxy.config'
import wepy from 'wepy'

let queue = null
let env = 'prod'
let server = proxyConfig[env]

function loginSuccess(isFail) {
  queue.forEach(request => {
    request(isFail)
  })
  queue = null
}

function login() {
  wx.login({
    success(loginres) {
      wx.setStorageSync('loginCode', loginres.code)
      wx.request({
        url: server + `/login/userloginV2`,
        method: 'POST',
        data: {
          code: loginres.code
        },
        success(response) {
          let res = response.data || {}
          if (res.code == 0) {
            wx.setStorageSync('token', res.data.signCode);
            wx.setStorageSync('uid', res.data.uid)
            loginSuccess()
          } else {
            loginSuccess(true)
            res.msg &&
              wx.showToast({
                title: res.msg,
                icon: 'none'
              });
          }
        },
        fail() {
          loginSuccess(true)
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      })
    },
    fail(err) {
      console.log('登录失败', err)
      queue = null
    }
  })
}
export default options => {
  return new Promise((resolve, reject) => {
    function request(isFail) {
      if (isFail) {
        return resolve({})
      }
      let opts = Object.assign({
        method: 'POST',
        header: {
          'content-type': options.form ? 'application/x-www-form-urlencoded' : 'application/json',
          signCode: encodeURIComponent(wx.getStorageSync('token'))
        }
      }, options)

      env = wepy.$appConfig.env || 'prod'
      server = proxyConfig[env]
      if (env == 'dev') console.log('fetch:', env, server)
      if (opts.url) {
        let timeStr = `t=${Date.now()}`
        opts.url += /\?/.test(opts.url) ? '&' + timeStr : '?' + timeStr
        opts.url = server + opts.url
      }
      if (env == 'dev') console.log('request--start:', opts.url, opts);

      wx.showNavigationBarLoading()
      wx.request(Object.assign(opts, {
        success(res) {
          if (env == 'dev') console.log('request--success:', opts.url, res);
          wx.hideNavigationBarLoading()
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (res.data.code == 403) {
              if (!queue) {
                queue = []
                login()
              }
              queue.push(request)
            } else {
              resolve(res.data)
            }
          } else {
            reject(res)
          }
        },
        fail(err) {
          wx.hideNavigationBarLoading()
          reject(err)
        }
      }))
    }

    request()
  })
}
