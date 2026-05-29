import { Schema, model, Document } from 'mongoose';

// 1. TypeScript Interfaces
export interface ICitation {
  sourceTitle: string;
  sourceUrl?: string;
  footnoteText: string;
  author?: string;
  publisher?: string;
  publicationYear?: number;
  pageNumber?: string;
  repositoryName?: string;
  accessDate?: string;
  shortCite?: string;
  branch?: string;
}

export interface IFamilyMember extends Document {
  firstName: string;
  lastName: string;
  gender?: 'Male' | 'Female' | 'Unknown';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  fatherId?: Schema.Types.ObjectId;
  motherId?: Schema.Types.ObjectId;
  spouseIds?: Schema.Types.ObjectId[];
  childrenIds?: Schema.Types.ObjectId[];
  treeId?: Schema.Types.ObjectId;
  generation?: number;
  profilePhoto?: string;
  photos?: string[];
  notes: { type: String },
  extractedOcrText: { type: String },
  branch: { type: String, trim: true },
  citations: ICitation[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Citation Schema — declared FIRST before FamilyMemberSchema uses it
const ICitationSchema = new Schema<ICitation>({
  sourceTitle: { type: String, required: true },
  author: { type: String },
  publisher: { type: String },
  publicationYear: { type: Number },
  pageNumber: { type: String },
  repositoryName: { type: String },
  accessDate: { type: String },
  sourceUrl: { type: String },
  footnoteText: { type: String, required: true },
  shortCite: { type: String }
});

// 3. Family Member Schema
const FamilyMemberSchema = new Schema<IFamilyMember>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
  birthDate: { type: String },
  birthPlace: { type: String, trim: true },
  deathDate: { type: String },
  deathPlace: { type: String, trim: true },
  fatherId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
  motherId: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
  spouseIds: [{ type: Schema.Types.ObjectId, ref: 'FamilyMember' }],
  childrenIds: [{ type: Schema.Types.ObjectId, ref: 'FamilyMember' }],
  treeId: { type: Schema.Types.ObjectId, ref: 'FamilyTree' },
  generation: { type: Number },
  profilePhoto: { type: String },
  photos: [{ type: String }],
  notes: { type: String },
  extractedOcrText: { type: String },
  citations: [ICitationSchema]
}, {
  timestamps: true
});

FamilyMemberSchema.index({ lastName: 1, firstName: 1 });
FamilyMemberSchema.index({ treeId: 1 });
FamilyMemberSchema.index({ generation: 1 });

export const FamilyMember = model<IFamilyMember>('FamilyMember', FamilyMemberSchema);