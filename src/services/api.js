import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ── Request Interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Note: No response interceptor for global 401 handling.
// Errors are returned normally to be handled explicitly by the caller.

// ── API Endpoints ─────────────────────────────────────────────────────────────

// Grades
export const getGrades = () => api.get('/grades');
export const getGradeById = (id) => api.get(`/grades/${id}`);
export const getGradeWithCourses = (id) => api.get(`/grades/${id}/courses`);
export const createGrade = (data) => api.post('/grades', data);
export const updateGrade = (id, data) => api.put(`/grades/${id}`, data);
export const deleteGrade = (id) => api.delete(`/grades/${id}`);

// Courses
export const getCourses = (gradeId = null) =>
  api.get('/courses', { params: gradeId ? { gradeId } : {} });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Lessons
export const getLessonsByCourseId = (courseId) => api.get(`/lessons/course/${courseId}`);
export const getLessonById = (id) => api.get(`/lessons/${id}`);
export const createLesson = (data) => api.post('/lessons', data);
export const updateLesson = (id, data) => api.put(`/lessons/${id}`, data);
export const deleteLesson = (id) => api.delete(`/lessons/${id}`);

// Exams
export const getExams = (courseId = null) =>
  api.get('/exams', { params: courseId ? { courseId } : {} });
export const getExamById = (id) => api.get(`/exams/${id}`);
export const createExam = (data) => api.post('/exams', data);
export const updateExam = (id, data) => api.put(`/exams/${id}`, data);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

// Questions
export const getQuestionsByExamId = (examId) => api.get(`/questions/exam/${examId}`);
export const getQuestionById = (id) => api.get(`/questions/${id}`);
export const createQuestion = (data) => api.post('/questions', data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);

// Submissions
export const submitExam = (examId, data) => api.post(`/submissions/${examId}/submit`, data);
export const getSubmissionsByExamId = (examId) => api.get(`/submissions/${examId}`);

export default api;
