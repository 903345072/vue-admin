import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/user/getAll',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/user/addUser',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/user/updateUser',
    method: 'post',
    data
  })
}

export function updateAdminStatus(data) {
  return request({
    url: '/user/updateStatus',
    method: 'post',
    data
  })
}
