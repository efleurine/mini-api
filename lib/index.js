const pathMatch = require('path-match')
const { json, send } = require('micro')

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] // recognize method

const debug = (message) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message)
  }
}

const configureRouter = (routes) => {
  const pathMatcher = pathMatch() // url matcher

  // Should we really override the original routes
  const lRoutes = routes.map((lr) => {
    const route = lr
    if (!route.path) throw new Error('A valid path is required')
    if (!route.handler) throw new Error('A valid handler is required')
    if (route.method && !METHODS.includes(route.method.toUpperCase())) debug(`The method [${route.method}] is not part of the list ${METHODS} `)
    if (!route.method) route.method = 'get'

    // create the url pattern for the path
    const matcher = pathMatcher(route.path)

    // if the method is not recognize throw an error
    const method = route.method.toUpperCase()

    const pre = route.pre || []
    const post = route.post || []
    const funcs = [].concat(pre, route.handler, post)

    delete (route.pre)
    delete (route.post)
    delete (route.handler)

    route.funcs = funcs

    return Object.assign({}, route, { matcher }, { method })
  })
  // create the lookup object
  const lookup = (url, method) => {
    let params = false

    let route = lRoutes.find((thatRoute) => {
      if (thatRoute.method !== method) {
        return false
      }
      params = thatRoute.matcher(url)
      return !!params
    })

    if (route && params) {
      route = Object.assign({}, route, { params })
    }

    return route
  }

  return lookup // will stay bind to local routes
}


const sendPageNotFound = (req, res) => {
  const message = `${req.method} ${req.url} not found`
  debug(message)
  return send(res, 404, { message })
}

const miniApi = (routes) => {
  const lookup = configureRouter(routes) // we launch the router config
  // will return an asynchronous function which will execute the code
  return async (req, res) => {
    const route = lookup(req.url, req.method)
    // make it the first validation in the structure in pre
    if (!route) {
      sendPageNotFound(req, res)
    }

    try {
      let reqBody = {}
      let resBody = {}

      try {
        reqBody = await json(req) // get the json body
      } catch (error) {
        reqBody = {}
      }


      /* eslint-disable no-restricted-syntax */
      for (const fn of route.funcs) {
        /* eslint-disable no-await-in-loop */
        const result = await fn({
          req,
          res,
          reqBody,
          resBody
        })
        if (res.headersSent) return
        resBody = Object.assign({}, resBody, result)
      }
      // at this point now response was sent yet and we need to send the reponse
      // all exception should have already been handled
      send(res, 200, resBody)
    } catch (error) {
      const { message, stack, statusCode } = error
      const code = statusCode || 500 // default status code
      debug(error)
      send(res, code, { message, stack, code })
    }
  }
}

module.exports = miniApi

