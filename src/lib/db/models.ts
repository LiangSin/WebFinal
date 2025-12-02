import mongoose, { Schema, model, models } from 'mongoose';

// User Model
const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  uploadedExams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  savedExams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  folders: [{
    name: { type: String, required: true },
    description: { type: String },
    exams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }]
  }]
});

// Exam Model (Placeholder based on project plan)
const ExamSchema = new Schema({
  title: { type: String, required: true },
  courseName: { type: String, required: true },
  instructor: { type: String },
  semester: { type: String }, // e.g., "112-1"
  fileUrl: { type: String }, // URL to the uploaded file
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  downloads: { type: Number, default: 0 },
  lightning: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Prevent Mongoose OverwriteModelError and ensure Schema updates in dev
// This logic ensures that if we change the schema, the model is recompiled
// in development mode, preventing the "missing field" issue.
const User = models.User || model('User', UserSchema);
const Exam = models.Exam || model('Exam', ExamSchema);

export { User, Exam };
