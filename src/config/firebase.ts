import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from './env';

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
