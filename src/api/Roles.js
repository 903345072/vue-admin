import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/role/get',
    method: 'get',
    params: query
  })
}

export function createCard(data) {
  return request({
    url: '/role/add',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/role/update',
    method: 'post',
    data
  })
}

export function updateCardStatus(data) {
  return request({
    url: '/role/delete',
    method: 'get',
    params: data
  })
}
