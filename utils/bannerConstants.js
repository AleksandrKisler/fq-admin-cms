export const BANNER_TYPES = Object.freeze(['INFORMATION', 'COLLECTION', 'PRODUCT', 'HERO']);

export const POSITION_VALUES = Object.freeze(['DEFAULT', 'LEFT', 'RIGHT']);

export const typeLabel = Object.freeze({
    INFORMATION: 'Информация',
    COLLECTION : 'Подборка',
    PRODUCT    : 'Продукт',
    HERO       : 'Главный баннер',
});

export const positionLabel = Object.freeze({
    DEFAULT: 'По центру',
    LEFT   : 'Слева',
    RIGHT  : 'Справа',
});

// Для типов, где боковое позиционирование запрещено
export function isSidePositionLocked(type) {
    return type === 'COLLECTION' || type === 'PRODUCT';
}

// Удобная функция принудительной коррекции позиции
export function ensureValidPosition(type, position) {
    return isSidePositionLocked(type) ? 'DEFAULT' : (position || 'DEFAULT');
}
