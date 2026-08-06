import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contact } from "../models/contact.model.js";

const submitContact = asyncHandler(async (req, res) => {
  const { name, email, organisation, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ApiError(400, "Name, email, and message are required");
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim(),
    organisation: organisation?.trim() || "",
    message: message.trim(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, contact, "Message submitted successfully"));
});

export { submitContact };
