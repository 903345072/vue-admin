import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/Permission/permissionList',
    method: 'get',
    params: query
  })
}

export function createPermission(data) {
  return request({
    url: '/Permission/addPermission',
    method: 'post',
    data
  })
}

export function updatePermission(data) {
  return request({
    url: '/Permission/updatePermission',
    method: 'post',
    data
  })
}

export function updatePermissionStatus(data) {
  return request({
    url: '/Permission/updatePermissionStatus',
    method: 'post',
    data
  })
}
