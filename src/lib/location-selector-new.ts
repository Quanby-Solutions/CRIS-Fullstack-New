export interface LocationSelectorProps {
    provinceFieldName?: string;
    municipalityFieldName?: string;
    barangayFieldName?: string;
    provinceLabel?: string;
    municipalityLabel?: string;
    barangayLabel?: string;
    isNCRMode?: boolean;
    showBarangay?: boolean;
    provincePlaceholder?: string;
    municipalityPlaceholder?: string;
    barangayPlaceholder?: string;
    onProvinceChange?: (province: string) => void;
    onMunicipalityChange?: (municipality: string) => void;
    onBarangayChange?: (barangay: string) => void;
    formItemClassName?: string;
    formLabelClassName?: string;
}