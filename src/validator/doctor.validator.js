// src/validators/doctor.dto.js
import { z } from "zod";

export const doctorCreateDto = z
  .object({

    fullname: z.string().min(2, "Full name is required"),
    dateOfBirth: toDate(), 
    maritalStatus: z.enum(["Single", "Married"]).optional(),
    personalNationality: z.string().optional().default(""),
    personalPhoto: z.string().url("personalPhoto must be a URL"),

    permanentAddress : z.object({
        houseNo : z.string().min(1, "House number is required"),
        street: z.string().min(5, "Street name is required"),
        city: z.string().min(3, "City name is required"),
        state: z.string().min(3, "State name is required"),
        pinCode: z.string().min(6, "Pin code is required"),
    }),

    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
    altPhoneNumber: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),

    emailPrimary: z.string().email(),
    emailAlternate: z.string().email().optional().or(z.literal("")),

    /* ========= Section 3: Academic & Professional Qualifications ========= */
    academicQualifications: z
      .object({
        ug: z
          .object({
            qualification: z.enum(["BAMS", "BHMS", "BUMS", "BSMS", "BNYS"]),
            college: z.string().optional().default(""),
            yearOfPassing: toInt().refine(
              (y) => y >= 1900 && y <= currentYear,
              "UG yearOfPassing is out of range"
            ),
          })
          .optional(),
        pg: z
          .object({
            qualification: z.string().optional(),
            specialization: z.string().optional().default(""),
            college: z.string().optional().default(""),
            yearOfPassing: toInt(true).refine(
              (y) => y === undefined || (y >= 1900 && y <= currentYear),
              "PG yearOfPassing is out of range"
            ),
          })
          .optional(),
      })
      .optional()
      .default({}),

    academics_phdOrResearchDegrees: asArray(z.string()),
    academics_additionalCertifications: asArray(z.string()),

    /* ========= Section 4: Regulatory Details ========= */
    regulatoryDetails: z.object({
      regulatoryAyushRegNo: z.string().min(3),
      councilName: z.string().min(2),
      registrationDate: toDate(),           
      regulatoryValidityUntil: toDate(true) 
    }),

    /* ========= Section 5: Practice & Work Experience ========= */
    practice: z.object({
      currentDesignation: z
        .enum(["Doctor", "Consultant", "Professor", "Researcher", "Other"])
        .optional(),
      currentInstitution: z.string().min(1, "currentInstitution is required"),
      workAddress: z.string().min(1, "workAddress is required"),
      yearsExperience: toInt().refine((n) => n >= 0 && n <= 80, "yearsExperience out of range"),
      specializationAreas: z
        .array(z.enum(["Ayurveda", "Yoga", "Unani", "Siddha", "Homeopathy", "Naturopathy"]))
        .optional()
        .default([]),
    }),

    previousExperience : z.object({
        designation : z.string().min(4, "Designation is required"),
        organization: z.string().min(4, "organization is required"),
        startDate: z.string(toDate()),
        endDate: z.string(toDate()),
        description: z.string().min(4, "Designation is required"),
        
    }),
    prevDesignation: asArray(z.string().min(1)),
    prevOrganization: asArray(z.string().min(1)),
    prevStartDate: asArray(toDate()),
    prevEndDate: asArray(toDate()),
    prevDescription: asArray(z.string().min(1)),

    /* ========= Section 6: Research & Publications ========= */
    researchInterests: z
      .array(
        z.enum([
          "Ayurveda",
          "Yoga Therapy",
          "Herbal Medicines",
          "Integrative Medicine",
          "Clinical Trials",
          "Public Health",
          "Pharma Research",
          "Others",
        ])
      )
      .optional()
      .default([]),

      publicationDetails : z.object({
        journal: z.string(),
        title: z.string(),
        year: z.string(toDate),
        link: z.string(),
      }),

    /* ========= Section 7: Training & Capacity Building ========= */
    trainingName: asArray(z.string().min(1)),
    trainingOrganizer: asArray(z.string().min(1)),
    trainingRole: asArray(z.enum(["Participant", "Speaker", "Trainer"])),
    trainingStartDate: asArray(toDate()),
    trainingEndDate: asArray(toDate()),

    /* ========= Section 8: Digital Presence ========= */
    digitalWebsite: z.string().url().optional().or(z.literal("")),
    digitalBlog: z.string().url().optional().or(z.literal("")),
    digitalLinkedIn: z.string().url().optional().or(z.literal("")),
    digitalResearchGate: z.string().url().optional().or(z.literal("")),
    digitalOrcid: z.string().url().optional().or(z.literal("")),
    digitalSocialPlatform: asArray(z.string()).optional().default([]),
    digitalSocialHandle: asArray(z.string()).optional().default([]),
    digitalSocialURL: asArray(z.string().url()).optional().default([]),

    /* ========= Section 9: Consent & Declarations ========= */
    consent_infoTrueAndCorrect: toBool,
    consent_authorizeDataUse: toBool,
    consent_agreeToNotifications: toBool,
    consent_timestamp: toDate(true),

    /* ========= Section 10: Final Submission ========= */
    submission_captchaPassedAt: toDate(true),
    submission_status: z
      .enum(["Draft", "Submitted", "Under Review", "Approved", "Rejected"])
      .optional()
      .default("Draft"),
    submission_submittedAt: toDate(true),
    submission_reviewedAt: toDate(true),
    submission_reviewerNotes: z.string().optional().or(z.literal("")),
  })
  /* ---- Cross-field checks (arrays aligned; date ranges sane) ---- */
  .superRefine((data, ctx) => {
    // 1) Align prev* arrays
    const prevLens = [
      data.prevDesignation.length,
      data.prevOrganization.length,
      data.prevStartDate.length,
      data.prevEndDate.length,
      data.prevDescription.length,
    ];
    const prevAllEqual = prevLens.every((n) => n === prevLens[0]);
    if (!prevAllEqual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Previous experience arrays must be the same length (designation, organization, startDate, endDate, description).",
        path: ["previousExperience"],
      });
    }

    // 2) Validate each prev date pair
    const minPrev = Math.min(
      data.prevStartDate.length,
      data.prevEndDate.length
    );
    for (let i = 0; i < minPrev; i++) {
      if (data.prevEndDate[i] < data.prevStartDate[i]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `prevEndDate[${i}] must be after prevStartDate[${i}]`,
          path: ["prevEndDate", i],
        });
      }
    }

    // 3) Align research publication arrays
    const pubLens = [
      data.researchPubJournal.length,
      data.researchPubTitle.length,
      data.researchPubYear.length,
      data.researchPubLink.length,
    ];
    const pubAllEqual = pubLens.every((n) => n === pubLens[0]);
    if (!pubAllEqual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Publication arrays must be the same length (journal, title, year, link).",
        path: ["publications"],
      });
    }

    // 4) Align training arrays + date order
    const trLens = [
      data.trainingName.length,
      data.trainingOrganizer.length,
      data.trainingRole.length,
      data.trainingStartDate.length,
      data.trainingEndDate.length,
    ];
    const trAllEqual = trLens.every((n) => n === trLens[0]);
    if (!trAllEqual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Training arrays must be the same length (name, organizer, role, startDate, endDate).",
        path: ["trainings"],
      });
    }
    const minTr = Math.min(
      data.trainingStartDate.length,
      data.trainingEndDate.length
    );
    for (let i = 0; i < minTr; i++) {
      if (data.trainingEndDate[i] < data.trainingStartDate[i]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `trainingEndDate[${i}] must be after trainingStartDate[${i}]`,
          path: ["trainingEndDate", i],
        });
      }
    }
  });



export function validateDoctorCreate(raw) {
  // throws on invalid; returns typed & coerced object on success
  return doctorCreateDto.parse(raw);
}

export function validateDoctorCreateSafe(raw) {
  // returns { success, data?, error? }
  return doctorCreateDto.safeParse(raw);
}