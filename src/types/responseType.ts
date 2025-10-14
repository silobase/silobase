export interface GenericResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  code: 200 | 400;
}