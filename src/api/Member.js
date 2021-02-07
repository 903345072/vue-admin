import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/member/getMemberHeYueApplyList',
    method: 'get',
    params: query
  })
}

export function createHeYue(data) {
  return request({
    url: '/heyue/insertOneHeYue',
    method: 'post',
    data
  })
}

export function updateHeYue(data) {
  return request({
    url: '/heyue/updateHeYue',
    method: 'post',
    data
  })
}

export function updateHeYueStatus(data) {
  return request({
    url: '/member/updateHeYueApplyState',
    method: 'post',
    data
  })
}
