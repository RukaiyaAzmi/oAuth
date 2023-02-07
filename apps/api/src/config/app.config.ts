import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3030,
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '',
  faceEnroll: process.env.FACE_ENROLL || 'http://10.11.200.109:5060/faceapi/customer/enroll',
  faceVerification: process.env.FACE_VERIFICATION || 'http://10.11.200.109:5060/faceapi/customer/identify',
  faceCount: process.env.FACE_COUNT || 'http://10.11.200.109:5060/faceapi/count',
  jwtSecret: process.env.JWT_SECRET || '12345678@mithun@',
  empUpdate: process.env.EMP_UPDATE || 'http://10.11.200.109:5060/faceapi/customer/',
  faceDelete: process.env.FACE_DELETE || 'http://10.11.200.109:5060/faceapi/customer/',
  hrEnroll: process.env.HR_ENROLL || 'http://10.11.201.19:8088/eratest/erahrm/face/recg',
};
