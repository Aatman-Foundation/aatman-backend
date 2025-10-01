import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandlers} from "../utils/asyncHandlers.js"


const healthcheck = asyncHandlers( async (req, res) => {
    return res.status(200).json(new ApiResponse(200, "OK", "Health check passed"))
})

export {healthcheck};