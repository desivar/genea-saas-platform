import { Schema, model, Document } from 'mongoose';

export interface ITree extends Document {
  title: string;
  description?: string;
  ownerId: Schema.Types.ObjectId;
  ownerName?: string;
  isPublic: boolean;
  memberCount: number;
  generationCount: number;
  coverHeritage?: string;
  nodePositions?: {
    id: string;
    position: { x: number; y: number };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TreeSchema = new Schema<ITree>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String },
  isPublic: { type: Boolean, default: false },
  memberCount: { type: Number, default: 0 },
  generationCount: { type: Number, default: 0 },
  coverHeritage: { type: String },
  nodePositions: [{
    id: { type: String },
    position: {
      x: { type: Number },
      y: { type: Number }
    }
  }]
}, {
  timestamps: true
});

TreeSchema.index({ ownerId: 1 });
TreeSchema.index({ isPublic: 1 });

export const Tree = model<ITree>('Tree', TreeSchema);