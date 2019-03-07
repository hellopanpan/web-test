import fetch from '@/lib/fetch'

// 获取地址列表
export const addressList = () => {
  return fetch({
    url: '/api/user/getAddressList'
  })
}