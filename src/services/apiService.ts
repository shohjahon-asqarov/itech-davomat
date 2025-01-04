// src/services/apiService.ts

import axios, { AxiosError } from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY!;
const RANGE = import.meta.env.VITE_RANGE!;


interface SheetData {
    values: string[][];
}

export const fetchDataFromSheet = async (sheetId: string): Promise<string[][]> => {
    try {
        const response = await axios.get<SheetData>(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${RANGE}?key=${API_KEY}`)
        return response.data.values;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error(`Error: ${axiosError.message}`);
            throw new Error(`API Error: ${axiosError.message}`);
        } else {
            console.error(`Unexpected Error: ${error}`);
            throw new Error(`Unexpected Error: ${error}`);
        }
    }
};
