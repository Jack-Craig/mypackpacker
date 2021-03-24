let multer = require('multer')
const aws = require('aws-sdk')
const multerS3 = require('multer-s3')

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_ID,
  region: 'us-west-2'
})

let s3 = new aws.S3()

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'mypackpacker-static',
    key: (req, file, cb) => {
      cb(null, req.body.id + file.fieldname)
    }
  })
})

module.exports = {upload: upload, s3: s3}