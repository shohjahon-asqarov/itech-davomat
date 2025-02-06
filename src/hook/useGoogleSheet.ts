// src/hooks/useGoogleSheet.ts

import { useEffect, useState } from 'react';
import { fetchDataFromSheet } from '../services/apiService';

// `body` va `header` uchun zarur bo'lgan tiplar
interface UseGoogleSheetResult {
    header: string[];  // Ustun nomlari (thead)
    body: string[][];  // Ma'lumotlar (tbody)
    loading: boolean;
    error: string | null;
}

const useGoogleSheet = (sheetId: string): UseGoogleSheetResult => {
    const [header, setHeader] = useState<string[]>([]);    // Ustun nomlarini saqlash
    const [body, setBody] = useState<string[][]>([]);      // Ma'lumotlarni saqlash
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSheetData = async () => {
            try {
                const result = await fetchDataFromSheet(sheetId);

                if (Array.isArray(result) && result.length > 0) {
                    setHeader(result[0]);  // Birinchi qatorni ustun nomlari sifatida saqlaymiz
                    setBody(result.slice(1));  // Qolganlarini ma'lumot sifatida saqlaymiz
                }

                setLoading(false);
            } catch (err) {
                setError('Ma\'lumotni olishda xato yuz berdi');
                setLoading(false);
            }
        };

        fetchSheetData();
    }, [sheetId]);  // `sheetId` o'zgarganda yana ma'lumotlarni olish

    return { header, body, loading, error };  // `header` va `body` qaytaramiz
};

export default useGoogleSheet;
