import mongoose, { Schema } from "mongoose";

const AyushRegistrationSchemaForDoctor = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullname: {
      type: String,
      required: true,
    },
    dateOfBirth: { type: Date, required: true },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married"],
    },
    personalNationality: { type: String, trim: true },
    personalPhoto: {
      type: String,
      required: true,
    },

    permanentAddress: {
      houseNo: { type: String, trim: true },
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pinCode: { type: String, match: /^\d{6}$/ },
    },

    phoneNumber: { type: String, required: true, match: /^\+?\d{10,15}$/ },
    altPhoneNumber: { type: String, match: /^\+?\d{10,15}$/ },
    emailPrimary: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      unique: true,
    },
    emailAlternate: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    /* ========= Section 3: Academic & Professional Qualifications ========= */
    academicQualifications: {
      ug: {
        qualification: {
          type: String,
          enum: ["BAMS", "BHMS", "BUMS", "BSMS", "BNYS"],
        },
        college: { type: String },
        yearOfPassing: { type: Number, min: 1900, max: 2100 },
      },
      pg: {
        qualification: { type: String },
        specialization: { type: String },
        college: { type: String },
        yearOfPassing: { type: Number, min: 1900, max: 2100 },
      },
    },

    academics_phdOrResearchDegrees: [{ type: String }],
    academics_additionalCertifications: [{ type: String }],

    /* ========= Section 4: Regulatory Details ========= */

    regulatoryDetails: {
      regulatoryAyushRegNo: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      councilName: { type: String, required: true },
      registrationDate: { type: Date, required: true },
      regulatoryValidityUntil: { type: Date },
    },

    /* ========= Section 5: Practice & Work Experience ========= */

    practiceDetails: {
      currentDesignation: {
        type: String,
        enum: ["Doctor", "Consultant", "Professor", "Researcher", "Other"],
      },
      currentInstitution: { type: String, required: true },
      workAddress: { type: String, required: true },
      yearsExperience: { type: Number, min: 0, max: 80 },
      specializationAreas: {
        type: [
          {
            type: String,
            enum: [
              "Ayurveda",
              "Yoga",
              "Unani",
              "Siddha",
              "Homeopathy",
              "Naturopathy",
            ],
          },
        ],
        default: [],
      },
    },

    // Previous work: simple flat arrays aligned by index (no sub-schema)
    previousExperience: [
      {
        designation: { type: String, required: true },
        organization: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        description: { type: String, required: true },
      },
    ],

    /* ========= Section 6: Research & Publications ========= */
    researchInterests: {
      type: [
        {
          type: String,
          enum: [
            "Ayurveda",
            "Yoga Therapy",
            "Herbal Medicines",
            "Integrative Medicine",
            "Clinical Trials",
            "Public Health",
            "Pharma Research",
            "Others",
          ],
        },
      ],
      default: [],
    },
    publicationDetails: [
      {
        journal: { 
          type: String,
        },
        title: {
          type: String,
        },
        year: { type: Number, min: 1900, max: 2100 },
        link: { type: String, required: true },
      },
    ],

    /* ========= Section 7: Training & Capacity Building ========= */

    traningDetails: [
      {
        trainingName: { type: String, required: true }, 
        trainingOrganizer: { type: String, required: true },
        trainingRole: [
          { type: String, enum: ["Participant", "Speaker", "Trainer"] },
        ],
        trainingStartDate: { type: Date, required: true },
        trainingEndDate: { type: Date, required: true },
      },
    ],

    

    /* ========= Section 8: Digital Presence ========= */
    digitalWebsite: String,
    digitalBlog: String,
    digitalLinkedIn: String,
    digitalResearchGate: String,
    digitalOrcid: String,
    digitalSocialPlatform: [String],
    digitalSocialHandle: [String],
    digitalSocialURL: [String],

    /* ========= Section 9: Consent & Declarations ========= */
    consent_infoTrueAndCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
    consent_authorizeDataUse: { type: Boolean, required: true, default: false },
    consent_agreeToNotifications: {
      type: Boolean,
      required: true,
      default: false,
    },
    consent_timestamp: { type: Date },

    /* ========= Section 10: Final Submission ========= */
    submission_captchaPassedAt: { type: Date }, // optional audit trail
    submission_status: {
      type: String,
      enum: ["Draft", "Submitted", "Under Review", "Approved", "Rejected"],
      default: "Draft",
    },
    submission_submittedAt: { type: Date },
    submission_reviewedAt: { type: Date },
    submission_reviewerNotes: { type: String, trim: true },
  },
  { timestamps: true },
);

/* ======= Helpful indexes ======= */
AyushRegistrationSchemaForDoctor.index({ fullname: "text" });
AyushRegistrationSchemaForDoctor.index(
  { "regulatoryDetails.regulatoryAyushRegNo": 1 },
  { unique: true },
);
AyushRegistrationSchemaForDoctor.index({ emailPrimary: 1 }, { unique: true });

/* ======= Auto-timestamps for consent/submission (optional) ======= */
AyushRegistrationSchemaForDoctor.pre("save", function (next) {
  const c1 = this.consent_infoTrueAndCorrect === true;
  const c2 = this.consent_authorizeDataUse === true;
  const c3 = this.consent_agreeToNotifications === true;

  if (c1 && c2 && c3 && !this.consent_timestamp) {
    this.consent_timestamp = new Date();
  }

  if (this.isModified("submission_status")) {
    if (
      this.submission_status === "Submitted" &&
      !this.submission_submittedAt
    ) {
      this.submission_submittedAt = new Date();
    }
  }
  next();
});

export const AyushRegisteredDoctor = mongoose.model(
  "AyushRegisteredDoctor",
  AyushRegistrationSchemaForDoctor,
);
