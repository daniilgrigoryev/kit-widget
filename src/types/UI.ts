import { TranslateResult } from 'vue-i18n';

export interface InputValidator {
  error: TranslateResult;
  validate: (input: string) => boolean;
}
