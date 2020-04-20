import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/DiscountCard/getCardList',
    method: 'get',
    params: query
  })
}

export function createCard(data) {
  return request({
    url: '/DiscountCard/addCard',
    method: 'post',
    data
  })
}

export function updateCard(data) {
  return request({
    url: '/DiscountCard/updateCard',
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
