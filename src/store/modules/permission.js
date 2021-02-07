import { constantRoutes } from '@/router'
import Layout from '@/layout'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes1({ commit }, routelist) {
    return new Promise(resolve => {
      const accessedRoutes = dataArrayToRoutes(routelist)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

function dataArrayToRoutes(data) {
  const res = []
  data.forEach(item => {
    const tmp = { ...item }
    if (tmp.component === 'Layout') {
      tmp.component = Layout
      tmp.meta.icon = 'dashboard'
      tmp.alwaysShow = true
      tmp.meta.affix = false
    } else {
      tmp.meta.icon = 'guide'
      tmp.name = 'name'
      let sub_view = tmp.component
      sub_view = sub_view.replace(/^\/*/g, '')
      tmp.component = (resolve) => require([`@/views/${sub_view}`], resolve)
    }
    if (tmp.children) {
      tmp.children = dataArrayToRoutes(tmp.children)
    }
    res.push(tmp)
  })
  return res
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
