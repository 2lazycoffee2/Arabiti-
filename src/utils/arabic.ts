export const transliterateArabic = (text: string): string => {
  if (!text) return '';
  const transMap: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'ḥ', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ع': '‘',
    'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 't',
    'َ': 'a', 'ِ': 'i', 'ُ': 'u',
    'ً': 'an', 'ٍ': 'in', 'ٌ': 'un',
    'ْ': '', 'ّ': '', 'ـ': ''
  };

  let transliterated = '';
  // Basic transliteration
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === 'ّ') {
      if (i > 0) {
        const prevChar = text[i - 1];
        if (transMap[prevChar]) {
           transliterated += transMap[prevChar];
        }
      }
      continue;
    }

    if (transMap[char]) {
      transliterated += transMap[char];
    } else {
      transliterated += char;
    }
  }

  // Helper replacements to tidy up
  transliterated = transliterated.replace(/aa/g, 'ā');
  transliterated = transliterated.replace(/uu/g, 'ū');
  transliterated = transliterated.replace(/ii/g, 'ī');
  transliterated = transliterated.replace(/\s+/g, ' ').trim();
  
  return transliterated;
};
