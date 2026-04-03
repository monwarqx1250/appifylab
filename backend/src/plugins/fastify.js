const fp = require('fastify-plugin')
const { pipeline } = require('stream/promises')
const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

/**
 * Fastify Plugin: fileUploader
 * 
 * Saves uploaded files to disk and returns metadata for each file.
 * Usage:
 *   fastify.register(fileUploader, { uploadPath: './uploads' })
 *   const filesMeta = await fastify.saveFiles(request)
 */
module.exports = fp(async (fastify, opts) => {
  const uploadPath = opts.uploadPath || './uploads'

  // ensure upload directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
  }

  /**
   * saveFiles(request)
   * Processes multipart request and saves all files
   * Returns: array of file metadata { filename, originalname, mimetype, fieldname, path }
   */
  fastify.decorate('normalizeMultipart', async (request) => {
    const body = {
        files : [],
    }

    for await (const part of request.parts()) {
      if (part.type === 'file') {
        // create safe unique filename
        const ext = path.extname(part.filename)
        const filename = `${randomUUID()}${ext}`
        const filePath = path.join(uploadPath, filename)

        // save the file to disk
        await pipeline(part.file, fs.createWriteStream(filePath))

        // store metadata
        body.files.push({
          fieldname: part.fieldname,
          originalname: part.filename,
          filename,
          mimetype: part.mimetype,
          path: filePath
        })
      }else{
        body[part.fieldname] = part.value
      }
    }

    return body
  })
})