import { emailRe } from '@/libs/consts/re';

export const isValidEmail = (str: string): boolean => emailRe.test(str);
