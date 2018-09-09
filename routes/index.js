const express = require('express')
const router = express.Router()

const setCandidateRoutes = require('./candidateRoutes')
const setOwnerRoutes = require('./ownerRoutes')
const setParamRoutes = require('./paramRoutes')
const setAnnotationRoutes = require('./annotationRoutes')

setCandidateRoutes(router)
setOwnerRoutes(router)
setParamRoutes(router)
setAnnotationRoutes(router)

module.exports = router
