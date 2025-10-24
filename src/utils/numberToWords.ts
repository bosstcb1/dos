const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';

  let result = '';

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundred > 0) {
    if (hundred === 1) {
      result = 'cent';
    } else {
      result = units[hundred] + ' cent';
    }
    if (remainder === 0) {
      result += 's';
    }
  }

  if (remainder > 0) {
    if (result) result += ' ';

    if (remainder < 10) {
      result += units[remainder];
    } else if (remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const unit = remainder % 10;

      if (ten === 7 || ten === 9) {
        result += tens[ten - 1];
        if (ten === 7) {
          result += ' ' + teens[unit];
        } else {
          result += '-' + teens[unit];
        }
      } else if (ten === 8) {
        result += tens[ten];
        if (unit === 0) {
          result += 's';
        } else {
          result += '-' + units[unit];
        }
      } else {
        result += tens[ten];
        if (unit === 1 && ten !== 8) {
          result += ' et ' + units[unit];
        } else if (unit > 0) {
          result += '-' + units[unit];
        }
      }
    }
  }

  return result;
}

export function numberToWordsFrench(num: number): string {
  if (num === 0) return 'zéro';

  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  let result = '';

  if (wholePart === 0) {
    result = 'zéro';
  } else {
    const billion = Math.floor(wholePart / 1000000000);
    const million = Math.floor((wholePart % 1000000000) / 1000000);
    const thousand = Math.floor((wholePart % 1000000) / 1000);
    const remainder = wholePart % 1000;

    if (billion > 0) {
      result += convertLessThanThousand(billion) + ' milliard';
      if (billion > 1) result += 's';
    }

    if (million > 0) {
      if (result) result += ' ';
      result += convertLessThanThousand(million) + ' million';
      if (million > 1) result += 's';
    }

    if (thousand > 0) {
      if (result) result += ' ';
      if (thousand === 1) {
        result += 'mille';
      } else {
        result += convertLessThanThousand(thousand) + ' mille';
      }
    }

    if (remainder > 0) {
      if (result) result += ' ';
      result += convertLessThanThousand(remainder);
    }
  }

  if (decimalPart > 0) {
    result += ' francs CFA et ' + convertLessThanThousand(decimalPart) + ' centimes';
  } else {
    result += ' francs CFA';
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}