import { DateTime } from 'luxon';
import i18n from '@/i18n';

export interface HumanDateTime {
  isValid: boolean;
  date: string;
  time: string;
}

// Воспринимает SQL или ISO вариант. Для рендера из new Date() или аналогичного - не предназначено
export function parseAsLuxon(dateAsString: string, zone?: string): DateTime {
  // Таймзону не передали
  if (!zone) {
    zone = Intl?.DateTimeFormat()?.resolvedOptions().timeZone || 'UTC';
  }
  const method = dateAsString.includes('T') ? 'fromISO' : 'fromSQL';
  return DateTime[method](dateAsString, { locale: i18n.global.locale, zone: 'UTC' }).setZone(zone as string);
}

export function renderHumanDateTime(dateAsString: string, anotherTimezone?: string): HumanDateTime {
  try {
    const parsedDate = parseAsLuxon(dateAsString, anotherTimezone);
    if (parsedDate.isValid) {
      const date = parsedDate.toFormat('dd MMM yyyy');
      const time = parsedDate.toFormat('T');
      // https://github.com/moment/luxon/issues/669 -- тут хоть и другие методы, но поведение схоже
      // Есть баг, что дата "2020-02-28 00:56:10" при часовом поясе аккаунта 'UTC' выдает 24:56
      // хотя при проверке в runkit функция renderHumanDateTime выдает корректный результат
      // поэтому костыль
      // Если прекратится такое поведение, то костыль можно дропнуть
      const crunchTime = time.indexOf('24:') === 0 ? `00:${time.split(':')[1]}` : time;
      return { date, time: crunchTime, isValid: true };
    }
  } catch (err) {
    console.warn('renderHumanDateTime', err);
  }
  // Все плохо. возвращаем как есть
  return { date: dateAsString, time: '', isValid: false };
}

export function renderHumanFullDateTime(dateAsString: string): { day: string } & HumanDateTime {
  try {
    const parsedDate = parseAsLuxon(dateAsString);
    if (parsedDate.isValid) {
      const date = parsedDate.toFormat('dd MMMM yyyy');
      const time = parsedDate.toFormat('T');
      const day = parsedDate.toFormat('EEEE');
      return { day: `${day[0].toUpperCase()}${day.slice(1)}`, date, time, isValid: true };
    }
  } catch (err) {
    console.warn('renderHumanFullDateTime', err);
  }
  // Все плохо. возвращаем как есть
  return { date: dateAsString, time: '', day: '', isValid: false };
}

export function asFunctionLogDate(dateAsString: string): string {
  const parsedDate = parseAsLuxon(dateAsString);
  if (parsedDate.isValid) {
    const date = parsedDate.toFormat('yyyy-MM-dd');
    const time = parsedDate.toFormat('HH:mm:ss');
    // https://github.com/moment/luxon/issues/669 -- тут хоть и другие методы, но поведение схоже
    // Есть баг, что дата "2020-02-28 00:56:10" при часовом поясе аккаунта 'UTC' выдает 24:56
    // хотя при проверке в runkit функция renderHumanDateTime выдает корректный результат
    // поэтому костыль
    // Если прекратится такое поведение, то костыль можно дропнуть
    const crunchTime = time.indexOf('24:') === 0 ? `00:${time.split(':')[1]}` : time;
    return date + ' ' + crunchTime;
  }
  return dateAsString;
}

export function convertFromAccountTimeToUTC(str: string): string {
  try {
    return DateTime.fromSQL(str, { zone: 'UTC' }).toUTC().toFormat('yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    console.warn('convertFromAccountTimeToUTC', e);
  }
  return str;
}
