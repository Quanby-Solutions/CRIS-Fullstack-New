import { Prisma } from '@prisma/client';

/**
 * Parse a value to a JSON-compatible format for Prisma JsonValue
 * @param value Any value that needs to be stored as a JSON value
 * @returns A value that's compatible with Prisma.JsonValue (string, number, boolean, null, or object)
 */
export const parseJsonValue = (value: any): Prisma.JsonValue => {
    // Handle null/undefined case
    if (value === null || value === undefined) {
        return null;
    }

    // Handle Date objects - convert to ISO string
    if (value instanceof Date) {
        return value.toISOString();
    }

    // Handle strings, numbers, and booleans directly (these are already valid JSON values)
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    // Handle objects and arrays - ensure they're JSON serializable
    if (typeof value === 'object') {
        try {
            // Test if object is serializable
            JSON.stringify(value);
            return value;
        } catch (e) {
            console.error('Object could not be serialized to JSON:', e);
            return null;
        }
    }

    // Fall back to string for any other type
    return String(value);
};

/**
 * Parse a JSON value back to a Date object if it's a date string
 * @param value A value from a Prisma.JsonValue field
 * @returns A Date object if the input is a valid date string, otherwise the original value
 */
export const parseJsonToDate = (value: any): Date | any => {
    // If null or undefined, return as is
    if (value === null || value === undefined) {
        return value;
    }

    // If it's already a Date object, return it
    if (value instanceof Date) {
        return value;
    }

    // If it's a string, check if it looks like an ISO date
    if (typeof value === 'string') {
        // ISO date strings typically contain T and Z or timezone offset
        const isIsoDateString = value.includes('T') && (value.includes('Z') || value.includes('+') || value.includes('-'));

        // YYYY-MM-DD format (common date format)
        const isSimpleDateString = /^\d{4}-\d{2}-\d{2}$/.test(value);

        if (isIsoDateString || isSimpleDateString) {
            try {
                const date = new Date(value);
                // Check if valid date (not Invalid Date)
                if (!isNaN(date.getTime())) {
                    return date;
                }
            } catch (e) {
                // If parsing fails, return original value
                console.error('Failed to parse date string:', e);
            }
        }

        return value;
    }

    // For any other type, return as is
    return value;
};