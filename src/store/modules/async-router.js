/**
 * 向后端请求用户的菜单，动态生成路由
 */
import { constantRouterMap } from '/src/config/router.config'
import { generatorDynamicRouter } from '/src/router/generator-routers'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise((resolve) => {
        const { token } = data
        generatorDynamicRouter(token).then((routers) => {
          commit('SET_ROUTERS', routers)
          resolve()
        })
      })
    },
  },
}

export default permission
