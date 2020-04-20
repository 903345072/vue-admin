import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/role/roleList',
    method: 'get',
    params: query
  })
}

export function createCard(data) {
  return request({
    url: '/role/addRole',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/role/updateRole',
    method: 'post',
    data
  })
}

export function updateCardStatus(data) {
  return request({
    url: '/DiscountCard/updateCardStatus',
    method: 'post',
    data
  })
}
