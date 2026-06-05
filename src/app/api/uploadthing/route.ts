import { createRouteHandler } from "uploadthing/next"
import { uploadRouter } from "./core"

// Serves the upload presign (POST) and callback (GET) endpoints.
export const { GET, POST } = createRouteHandler({ router: uploadRouter })
