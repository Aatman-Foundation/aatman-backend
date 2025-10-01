import { asyncHandlers } from "../utils/asyncHandlers";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AyushRegisteredDoctor } from "../models/doctor.model";

const registerAyushDoctor  = asyncHandlers (async (req, res) =>{
    const raw = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body;
    
})