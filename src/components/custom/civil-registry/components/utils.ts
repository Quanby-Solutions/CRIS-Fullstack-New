// src\components\custom\civil-registry\components\utils.ts
export const formatFullName = (first?: string, middle?: string, last?: string): string =>
    [first, middle, last].filter(Boolean).join(' ')

export const renderName = (name: any): string => {
    if (!name) return ''
    if (typeof name === 'string') return name
    if (typeof name === 'object') {
        const { first, middle, last } = name || {}
        return formatFullName(first, middle, last)
    }
    return ''
}

export const formatLocation = (loc: any): string => {
    if (!loc) return ''
    if (typeof loc === 'string') return loc
    const { houseNo, street, barangay, cityMunicipality, province, country, place, internationalAddress, residence } = loc
    const parts = []
    if (houseNo || street) parts.push([houseNo, street].filter(Boolean).join(' '))
    if (barangay) parts.push(barangay)
    if (cityMunicipality) parts.push(cityMunicipality)
    if (province) parts.push(province)
    if (country) parts.push(country)
    if (place) parts.push(place)
    if (internationalAddress) parts.push(internationalAddress)
    if (residence) parts.push(residence)
    return parts.join(', ')
}

/**
 * Parses a date value from various possible formats, handling various edge cases.
 * @param {any} value - The date value to parse
 * @returns {Date | string | undefined} A Date object, string, or undefined based on input
 */
export const parseJsonDateDeath = (value: any): Date | string | undefined => {
    // If value is an object with a nested date property, extract the date
    if (value && typeof value === 'object') {
        if ('dateOfDeath' in value) {
            value = value.dateOfDeath;
        } else if ('dateOfBirth' in value) {
            value = value.dateOfBirth;
        }
    }

    if (value === null || value === undefined) return undefined;

    // If it's already a Date object, return it
    if (value instanceof Date) {
        return value;
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
        // Trim the string to remove any leading/trailing whitespace
        const trimmedValue = value.trim();

        // Check for ISO date/timestamp format with time
        const isIsoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(trimmedValue);

        // Check for more verbose date formats like "January 24, 2025"
        const isVerboseDate = /^[A-Za-z]+ \d{1,2}, \d{4}$/.test(trimmedValue);

        // If it's an ISO datetime, convert to Date
        if (isIsoDateTime) {
            try {
                const date = new Date(trimmedValue);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            } catch {
                // If parsing fails, continue
            }
        }

        // If it's a verbose date format or doesn't look like a machine date, return as string
        if (isVerboseDate || !isIsoDateTime) {
            return trimmedValue;
        }
    }

    // For other types, try to create a date or convert to string
    try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch { }

    // Fallback to string conversion
    return String(value);
};

export const formatDate = (date: string | number | Date | null | undefined): string => {
    // Return empty string for null/undefined values
    if (date === null || date === undefined) return '';

    // For strings, check if it's a valid date first
    if (typeof date === 'string') {
        const parsedDate = new Date(date);

        // Check if parsing resulted in a valid date
        if (isNaN(parsedDate.getTime())) {
            // Not a valid date, return the original string
            return date;
        }

        // Valid date, format it
        return parsedDate.toLocaleDateString();
    }

    // For dates and numbers, convert and format
    return new Date(date).toLocaleDateString();
}

export const formatDateDeath = (date: string | number | Date | null | undefined): string => {
    // Return empty string for null/undefined values
    if (date === null || date === undefined) return '';

    // For strings, check if it's a valid date or contains obvious non-date text
    if (typeof date === 'string') {
        // Skip processing for obvious non-date strings
        if (/[a-zA-Z]{4,}/.test(date) && !/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(date)) {
            return date; // Return the original string for transparency
        }
        
        const parsedDate = new Date(date);

        // Check if parsing resulted in a valid date
        if (isNaN(parsedDate.getTime())) {
            // Not a valid date, return the original string
            return date;
        }

        // Valid date, format it
        return parsedDate.toLocaleDateString();
    }

    // Try to create a Date object
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return 'Invalid date';
        }
        // For dates and numbers, convert and format
        return dateObj.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return typeof date === 'string' ? date : 'Error formatting date';
    }
}