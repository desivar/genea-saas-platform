import { Schema, model, Document } from 'mongoose';

// 1. Define an Interface representing a document in MongoDB for TypeScript safety
export interface ICitation {
  sourceTitle: string;    // e.g., "1930 US Federal Census"
  sourceUrl?: string;     // URL if linked to an image or archive site
  footnoteText: string;   // Layered/professional bibliographic citation
}

export interface IFamilyMember extends Document {
  firstName: string;
  lastName: string;
  gender?: 'Male' | 'Female' | 'Unknown';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  
  // Tree Architecture Links
  fatherId?: Schema.Types.ObjectId;
  motherId?: Schema.Types.ObjectId;
  spouseId?: Schema.Types.ObjectId;
  
  // Archival & Content fields
  notes?: string;
  extractedOcrText?: string; // Where the Cloudinary OCR text goes later
  citations: ICitation[];
  createdAt: Date;
}

// 2. Create the Mongoose Schema matching the interface
const FamilyMemberSchema = new Schema<IFamilyMember>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
  birthDate: { type: String },
  birthPlace: { type: String, trim: true },
  deathDate: { type: String },
  deathPlace: { type: String, trim: true },
  
  // Self-referencing IDs to dynamically connect relatives for your charts
  fatherId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
  motherId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
  spouseId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
  
  notes: { type: String },
  extractedOcrText: { type: String },
  
  // Embedded sub-document array for professional source tracking
  citations: [{
    sourceTitle: { type: String, required: true },
    sourceUrl: { type: String },
    footnoteText: { type: String, required: true }
  }]
}, {
  timestamps: true // Automatically manages createdAt and updatedAt fields
});

// Index common search fields for lightning-fast alphabetical searching later
FamilyMemberSchema.index({ lastName: 1, firstName: 1 });

export const FamilyMember = model<IFamilyMember>('FamilyMember', FamilyMemberSchema);