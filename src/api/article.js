import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/getAdminList',
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
    url: '/admin/addAdmin',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/admin/updateAdmin',
    method: 'post',
    data
  })
}

export function updateAdminStatus(data) {
  return request({
    url: '/admin/updateAdminStatus',
    method: 'post',
    data
  })
}
