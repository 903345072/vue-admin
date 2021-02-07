import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/interest/getAll',
    method: 'get',
    params: query
  })
}

export function createLeverage(data) {
  return request({
    url: '/leverage/insertOneLeverage',
    method: 'post',
    data
  })
}

export function setInterest(data) {
  return request({
    url: '/interest/setInterest',
    method: 'post',
    data
  })
}

export function updateLeverage(data) {
  return request({
    url: '/leverage/updateLeverage',
    method: 'post',
    data
  })
}

export function updateLeverageStatus(data) {
  return request({
    url: '/leverage/updateLeverageStatus',
    method: 'post',
    data
  })
}
