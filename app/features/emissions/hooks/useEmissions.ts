"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addEmission as addEmissionService,
  getEmissionErrorMessage,
  listEmissions,
} from "../services/emissions.service.ts";
import type {
  CreateEmissionInput,
  EmissionMeasurement,
} from "../types/emissions.types.ts";

export interface UseEmissionsResult {
  data: EmissionMeasurement[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  addEmission: (input: CreateEmissionInput) => Promise<EmissionMeasurement | null>;
}

export function useEmissions(): UseEmissionsResult {
  const [data, setData] = useState<EmissionMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    async function loadEmissions(): Promise<void> {
      try {
        const measurements = await listEmissions();
        if (isMountedRef.current) {
          setData(measurements);
          setError(null);
        }
      } catch (loadError: unknown) {
        if (isMountedRef.current) {
          setError(getEmissionErrorMessage(loadError));
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadEmissions();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const addEmission = useCallback(async (input: CreateEmissionInput) => {
    if (!isMountedRef.current) {
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createdMeasurement = await addEmissionService(input);
      if (isMountedRef.current) {
        setData((currentData) => [...currentData, createdMeasurement]);
      }
      return createdMeasurement;
    } catch (submissionError: unknown) {
      if (isMountedRef.current) {
        setError(getEmissionErrorMessage(submissionError));
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, []);

  return { data, isLoading, isSubmitting, error, addEmission };
}
