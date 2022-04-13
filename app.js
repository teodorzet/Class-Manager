  const { Router } = require('./utils/router')
  const { WebApp } = require('./utils/webApp')
  const { index } = require('./routes/routeIndex')
  const db = require('./utils/database')

  const router = new Router()
  router.use('', index)
  const app = new WebApp(8888, router)
  app.listen()

  console.log()