const urlModule = require('url');
class Router {
    constructor() {
        this.getRoutes = {}
        this.postRoutes = {}
        this.patchRoutes = {}
        this.putRoutes = {}
        this.deleteRoutes = {}
    }

    use(url, router) {
        let el
        for (el in router.getRoutes) {
            this.getRoutes[url + el] = router.getRoutes[el]
        }
        for (el in router.postRoutes) {
            this.postRoutes[url + el] = router.postRoutes[el]
        }
        for (el in router.deleteRoutes) {
            this.patchRoutes[url + el] = router.patchRoutes[el]
        }
        for (el in router.deleteRoutes) {
            this.deleteRoutes[url + el] = router.deleteRoutes[el]
        }
        for (el in router.putRoutes) {
            this.putRoutes[url + el] = router.putRoutes[el]
        }
    }

    post(url, controller) {
        this.postRoutes[url] = controller
    }

    get(url, controller) {
        this.getRoutes[url] = controller
    }

    patch(url, controller) {
        this.patchRoutes[url] = controller
    }

    delete(url, controller) {
        this.deleteRoutes[url] = controller
    }

    put(url, controller) {
        this.putRoutes[url] = controller
    }

    route(req, res) {
        var url = req.url.split('?')[0]
        req.parameters = urlModule.parse(req.url, true).query
        if (req.method === 'GET') {
            if (this.getRoutes[url] !== undefined) {
                try {
                    this.getRoutes[url](req, res)
                } catch (e) {
                    console.error(e)
                }
            }
        }
        if (req.method === 'POST') {
            if (this.postRoutes[url] !== undefined) {
                try {
                    this.postRoutes[url](req, res)
                } catch (e) {
                    console.error(e)
                }
            }

        }
        if (req.method === 'DELETE') {
            if (this.deleteRoutes[url] !== undefined) {
                try {
                    this.deleteRoutes[url](req, res)
                } catch (e) {
                    console.err(e)
                }
            }
        }
        if (req.method === 'PATCH') {
            if (this.patchRoutes[url] !== undefined) {
                try {
                    this.patchRoutes[url](req, res)
                } catch (e) {
                    console.err(e)
                }
            }
        }
        if (req.method === 'PUT') {
            if (this.putRoutes[url] !== undefined) {
                try {
                    this.putRoutes[url](req, res)
                } catch (e) {
                    console.err(e)
                }
            }
        }
    }
}
module.exports = { Router }