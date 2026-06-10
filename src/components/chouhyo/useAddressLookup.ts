"use client";
// 郵便番号→住所検索フック(zipcloud API使用・無料)
import { useState, useCallback } from "react";

export type AddressResult = {
  address1: string; // 都道府県
  address2: string; // 市区町村
  address3: string; // 町域
  fullAddress: string; // 結合した住所
};

/**
 * 郵便番号から住所を検索するカスタムフック
 */
export function useAddressLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupAddress = useCallback(
    async (zipCode: string): Promise<AddressResult | null> => {
      // 郵便番号のフォーマットを整形（ハイフン除去、数字のみ）
      const cleanZip = zipCode.replace(/[^0-9]/g, "");

      // 7桁でなければエラー
      if (cleanZip.length !== 7) {
        setError("郵便番号は7桁の数字で入力してください");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // 日本郵便のzipcloud APIを使用
        const response = await fetch(
          `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`
        );
        const data = await response.json();

        if (data.status !== 200 || !data.results || data.results.length === 0) {
          setError("該当する住所が見つかりませんでした");
          return null;
        }

        const result = data.results[0];
        const addressResult: AddressResult = {
          address1: result.address1 || "", // 都道府県
          address2: result.address2 || "", // 市区町村
          address3: result.address3 || "", // 町域
          fullAddress: `${result.address1}${result.address2}${result.address3}`,
        };

        return addressResult;
      } catch {
        setError("住所の取得に失敗しました");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { lookupAddress, loading, error };
}
