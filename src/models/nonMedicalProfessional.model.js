import mongoose, {Schema} from "mongoose";

const NonMedicalProfessionalSchema = new Schema ({
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
    
        gender : {
          type : String,
          required : true
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

        /* ========= Section 7: Training & Capacity Building ========= */

    traningDetails: [
      {
        traningName: { type: String, required: true },
        traningOrganizer: { type: String, required: true },
        traningRole: [
          { type: String, enum: ["Participant", "Speaker", "Trainer"] },
        ],
        traningStartDate: { type: Date, required: true },
        traningEndDate: { type: Date, required: true },
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
    consent_timestamp: { type: Date, default: Date.now() },

    /* ========= Section 10: Final Submission ========= */
    submission_captchaPassedAt: { type: Date }, // optional audit trail
  
  
}, { timestamps: true })


NonMedicalProfessionalSchema.pre("save", function (next){
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
})

export const NonMedicalProfessional = mongoose.model(
  "NonMedicalProfessional",
  NonMedicalProfessionalSchema,
);
