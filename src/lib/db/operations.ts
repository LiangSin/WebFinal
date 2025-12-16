import dbConnect from './connect';
import { User, Exam } from './models';

// Generic database operations

export async function ensureDbConnection() {
  await dbConnect();
}

// User operations

export async function getUserByEmail(email: string) {
  await ensureDbConnection();
  const user = await User.findOne({ email });
  return user ? user.toObject() : null;
}

export async function createUser(userData: { name?: string; email: string; image?: string }) {
  await ensureDbConnection();
  const newUser = new User(userData);
  await newUser.save();
  return newUser.toObject();
}

// Exam operations

export async function getExams(filter: Record<string, any> = {}) {
  await ensureDbConnection();
  // Use .lean() for better performance if just reading
  const exams = await Exam.find(filter).populate('uploadedBy', 'name email').lean();
  return exams;
}

export async function createExam(examData: {
  title: string;
  courseName: string;
  instructor?: string;
  semester?: string;
  examType?: string;
  hasAnswers?: string;
  description?: string;
  files?: Array<{ type: string; url: string; name: string; fileId?: string }>;
  uploadedBy: string; // User ID
}) {
  await ensureDbConnection();
  const newExam = new Exam(examData);
  await newExam.save();

  // Update user's uploadedExams
  await User.findByIdAndUpdate(examData.uploadedBy, {
    $push: { uploadedExams: newExam._id }
  });

  return newExam.toObject();
}

// Trending operations (example)
export async function getTrendingExams(limit = 5) {
  await ensureDbConnection();
  const exams = await Exam.find({}).sort({ downloads: -1 }).limit(limit).lean();
  return exams;
}
