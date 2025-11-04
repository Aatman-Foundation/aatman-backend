import { body } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

const userRegisterValidator = () => {
  return [
    body("fullname").trim().notEmpty().withMessage("Fullname is required!"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required!")
      .isEmail()
      .withMessage("Email is invaild"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required!")
      .isLength({ min: 8 })
      .withMessage("Password must be 8 character long!"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required!")
      .isNumeric()
      .withMessage("Invalid phone number")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number must be 10-digits"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("phoneNumber").optional().matches(/^\d{10}$/).withMessage("Phone number must be a 10-digit number"),

    body().custom((value) => {
      if(!value.email && !value.phoneNumber) {
        throw new Error("Either email or phone number is required");
      }
      return true;
    }),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  
  ]
}

const medicalProfessionalRegistration = () => {
  return [
    body("fullname").trim().notEmpty().withMessage("Fullname is required!"),
    body("dateOfBirth")
      .trim()
      .notEmpty()
      .withMessage("Date of birth is required!"),
    body("gender").trim().notEmpty().withMessage("Please select gender"),
    body("personalNationality")
      .trim()
      .notEmpty()
      .withMessage("Nationality is required!"),

    // Section 2: Contact Details

    body("permanentAddress.houseNo")
      .trim()
      .notEmpty()
      .withMessage("House number is required!"),
    body("permanentAddress.street")
      .trim()
      .notEmpty()
      .withMessage("Street name is required!"),
    body("permanentAddress.city")
      .trim()
      .notEmpty()
      .withMessage("City name is required!"),
    body("permanentAddress.state")
      .trim()
      .notEmpty()
      .withMessage("State name is required!"),
    body("permanentAddress.pinCode")
      .trim()
      .notEmpty()
      .withMessage("Pincode  is required!")
      .matches(/^\d{6}$/)
      .withMessage("Pin code must be a 6-digit number!"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be a 10-digit number!"),
    body("altPhoneNumber").optional().trim(),
    body("emailPrimary")
      .trim()
      .notEmpty()
      .withMessage("Email is required!")
      .isEmail()
      .withMessage("Email is invaild"),
    body("emailAlternate").optional().trim(),

    // Section 3: Academic & Professional Qualifications

    body("academicQualifications.ug.qualification")
      .trim()
      .notEmpty()
      .withMessage("UG degree is required!"),
    body("academicQualifications.ug.college")
      .trim()
      .notEmpty()
      .withMessage("College name is required!"),
    body("academicQualifications.ug.yearOfPassing")
      .trim()
      .notEmpty()
      .withMessage("Passing year is required!")
      .isInt({ min: 1900, max: 2100 })
      .withMessage(
        "Year of passing must be a valid number between 1900 and 2100",
      ),

    body("academicQualifications.pg.qualification")
      .trim()
      .notEmpty()
      .withMessage("PG degree is required!"),
    body("academicQualifications.pg.specialization")
      .trim()
      .notEmpty()
      .withMessage("PG specialization is required!"),
    body("academicQualifications.pg.college")
      .trim()
      .notEmpty()
      .withMessage("College name is required!"),
    body("academicQualifications.pg.yearOfPassing")
      .trim()
      .notEmpty()
      .withMessage("Passing year is required!")
      .isInt({ min: 1900, max: 2100 })
      .withMessage(
        "Year of passing must be a valid number between 1900 and 2100",
      ),

    body("academics_phdOrResearchDegrees").optional().trim(),
    body("academics_additionalCertifications").optional().trim(),

    // Section 4: Regulatory Details
    body("regulatoryDetails.regulatoryAyushRegNo")
      .trim()
      .notEmpty()
      .withMessage("Ayush registration number is required!"),

    body("regulatoryDetails.councilName")
      .trim()
      .notEmpty()
      .withMessage("Council name is required!"),

    body("regulatoryDetails.registrationDate")
      .trim()
      .notEmpty()
      .withMessage("Registration date is required!")
      .toDate()
      .custom((value) => {
        if (value > Date.now()) {
          throw new Error("Registration date cannot be in the future!");
        }
        return true;
      }),

    body("regulatoryDetails.regulatoryValidityUntil")
      .trim()
      .notEmpty()
      .withMessage("Regulatory validity date is required!")
      .toDate(),

    // Section 5: Practice & Work Experience
    body("practiceDetails.currentDesignation")
      .trim()
      .notEmpty()
      .withMessage("Current Designation is required!"),
    body("practiceDetails.currentInstitution")
      .trim()
      .notEmpty()
      .withMessage("Current institution is required!"),

    body("practiceDetails.workAddress")
      .trim()
      .notEmpty()
      .withMessage("Work address is required!"),
    body("practiceDetails.yearsExperience")
      .trim()
      .notEmpty()
      .withMessage("Work address is required!")
      .isInt({ min: 0, max: 80 })
      .withMessage("Work experience is invalid"),

    body("practiceDetails.specializationAreas")
      .isArray({ min: 1 })
      .withMessage("At least one specialization area is required!"),

    body("previousExperience").isArray({ min: 1 })
      .withMessage("At least one previous experience entry is required!"),

    body("previousExperience.*.designation")
      .trim()
      .notEmpty()
      .withMessage("Designation is required!"),

    body("previousExperience.*.organization")
      .trim()
      .notEmpty()
      .withMessage("Organization is required!"),

    body("previousExperience.*.description")
      .trim()
      .notEmpty()
      .withMessage("Description is required!")
      .isLength({ min: 10 })
      .withMessage("Description should be at least 10 characters long"),

    // Section 6: Research & Publications

     body("researchInterests")
    .isArray({ min: 1 })
    .withMessage("At least one research interest is required!"),

    body("publicationDetails")
      .isArray({ min: 1 })
      .withMessage("At least one publication record is required!"),

    body("publicationDetails.*.journal")
      .optional({ checkFalsy: true })
      .isString()
      .withMessage("Journal must be a string"),

    body("publicationDetails.*.title")
      .optional({ checkFalsy: true })
      .isString()
      .withMessage("Title must be a string"),

    body("publicationDetails.*.year")
      .optional({ checkFalsy: true })
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be between 1900 and 2100"),

    body("publicationDetails.*.link")
      .notEmpty()
      .withMessage("Publication link is required!")
      .isURL()
      .withMessage("Publication link must be a valid URL"),

    // Section 7 : Training & Capacity Building
    body("traningDetails")
      .isArray({ min: 1 })
      .withMessage("At least one traning details entry is required!"),
    body("traningDetails.*.traningName")
      .trim()
      .notEmpty()
      .withMessage("Traning name is required!"),
    body("traningDetails.*.traningOrganizer")
      .trim()
      .notEmpty()
      .withMessage("Traning organizer name is required!"),
    body("traningDetails.*.traningRole").notEmpty()
      .withMessage("At least one training role is required!"),
    body("traningDetails.*.traningStartDate")
      .trim()
      .notEmpty()
      .withMessage("Training start date is required!")
      .toDate(),
    body("traningDetails.*.traningEndDate")
      .trim()
      .notEmpty()
      .withMessage("Traning end date is required!")
      .toDate(),

    // Section 8: Digital Presence

    body("digitalWebsite").optional().trim(),
    body("digitalBlog").optional().trim(),
    body("digitalLinkedIn").optional().trim(),
    body("digitalResearchGate").optional().trim(),
    body("digitalOrcid").optional().trim(),
    body("digitalSocialPlatform").optional().isArray(),
    body("digitalSocialHandle").optional().isArray(),
    body("digitalSocialURL").optional().isArray(),

    // Section 9 :
    body("consent_infoTrueAndCorrect")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "Please confirm that the information provided is true and correct",
          );
        return true;
      }),

    body("consent_authorizeDataUse")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "Please confirm that the information provided is true and correct",
          );
        return true;
      }),

    body("consent_authorizeDataUse")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "You must authorize the use of your data for processing this application",
          );
        return true;
      }),

    body("consent_agreeToNotifications")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "You must agree to receive updates and notifications",
          );
        return true;
      }),
  ];
};

const nonMedicalProfessionalRegistration = () =>{
  return [
    body("fullname").trim().notEmpty().withMessage("Fullname is required!"),
    body("dateOfBirth")
      .trim()
      .notEmpty()
      .withMessage("Date of birth is required!"),
    body("gender").trim().notEmpty().withMessage("Please select gender"),
    body("personalNationality")
      .trim()
      .notEmpty()
      .withMessage("Nationality is required!"),

    // Section 2: Contact Details

    body("permanentAddress.houseNo")
      .trim()
      .notEmpty()
      .withMessage("House number is required!"),
    body("permanentAddress.street")
      .trim()
      .notEmpty()
      .withMessage("Street name is required!"),
    body("permanentAddress.city")
      .trim()
      .notEmpty()
      .withMessage("City name is required!"),
    body("permanentAddress.state")
      .trim()
      .notEmpty()
      .withMessage("State name is required!"),
    body("permanentAddress.pinCode")
      .trim()
      .notEmpty()
      .withMessage("Pincode  is required!")
      .matches(/^\d{6}$/)
      .withMessage("Pin code must be a 6-digit number!"),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be a 10-digit number!"),
    body("altPhoneNumber").optional().trim(),
    body("emailPrimary")
      .trim()
      .notEmpty()
      .withMessage("Email is required!")
      .isEmail()
      .withMessage("Email is invaild"),
    body("emailAlternate").optional().trim(),

    // Section 3: Academic & Professional Qualifications

    body("academicQualifications.ug.qualification")
      .trim()
      .notEmpty()
      .withMessage("UG degree is required!"),
    body("academicQualifications.ug.college")
      .trim()
      .notEmpty()
      .withMessage("College name is required!"),
    body("academicQualifications.ug.yearOfPassing")
      .trim()
      .notEmpty()
      .withMessage("Passing year is required!")
      .isInt({ min: 1900, max: 2100 })
      .withMessage(
        "Year of passing must be a valid number between 1900 and 2100",
      ),

    body("academicQualifications.pg.qualification")
      .trim()
      .notEmpty()
      .withMessage("PG degree is required!"),
    body("academicQualifications.pg.specialization")
      .trim()
      .notEmpty()
      .withMessage("PG specialization is required!"),
    body("academicQualifications.pg.college")
      .trim()
      .notEmpty()
      .withMessage("College name is required!"),
    body("academicQualifications.pg.yearOfPassing")
      .trim()
      .notEmpty()
      .withMessage("Passing year is required!")
      .isInt({ min: 1900, max: 2100 })
      .withMessage(
        "Year of passing must be a valid number between 1900 and 2100",
      ),

    body("academics_phdOrResearchDegrees").optional().trim(),
    body("academics_additionalCertifications").optional().trim(),

    // Section 7 : Training & Capacity Building
    body("traningDetails")
      .isArray({ min: 1 })
      .withMessage("At least one traning details entry is required!"),
    body("traningDetails.*.traningName")
      .trim()
      .notEmpty()
      .withMessage("Traning name is required!"),
    body("traningDetails.*.traningOrganizer")
      .trim()
      .notEmpty()
      .withMessage("Traning organizer name is required!"),
    body("traningDetails.*.traningRole").notEmpty()
      .withMessage("At least one training role is required!"),
    body("traningDetails.*.traningStartDate")
      .trim()
      .notEmpty()
      .withMessage("Training start date is required!")
      .toDate(),
    body("traningDetails.*.traningEndDate")
      .trim()
      .notEmpty()
      .withMessage("Traning end date is required!")
      .toDate(),

    // Section 8: Digital Presence

    body("digitalWebsite").optional().trim(),
    body("digitalBlog").optional().trim(),
    body("digitalLinkedIn").optional().trim(),
    body("digitalResearchGate").optional().trim(),
    body("digitalOrcid").optional().trim(),
    body("digitalSocialPlatform").optional().isArray(),
    body("digitalSocialHandle").optional().isArray(),
    body("digitalSocialURL").optional().isArray(),

    // Section 9 :
    body("consent_infoTrueAndCorrect")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "Please confirm that the information provided is true and correct",
          );
        return true;
      }),

    body("consent_authorizeDataUse")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "Please confirm that the information provided is true and correct",
          );
        return true;
      }),

    body("consent_authorizeDataUse")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "You must authorize the use of your data for processing this application",
          );
        return true;
      }),

    body("consent_agreeToNotifications")
      .toBoolean()
      .custom((value) => {
        if (!value)
          throw new Error(
            "You must agree to receive updates and notifications",
          );
        return true;
      }),
  ];
}

export { userRegisterValidator, userLoginValidator, medicalProfessionalRegistration, nonMedicalProfessionalRegistration };
