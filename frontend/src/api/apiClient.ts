import axios from 'axios';
import type { ComponentListResponse } from '../types/component';
import type { LearningPathPayload } from '../types/learningPath';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchComponents = async (): Promise<ComponentListResponse> => {
  const { data } = await api.get<ComponentListResponse>('/components');
  return data;
};

export const saveLearningPath = async (payload: LearningPathPayload): Promise<{ id: string; name: string; status: string; message: string }> => {
  const { data } = await api.post('/learning-paths', payload);
  return data;
};

export const loadLearningPath = async (id: string): Promise<LearningPathPayload> => {
  const { data } = await api.get<LearningPathPayload>(`/learning-paths/${id}`);
  return data;
};

export const listLearningPaths = async (): Promise<{ id: string; name: string; status: string }[]> => {
  const { data } = await api.get('/learning-paths');
  return data;
};
