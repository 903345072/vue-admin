import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/seat/getSeatList',
    method: 'get',
    params: query
  })
}

export function createSeat(data) {
  return request({
    url: '/seat/addSeat',
    method: 'post',
    data
  })
}

export function updateSeat(data) {
  return request({
    url: '/seat/updateSeat',
    method: 'post',
    data
  })
}

export function updateSeatOpen(data) {
  return request({
    url: '/seat/updateSeatOpen',
    method: 'post',
    data
  })
}
