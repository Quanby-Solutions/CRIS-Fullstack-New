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