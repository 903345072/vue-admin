import request from '@/utils/request'

export function fetchList() {
  return request({
    url: '/permission/getAll',
    method: 'get'
  })
}

export function createPermission(data) {
  return request({
    url: '/permission/add',
    method: 'post',
    data
  })
}

export function updatePermission(data) {
  return request({
    url: '/permission/update',
    method: 'post',
    data
  })
}
export function deletePermission(id) {
  return request({
    url: '/permission/delete',
    method: 'get',
    params: { id }
  })
}
export function updatePermissionStatus(data) {
  return request({
    url: '/Permission/updatePermissionStatus',
    method: 'post',
    data
  })
}
